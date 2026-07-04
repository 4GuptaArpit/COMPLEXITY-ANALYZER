import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
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
    code: {
      type: String,
      required: true,
    },
    optimizedCode: {
      type: String,
    },
    optimizationExplanation: {
      type: String,
    },
    explanation: {
      type: String,
    },
    heatmap: {
      type: Map,
      of: String,
    },
    simulation: {
      type: Array,
      default: [],
    },
    quiz: {
      type: Array,
      default: [],
    },
    tokensUsed: {
      type: Number,
      default: 0,
    }
  },
  {
    timestamps: true,
  }
);

const History = mongoose.model("History", historySchema);
export default History;
