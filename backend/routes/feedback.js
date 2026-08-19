import express from "express";
import Feedback from "../models/Feedback.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";
import { validateFeedback } from "../middleware/validate.js";

const router = express.Router();

// POST /api/feedback — Public feedback submission with validation
router.post("/", validateFeedback, async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const feedback = await Feedback.create({
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 150),
      message: message.trim().slice(0, 2000),
    });
    res.status(201).json(feedback);
  } catch (error) {
    console.error("Save feedback error:", error);
    res.status(500).json({ error: "Server error saving feedback." });
  }
});

// GET /api/feedback — Admin view all feedback
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error("Fetch feedback error:", error);
    res.status(500).json({ error: "Server error fetching feedback." });
  }
});

// DELETE /api/feedback/:id — Admin delete feedback item
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback item not found." });
    }
    await feedback.deleteOne();
    res.status(200).json({ message: "Feedback deleted successfully." });
  } catch (error) {
    console.error("Delete feedback error:", error);
    res.status(500).json({ error: "Server error deleting feedback." });
  }
});

export default router;
