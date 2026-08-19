import express from "express";
import History from "../models/History.js";
import { protect } from "../middleware/auth.js";
import { validateHistory } from "../middleware/validate.js";

const router = express.Router();

// GET /api/history/leaderboard — Public aggregate analytics & community algorithm trends
router.get("/leaderboard", async (req, res) => {
  try {
    const [totalAnalyses, topLanguages, complexityBreakdown, popularAlgorithms] =
      await Promise.all([
        History.countDocuments(),
        History.aggregate([
          { $group: { _id: "$language", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
        History.aggregate([
          { $group: { _id: "$timeComplexity", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
        History.aggregate([
          {
            $group: {
              _id: "$name",
              count: { $sum: 1 },
              language: { $first: "$language" },
              timeComplexity: { $first: "$timeComplexity" },
              spaceComplexity: { $first: "$spaceComplexity" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
      ]);

    res.status(200).json({
      totalAnalyses,
      topLanguages: topLanguages.map((item) => ({
        language: item._id || "javascript",
        count: item.count,
      })),
      complexityBreakdown: complexityBreakdown.map((item) => ({
        complexity: item._id || "O(N)",
        count: item.count,
      })),
      popularAlgorithms: popularAlgorithms.map((item) => ({
        name: item._id || "Algorithm Sandbox",
        count: item.count,
        language: item.language,
        timeComplexity: item.timeComplexity,
        spaceComplexity: item.spaceComplexity,
      })),
    });
  } catch (error) {
    console.error("Fetch leaderboard stats error:", error);
    res.status(500).json({ error: "Server error calculating leaderboard statistics." });
  }
});

// GET /api/history — Return user history logs (up to 50)
router.get("/", protect, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(history);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ error: "Server error fetching history." });
  }
});

// POST /api/history — Save analysis log with validation
router.post("/", protect, validateHistory, async (req, res) => {
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
  } = req.body;

  try {
    const newItem = await History.create({
      userId: req.user._id,
      name: name.trim().slice(0, 100),
      language: language.trim().slice(0, 50),
      timeComplexity: timeComplexity.trim().slice(0, 50),
      spaceComplexity: spaceComplexity.trim().slice(0, 50),
      code: code.slice(0, 100000),
      optimizedCode: optimizedCode ? optimizedCode.slice(0, 100000) : "",
      optimizationExplanation: optimizationExplanation ? optimizationExplanation.slice(0, 10000) : "",
      explanation: explanation ? explanation.slice(0, 10000) : "",
      heatmap: heatmap || {},
      simulation: Array.isArray(simulation) ? simulation.slice(0, 50) : [],
      quiz: Array.isArray(quiz) ? quiz.slice(0, 20) : [],
    });

    res.status(201).json(newItem);
  } catch (error) {
    console.error("Save history error:", error);
    res.status(500).json({ error: "Server error saving history." });
  }
});

// DELETE /api/history/:id — Delete history log
router.delete("/:id", protect, async (req, res) => {
  try {
    const item = await History.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) {
      return res.status(404).json({ error: "History log not found." });
    }
    await item.deleteOne();
    res.status(200).json({ message: "History log deleted successfully." });
  } catch (error) {
    console.error("Delete history error:", error);
    res.status(500).json({ error: "Server error deleting history." });
  }
});

export default router;
