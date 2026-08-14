import express from "express";
import History from "../models/History.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/history — Return user history logs (up to 50)
router.get("/", protect, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(history);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ error: "Server error fetching history" });
  }
});

// POST /api/history — Save analysis log
router.post("/", protect, async (req, res) => {
  const {
    name,
    language,
    timeComplexity,
    spaceComplexity,
    code,
    optimizedCode,
    optimizationExplanation,
    explanation,
    heatmap,
    simulation,
    quiz
  } = req.body;

  try {
    const newItem = await History.create({
      userId: req.user._id,
      name,
      language,
      timeComplexity,
      spaceComplexity,
      code,
      optimizedCode,
      optimizationExplanation,
      explanation,
      heatmap,
      simulation,
      quiz,
      tokensUsed: 0,
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Save history error:", error);
    res.status(500).json({ error: "Server error saving history" });
  }
});

// DELETE /api/history/:id — Delete history log
router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ error: "History log not found" });
    }
    await item.deleteOne();
    res.status(200).json({ message: "History log deleted successfully" });
  } catch (error) {
    console.error("Delete history error:", error);
    res.status(500).json({ error: "Server error deleting history" });
  }
});

export default router;
