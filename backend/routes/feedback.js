import express from "express";
import Feedback from "../models/Feedback.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const feedback = await Feedback.create({
      name,
      email,
      message,
    });
    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error saving feedback" });
  }
});

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching feedback" });
  }
});

router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    await feedback.deleteOne();
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error deleting feedback" });
  }
});

export default router;
