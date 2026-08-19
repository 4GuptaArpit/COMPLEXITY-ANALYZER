import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "../config/db.js";
import authRoutes from "../routes/auth.js";
import userRoutes from "../routes/user.js";
import historyRoutes from "../routes/history.js";
import feedbackRoutes from "../routes/feedback.js";
import adminRoutes from "../routes/admin.js";
import shareRoutes from "../routes/share.js";
import geminiRoutes from "../routes/gemini.js";

// Startup Environment Validation
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
}

connectDB();

const app = express();

app.use(helmet());

// Strict CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server) or matching allowed list / vercel preview deployments
      if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation: Access from origin is not permitted."));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

// Rate Limiters
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests from this IP, please try again after 15 minutes." },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts. Please wait a few minutes before trying again." },
});

const feedbackLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many feedback submissions from this IP. Please try again later." },
});

app.use("/api/", generalLimiter);
app.use("/api/auth/send-otp", otpLimiter);
app.use("/api/auth/verify-otp", otpLimiter);
app.use("/api/auth/forgot-password", otpLimiter);
app.use("/api/auth/reset-password", otpLimiter);
app.use("/api/feedback", feedbackLimiter);

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/admin", adminRoutes);

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

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} does not exist.` });
});

// Production-safe Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled server error:", err.message || err);
  const status = err.status || 500;
  const message = process.env.NODE_ENV === "production"
    ? "An internal server error occurred. Please try again."
    : err.message || "Internal server error";

  res.status(status).json({
    error: message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`BigO.ai backend server listening on port ${PORT}`);

  // ─── 14-MINUTE AUTO-WAKE KEEP-ALIVE SYSTEM FOR RENDER ───────────────────────
  const serverUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL;
  if (serverUrl) {
    const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes
    const pingUrl = `${serverUrl.replace(/\/$/, "")}/api/health`;

    setInterval(async () => {
      try {
        const response = await fetch(pingUrl);
        console.log(`[Auto-Wake Ping] Keep-alive ping sent to ${pingUrl} — Status: ${response.status}`);
      } catch (err) {
        console.warn(`[Auto-Wake Ping] Ping to self failed:`, err.message);
      }
    }, PING_INTERVAL_MS);

    console.log(`[Auto-Wake] Active! Pinging ${pingUrl} every 14 minutes to prevent Render sleep.`);
  }
});

export default app;
