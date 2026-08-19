// Input validation middleware to guard against unbounded payloads, malformed types, and storage attacks

export const validateHistory = (req, res, next) => {
  const { name, language, timeComplexity, spaceComplexity, code } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Code content is required." });
  }
  if (code.length > 100000) {
    return res.status(400).json({ error: "Code snippet exceeds maximum allowed size (100,000 characters)." });
  }

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Algorithm name is required." });
  }
  if (name.length > 100) {
    return res.status(400).json({ error: "Algorithm name must not exceed 100 characters." });
  }

  if (!language || typeof language !== "string" || language.length > 50) {
    return res.status(400).json({ error: "Valid language identifier is required (max 50 chars)." });
  }

  if (!timeComplexity || typeof timeComplexity !== "string" || timeComplexity.length > 50) {
    return res.status(400).json({ error: "Valid time complexity is required." });
  }

  if (!spaceComplexity || typeof spaceComplexity !== "string" || spaceComplexity.length > 50) {
    return res.status(400).json({ error: "Valid space complexity is required." });
  }

  next();
};

export const validateFeedback = (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || typeof name !== "string" || !name.trim() || name.length > 100) {
    return res.status(400).json({ error: "Name is required and must be under 100 characters." });
  }

  if (!email || typeof email !== "string" || !email.trim() || email.length > 150) {
    return res.status(400).json({ error: "Valid email address is required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }

  if (!message || typeof message !== "string" || !message.trim() || message.length > 2000) {
    return res.status(400).json({ error: "Message is required and must not exceed 2,000 characters." });
  }

  next();
};

export const validateShare = (req, res, next) => {
  const { code, language, timeComplexity, spaceComplexity } = req.body;

  if (!code || typeof code !== "string" || !code.trim()) {
    return res.status(400).json({ error: "Code is required to generate a snapshot." });
  }

  if (code.length > 100000) {
    return res.status(400).json({ error: "Code snippet exceeds maximum share size (100,000 characters)." });
  }

  if (!language || typeof language !== "string" || language.length > 50) {
    return res.status(400).json({ error: "Valid programming language is required." });
  }

  if (!timeComplexity || typeof timeComplexity !== "string" || timeComplexity.length > 50) {
    return res.status(400).json({ error: "Valid time complexity is required." });
  }

  if (!spaceComplexity || typeof spaceComplexity !== "string" || spaceComplexity.length > 50) {
    return res.status(400).json({ error: "Valid space complexity is required." });
  }

  next();
};
