import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      maxlength: 100000,
    },
    language: {
      type: String,
      required: true,
      maxlength: 50,
    },
    timeComplexity: {
      type: String,
      required: true,
      maxlength: 50,
    },
    spaceComplexity: {
      type: String,
      required: true,
      maxlength: 50,
    },
    explanation: {
      type: String,
      maxlength: 10000,
    },
    optimizedCode: {
      type: String,
      maxlength: 100000,
    },
    optimizationExplanation: {
      type: String,
      maxlength: 10000,
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
