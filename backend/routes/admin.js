import express from "express";
import User from "../models/User.js";
import History from "../models/History.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching users directory" });
  }
});

router.patch("/users/:id/tier", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.tier = user.tier === "premium" ? "free" : "premium";
    user.tokens = user.tier === "premium" ? 70 : 0;
    await user.save();

    res.status(200).json({
      message: `Tier toggled to ${user.tier.toUpperCase()}`,
      user: {
        id: user._id,
        contact: user.contact,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error toggling user tier" });
  }
});

router.patch("/users/:id/tokens", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.tokens += 10;
    await user.save();

    res.status(200).json({
      message: "Added 10 tokens successfully",
      user: {
        id: user._id,
        contact: user.contact,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error adding tokens to user" });
  }
});

router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Deletion denied. Admin cannot delete their own active account." });
    }

    await History.deleteMany({ userId: user._id });
    await user.deleteOne();
    res.status(200).json({ message: "User account and associated history deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error deleting user account" });
  }
});

export default router;

