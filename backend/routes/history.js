import express from "express";
import History from "../models/History.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(req.user.tier === "premium" ? 30 : 20);

    res.status(200).json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching history" });
  }
});

import User from "../models/User.js";

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
    quiz,
    tokensUsed
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
      tokensUsed: tokensUsed || 0,
    });

    if (tokensUsed > 0) {
      const user = await User.findById(req.user._id);
      if (user && user.tokens >= tokensUsed) {
        user.tokens -= tokensUsed;
        await user.save();
      }
    }

    res.status(201).json(newItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error saving history" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ error: "History log not found" });
    }
    await item.deleteOne();
    res.status(200).json({ message: "History log deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error deleting history" });
  }
});

router.patch("/:id/tokensUsed", protect, async (req, res) => {
  try {
    const item = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ error: "History log not found" });
    }
    item.tokensUsed = 1;
    await item.save();
    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating tokensUsed field" });
  }
});

export default router;
