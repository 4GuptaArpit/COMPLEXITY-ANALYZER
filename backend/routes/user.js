import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  try {
    res.status(200).json({
      id: req.user._id,
      contact: req.user.contact,
      tier: req.user.tier,
      tokens: req.user.tokens,
      isAdmin: req.user.isAdmin,
      signupAt: req.user.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error retrieving profile" });
  }
});

router.patch("/password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new passwords are required" });
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
    console.error(error);
    res.status(500).json({ error: "Server error updating password" });
  }
});

export default router;
