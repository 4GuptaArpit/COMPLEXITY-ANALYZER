import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/purchase", protect, async (req, res) => {
  const { option } = req.body;

  if (!option || (option !== "subscription" && option !== "tokens")) {
    return res.status(400).json({ error: "Invalid purchase option selected" });
  }

  try {
    const user = await User.findById(req.user._id);

    if (option === "subscription") {
      user.tier = "premium";
      user.tokens = 70;
    } else {
      user.tokens += 10;
    }

    await user.save();

    res.status(200).json({
      message: option === "subscription" ? "Subscription activated! Added 70 tokens." : "Added 10 tokens!",
      user: {
        id: user._id,
        contact: user.contact,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error processing payment purchase" });
  }
});

router.patch("/deduct-token", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.tokens <= 0) {
      return res.status(400).json({ error: "No simulation tokens remaining." });
    }
    user.tokens -= 1;
    await user.save();
    res.status(200).json({
      message: "1 token deducted successfully.",
      user: {
        id: user._id,
        contact: user.contact,
        tier: user.tier,
        tokens: user.tokens,
        isAdmin: user.isAdmin,
      }
    });
  } catch (error) {
    console.error("Deduct token error:", error);
    res.status(500).json({ error: "Server error deducting token." });
  }
});

export default router;
