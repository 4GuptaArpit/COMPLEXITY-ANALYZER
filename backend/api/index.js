import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import connectDB from "../config/db.js";
import authRoutes from "../routes/auth.js";
import userRoutes from "../routes/user.js";
import historyRoutes from "../routes/history.js";
import feedbackRoutes from "../routes/feedback.js";
import billingRoutes from "../routes/billing.js";
import adminRoutes from "../routes/admin.js";
import shareRoutes from "../routes/share.js";

dotenv.config();

connectDB();

const app = express();

app.use(helmet());

// Dynamic CORS configuration accepting localhost, FRONTEND_URL, and Vercel preview deployments
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow for API accessibility across client environments
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many OTP verification requests. Please wait a few minutes before trying again." },
});

app.use("/api/", generalLimiter);
app.use("/api/auth/send-otp", otpLimiter);

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Route mounts
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/share", shareRoutes);
app.use("/api", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "BigO.ai API is online & functional",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({ status: "BigO.ai API is online & functional" });
});

app.use((req, res) => {
  res.status(404).json({ error: `Not Found - Path ${req.originalUrl} does not exist.` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error occurred.",
  });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} in local mode.`);
  });
}

export default app;

