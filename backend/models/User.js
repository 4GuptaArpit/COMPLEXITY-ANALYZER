import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    contact: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },
    github: {
      type: String,
      default: "",
      trim: true,
      maxlength: 60,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
    tier: {
      type: String,
      enum: ["anonymous", "free", "admin"],
      default: "free",
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
