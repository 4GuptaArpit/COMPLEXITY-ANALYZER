import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/user/profile — Return authenticated user profile
router.get("/profile", protect, async (req, res) => {
  try {
    res.status(200).json({
      id: req.user._id,
      name: req.user.name || "",
      contact: req.user.contact,
      github: req.user.github || "",
      bio: req.user.bio || "",
      tier: req.user.tier,
      tokens: req.user.tokens,
      isAdmin: req.user.isAdmin,
      signupAt: req.user.createdAt,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: "Server error retrieving profile" });
  }
});

// PATCH /api/user/profile — Update user profile details (Name, GitHub handle, Bio)
router.patch("/profile", protect, async (req, res) => {
  const { name, github, bio } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found." });
    }

    if (name !== undefined) user.name = name.trim();
    if (github !== undefined) user.github = github.trim();
    if (bio !== undefined) user.bio = bio.trim();

    await user.save();

    res.status(200).json({
      message: "Profile details updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        contact: user.contact,
        github: user.github,
        bio: user.bio,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
        signupAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Server error updating user profile" });
  }
});

// PATCH /api/user/password — Change account password
router.patch("/password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }

  try {
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ error: "Server error updating password" });
  }
});

export default router;
