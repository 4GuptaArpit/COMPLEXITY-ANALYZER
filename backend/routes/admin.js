import express from "express";
import User from "../models/User.js";
import History from "../models/History.js";
import Feedback from "../models/Feedback.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

// GET /api/admin/stats — Aggregate analytics metrics across system collections
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalAnalyses,
      analyses24h,
      totalFeedback,
      languageDistribution,
      complexityDistribution,
    ] = await Promise.all([
      User.countDocuments(),
      History.countDocuments(),
      History.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Feedback.countDocuments(),
      // Group by language
      History.aggregate([
        { $group: { _id: "$language", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Group by time complexity class
      History.aggregate([
        { $group: { _id: "$timeComplexity", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    res.status(200).json({
      totalUsers,
      totalAnalyses,
      analyses24h,
      totalFeedback,
      languageDistribution: languageDistribution.map((item) => ({
        language: item._id || "unknown",
        count: item.count,
      })),
      complexityDistribution: complexityDistribution.map((item) => ({
        complexity: item._id || "O(N)",
        count: item.count,
      })),
    });
  } catch (error) {
    console.error("Admin fetch stats error:", error);
    res.status(500).json({ error: "Server error aggregating system statistics." });
  }
});

// GET /api/admin/users — Paginated directory of registered users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    res.status(200).json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Admin fetch users error:", error);
    res.status(500).json({ error: "Server error fetching users directory." });
  }
});

// PATCH /api/admin/users/:id/tier — Toggle user role/tier
router.patch("/users/:id/tier", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.tier = user.tier === "admin" ? "free" : "admin";
    if (user.tier === "admin") {
      user.isAdmin = true;
    } else {
      user.isAdmin = false;
    }
    await user.save();

    res.status(200).json({
      message: `Role toggled to ${user.tier.toUpperCase()}`,
      user: {
        id: user._id,
        contact: user.contact,
        tier: user.tier,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Admin toggle tier error:", error);
    res.status(500).json({ error: "Server error toggling user tier." });
  }
});

// DELETE /api/admin/users/:id — Delete user account & cascade history
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Deletion denied. Admin cannot delete their own active session account." });
    }

    await History.deleteMany({ userId: user._id });
    await user.deleteOne();
    res.status(200).json({ message: "User account and associated history deleted successfully." });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ error: "Server error deleting user account." });
  }
});

export default router;
