import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    timeComplexity: {
      type: String,
      required: true,
    },
    spaceComplexity: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
    },
    optimizedCode: {
      type: String,
    },
    optimizationExplanation: {
      type: String,
    },
    heatmap: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: auto-delete shared links after 30 days
shareSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Share = mongoose.model("Share", shareSchema);
export default Share;
