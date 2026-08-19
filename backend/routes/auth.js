import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendOtpEmail } from "../utils/sendOtp.js";

const router = express.Router();

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is missing.");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ── REGISTER (Name, Email, Password) ───────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { name, contact, password } = req.body;

  if (!contact || typeof contact !== "string" || !contact.trim()) {
    return res.status(400).json({ error: "Email address is required." });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be a string of at least 6 characters." });
  }
  if (password.length > 128) {
    return res.status(400).json({ error: "Password exceeds maximum allowable length (128 characters)." });
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
      name: name && typeof name === "string" ? name.trim().slice(0, 100) : "",
      contact: trimmedContact,
      password: passwordHash,
      tier: "free",
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

  if (!contact || typeof contact !== "string" || !password || typeof password !== "string" || !contact.trim()) {
    return res.status(400).json({ error: "Valid email and password are required." });
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

  if (!contact || typeof contact !== "string" || !contact.trim()) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const trimmedContact = contact.trim().toLowerCase();

  if (!isValidEmail(trimmedContact)) {
    return res.status(400).json({ error: "Please enter a valid email address (e.g. user@example.com)." });
  }

  // Cryptographically secure 6-digit OTP
  const otp = crypto.randomInt(100000, 1000000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

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
        isAdmin: !!isAdmin,
      });
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const sent = await sendOtpEmail(trimmedContact, otp);
    if (!sent) {
      return res.status(500).json({ error: "Failed to dispatch OTP email. Please verify Nodemailer configuration." });
    }

    res.status(200).json({ message: "Verification code dispatched successfully." });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Server error sending OTP." });
  }
});

// ── VERIFY OTP (Email) ────────────────────────────────────────────────────────────
router.post("/verify-otp", async (req, res) => {
  const { contact, otp } = req.body;

  if (!contact || typeof contact !== "string" || !otp || typeof otp !== "string" || !contact.trim() || !otp.trim()) {
    return res.status(400).json({ error: "Valid email and verification code are required." });
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
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Server verification error." });
  }
});

// ── FORGOT PASSWORD (Send Reset Code) ─────────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  const { contact } = req.body;

  if (!contact || typeof contact !== "string" || !contact.trim()) {
    return res.status(400).json({ error: "Email address is required." });
  }

  const trimmedContact = contact.trim().toLowerCase();

  if (!isValidEmail(trimmedContact)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  try {
    const user = await User.findOne({ contact: trimmedContact });
    if (!user) {
      // Don't leak user enumeration, but return clean message
      return res.status(200).json({ message: "If an account with this email exists, a password reset code has been sent." });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendOtpEmail(trimmedContact, otp);

    res.status(200).json({ message: "If an account with this email exists, a password reset code has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Server error processing password reset request." });
  }
});

// ── RESET PASSWORD (Verify Code & Set New Password) ───────────────────────────────
router.post("/reset-password", async (req, res) => {
  const { contact, otp, newPassword } = req.body;

  if (
    !contact || typeof contact !== "string" ||
    !otp || typeof otp !== "string" ||
    !newPassword || typeof newPassword !== "string" ||
    !contact.trim() || !otp.trim()
  ) {
    return res.status(400).json({ error: "Valid email, reset code, and new password are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }
  if (newPassword.length > 128) {
    return res.status(400).json({ error: "Password exceeds maximum allowable length (128 characters)." });
  }

  const trimmedContact = contact.trim().toLowerCase();

  try {
    const user = await User.findOne({ contact: trimmedContact });
    if (!user) {
      return res.status(400).json({ error: "Invalid email or reset code." });
    }

    const isMatch = user.otp === otp.trim() && user.otpExpiry && user.otpExpiry > new Date();
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid or expired reset code. Please request a new one." });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      token: generateToken(user._id),
      message: "Password reset successful! You are now logged in.",
      user: {
        id: user._id,
        name: user.name,
        contact: user.contact,
        github: user.github,
        bio: user.bio,
        tier: user.tier,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error resetting password." });
  }
});

export default router;
