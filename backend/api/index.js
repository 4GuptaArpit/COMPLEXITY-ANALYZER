import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import authRoutes from "../routes/auth.js";
import userRoutes from "../routes/user.js";
import historyRoutes from "../routes/history.js";
import feedbackRoutes from "../routes/feedback.js";
import billingRoutes from "../routes/billing.js";
import adminRoutes from "../routes/admin.js";

dotenv.config();

connectDB();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api", adminRoutes);

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
