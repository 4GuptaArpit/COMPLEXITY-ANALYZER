import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      if (!process.env.JWT_SECRET) {
        console.error("FATAL: JWT_SECRET environment variable is missing.");
        return res.status(500).json({ error: "Server authentication configuration error." });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ error: "User session expired or not found. Please log in again." });
      }

      return next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Session expired. Please log in again." });
      }
      return res.status(401).json({ error: "Not authorized, token verification failed." });
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required. No token provided." });
  }
};
