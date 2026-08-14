import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtp.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "local-development-secret-key-12345", {
    expiresIn: "30d",
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ── REGISTER (Name, Email, Password) ───────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, contact, password } = req.body;

  if (!contact || !contact.trim()) {
    return res.status(400).json({ error: "Email address is required." });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long." });
  }

  const trimmedContact = contact.trim().toLowerCase();

  if (!isValidEmail(trimmedContact)) {
    return res.status(400).json({ error: "Please enter a valid email address (e.g. user@example.com)." });
  }

  try {
    const existingUser = await User.findOne({ contact: trimmedContact });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists. Please log in." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const isAdmin = process.env.ADMIN_EMAIL && trimmedContact === process.env.ADMIN_EMAIL.toLowerCase();

    const user = await User.create({
      name: name ? name.trim() : "",
      contact: trimmedContact,
      password: passwordHash,
      tier: "free",
      tokens: 0,
      isAdmin: !!isAdmin,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        contact: user.contact,
        github: user.github,
        bio: user.bio,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Server error creating user account." });
  }
});

// ── LOGIN (Email, Password) ────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { contact, password } = req.body;

  if (!contact || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const trimmedContact = contact.trim().toLowerCase();

  try {
    const user = await User.findOne({ contact: trimmedContact });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    if (process.env.ADMIN_EMAIL && trimmedContact === process.env.ADMIN_EMAIL.toLowerCase() && !user.isAdmin) {
      user.isAdmin = true;
      await user.save();
    }

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        contact: user.contact,
        github: user.github,
        bio: user.bio,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server authentication error." });
  }
});

// ── SEND OTP (Email) ──────────────────────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  const { contact } = req.body;

  if (!contact || !contact.trim()) {
    return res.status(400).json({ error: "Email address is required" });
  }

  const trimmedContact = contact.trim().toLowerCase();

  if (!isValidEmail(trimmedContact)) {
    return res.status(400).json({ error: "Please enter a valid email address (e.g. user@example.com)" });
  }

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  try {
    let user = await User.findOne({ contact: trimmedContact });
    if (!user) {
      const randomSecret = crypto.randomBytes(16).toString("hex");
      const passwordHash = await bcrypt.hash(randomSecret, 12);
      const isAdmin = process.env.ADMIN_EMAIL && trimmedContact === process.env.ADMIN_EMAIL.toLowerCase();

      user = await User.create({
        contact: trimmedContact,
        password: passwordHash,
        tier: "free",
        tokens: 0,
        isAdmin: !!isAdmin,
      });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const sent = await sendOtpEmail(trimmedContact, otp);
    if (!sent) {
      return res.status(500).json({ error: "Failed to dispatch OTP email. Please verify Nodemailer/SMTP configuration." });
    }

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Server error sending OTP" });
  }
});

// ── VERIFY OTP (Email) ────────────────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  const { contact, otp } = req.body;

  if (!contact || !otp) {
    return res.status(400).json({ error: "Email and OTP code are required" });
  }

  const trimmedContact = contact.trim().toLowerCase();

  try {
    const user = await User.findOne({ contact: trimmedContact });

    if (!user) {
      return res.status(404).json({ error: "User not found. Please request a new verification code." });
    }

    const isMatch = user.otp === otp.trim() && user.otpExpiry && user.otpExpiry > new Date();

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid or expired verification code. Please request a new one." });
    }

    user.otp = null;
    user.otpExpiry = null;

    if (process.env.ADMIN_EMAIL && trimmedContact === process.env.ADMIN_EMAIL.toLowerCase() && !user.isAdmin) {
      user.isAdmin = true;
    }

    await user.save();

    res.status(200).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        contact: user.contact,
        github: user.github,
        bio: user.bio,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Server verification error" });
  }
});

export default router;
