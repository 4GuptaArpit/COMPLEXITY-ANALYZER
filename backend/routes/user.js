import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import History from "../models/History.js";
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
      isAdmin: req.user.isAdmin,
      signupAt: req.user.createdAt,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ error: "Server error retrieving profile." });
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

    if (name !== undefined && typeof name === "string") user.name = name.trim().slice(0, 100);
    if (github !== undefined && typeof github === "string") user.github = github.trim().slice(0, 60);
    if (bio !== undefined && typeof bio === "string") user.bio = bio.trim().slice(0, 300);

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
        isAdmin: user.isAdmin,
        signupAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Server error updating user profile." });
  }
});

// PATCH /api/user/password — Change account password
router.patch("/password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }

  try {
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ error: "Server error updating password." });
  }
});

// DELETE /api/user/account — Delete user account & all personal history (requires password confirmation)
router.delete("/account", protect, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password confirmation is required to delete your account." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User account not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password. Account deletion aborted." });
    }

    // Cascade delete associated history logs
    await History.deleteMany({ userId: user._id });
    await user.deleteOne();

    res.status(200).json({ message: "Your account and associated history have been permanently deleted." });
  } catch (error) {
    console.error("Account Deletion Error:", error);
    res.status(500).json({ error: "Server error deleting account." });
  }
});

export default router;
