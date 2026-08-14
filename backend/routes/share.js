import express from "express";
import crypto from "crypto";
import Share from "../models/Share.js";

const router = express.Router();

// POST /api/share - Create a shareable link snapshot
router.post("/", async (req, res) => {
  const { code, language, timeComplexity, spaceComplexity, explanation, optimizedCode, optimizationExplanation, heatmap } = req.body;

  if (!code || !language || !timeComplexity || !spaceComplexity) {
    return res.status(400).json({ error: "Code, language, and complexity attributes are required to share." });
  }

  try {
    const shortId = crypto.randomBytes(4).toString("hex"); // e.g. "a3f89b1c"

    const newShare = await Share.create({
      shortId,
      code,
      language,
      timeComplexity,
      spaceComplexity,
      explanation,
      optimizedCode,
      optimizationExplanation,
      heatmap,
    });

    res.status(201).json({
      shortId: newShare.shortId,
      shareUrl: `/share/${newShare.shortId}`,
    });
  } catch (error) {
    console.error("Create share link error:", error);
    res.status(500).json({ error: "Server error generating share link." });
  }
});

// GET /api/share/:id - Retrieve shared analysis snapshot
router.get("/:id", async (req, res) => {
  try {
    const share = await Share.findOne({ shortId: req.params.id });
    if (!share) {
      return res.status(404).json({ error: "Shared analysis not found or link has expired." });
    }
    res.status(200).json(share);
  } catch (error) {
    console.error("Fetch share link error:", error);
    res.status(500).json({ error: "Server error retrieving shared analysis." });
  }
});

export default router;
