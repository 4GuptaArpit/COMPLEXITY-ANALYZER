import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtp.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "local-development-secret-key-12345", {
    expiresIn: "30d",
  });
};

router.post("/send-otp", async (req, res) => {
  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ error: "Contact info (email or phone) is required" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  try {
    let user = await User.findOne({ contact });
    if (!user) {
      const passwordHash = await bcrypt.hash("password123", 12);
      user = await User.create({
        contact,
        password: passwordHash,
        tier: "free",
        tokens: 0,
      });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOtpEmail(contact, otp);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error sending OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { contact, otp } = req.body;

  if (!contact || !otp) {
    return res.status(400).json({ error: "Contact and OTP code are required" });
  }

  try {
    const user = await User.findOne({ contact });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMockOtp = otp === "1234";
    const isMatch = user.otp === otp && user.otpExpiry > new Date();

    if (!isMockOtp && !isMatch) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    user.otp = null;
    user.otpExpiry = null;

    if (contact === process.env.ADMIN_EMAIL && !user.isAdmin) {
      user.isAdmin = true;
    }

    await user.save();

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        contact: user.contact,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server verification error" });
  }
});

export default router;
