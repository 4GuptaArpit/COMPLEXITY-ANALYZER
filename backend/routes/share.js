import express from "express";
import crypto from "crypto";
import Share from "../models/Share.js";
import { validateShare } from "../middleware/validate.js";

const router = express.Router();

// POST /api/share - Create a shareable link snapshot
router.post("/", validateShare, async (req, res) => {
  const { code, language, timeComplexity, spaceComplexity, explanation, optimizedCode, optimizationExplanation, heatmap } = req.body;

  try {
    const shortId = crypto.randomBytes(4).toString("hex"); // e.g. "a3f89b1c"

    const newShare = await Share.create({
      shortId,
      code: code.slice(0, 100000),
      language: language.slice(0, 50),
      timeComplexity: timeComplexity.slice(0, 50),
      spaceComplexity: spaceComplexity.slice(0, 50),
      explanation: explanation ? explanation.slice(0, 10000) : "",
      optimizedCode: optimizedCode ? optimizedCode.slice(0, 100000) : "",
      optimizationExplanation: optimizationExplanation ? optimizationExplanation.slice(0, 10000) : "",
      heatmap: heatmap || {},
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
  const shortId = req.params.id;
  if (!shortId || typeof shortId !== "string" || shortId.length > 20) {
    return res.status(400).json({ error: "Invalid share identifier." });
  }

  try {
    const share = await Share.findOne({ shortId: shortId.trim() });
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
