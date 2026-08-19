import React from "react";

/**
 * Normalizes LaTeX math syntax into clean Unicode and readable mathematical expressions.
 */
function cleanLatexMath(text) {
  if (!text || typeof text !== "string") return "";

  return text
    // Remove enclosing math delimiters ($$math$$ or $math$)
    .replace(/\$\$(.*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1")
    // Fractions: \frac{a}{b} -> (a / b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)")
    // Common Greek and Big-O symbols
    .replace(/\\Theta\b/g, "Θ")
    .replace(/\\Omega\b/g, "Ω")
    .replace(/\\alpha\b/g, "α")
    .replace(/\\beta\b/g, "β")
    .replace(/\\lambda\b/g, "λ")
    .replace(/\\mu\b/g, "μ")
    // Mathematical operators
    .replace(/\\cdot\b/g, " · ")
    .replace(/\\times\b/g, " × ")
    .replace(/\\approx\b/g, " ≈ ")
    .replace(/\\neq\b/g, " ≠ ")
    .replace(/\\le\b|\\leq\b/g, " ≤ ")
    .replace(/\\ge\b|\\geq\b/g, " ≥ ")
    .replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, "∑($1 to $2)")
    .replace(/\\sum\b/g, "∑")
    .replace(/\\prod\b/g, "∏")
    .replace(/\\infty\b/g, "∞")
    .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
    // Superscripts and exponents
    .replace(/\^2\b/g, "²")
    .replace(/\^3\b/g, "³")
    .replace(/\^\{([^}]+)\}/g, "^$1")
    // Subscripts
    .replace(/_\{([^}]+)\}/g, "_$1")
    // Clean up remaining escaped braces and backslashes
    .replace(/\\\{/g, "{")
    .replace(/\\\}/g, "}")
    .replace(/\\/g, "");
}

/**
 * Parses inline markdown symbols (**bold**, *italic*, and `code`) into React elements.
 */
const parseInlineMarkdown = (rawText) => {
  if (!rawText) return "";

  // First convert LaTeX math syntax into clean Unicode
  const text = cleanLatexMath(rawText);

  // Regex to match `code`, **bold**, *italic*, or plain text
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={i}
          className="bg-black/25 dark:bg-black/50 border border-border-color/60 px-1.5 py-0.5 rounded text-[11px] font-mono text-secondary"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={i} className="font-bold text-text-main">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      return (
        <em key={i} className="italic text-text-main/90">
          {part.slice(1, -1)}
        </em>
      );
    }

    return part;
  });
};

/**
 * Converts a raw markdown string into a styled list of React block elements.
 */
export const parseMarkdown = (text) => {
  if (!text) return null;

  // Split into lines
  const lines = text.split("\n");
  let listItems = [];
  const blocks = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul
          key={`list-${key}`}
          className="list-disc pl-5 my-1.5 flex flex-col gap-1 text-[12.5px] text-text-muted leading-relaxed"
        >
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Headers H1 / H2: "# Title" or "## Section"
    if (/^#{1,2}\s+/.test(trimmed)) {
      flushList(index);
      const titleText = trimmed.replace(/^#{1,2}\s+/, "");
      blocks.push(
        <h3
          key={index}
          className="text-xs font-bold text-text-main mt-3 mb-1.5 border-b border-border-color/60 pb-1 uppercase tracking-wider text-accent-primary"
        >
          {parseInlineMarkdown(titleText)}
        </h3>
      );
      return;
    }

    // Headers H3 / H4 / H5 / H6: "### Subsection" or "#### Sub-item"
    if (/^#{3,6}\s+/.test(trimmed)) {
      flushList(index);
      const titleText = trimmed.replace(/^#{3,6}\s+/, "");
      blocks.push(
        <h4
          key={index}
          className="text-xs font-bold text-purple-400 mt-2.5 mb-1 flex items-center gap-1.5"
        >
          {parseInlineMarkdown(titleText)}
        </h4>
      );
      return;
    }

    // List items: "- item", "* item", "1. item", "• item"
    if (/^([-*•]|\d+\.)\s+/.test(trimmed)) {
      const content = trimmed.replace(/^([-*•]|\d+\.)\s+/, "");
      listItems.push(
        <li key={index} className="leading-relaxed">
          {parseInlineMarkdown(content)}
        </li>
      );
      return;
    }

    // Empty lines
    if (trimmed === "") {
      flushList(index);
      return;
    }

    // Standard paragraph block
    flushList(index);
    blocks.push(
      <p key={index} className="text-xs text-text-muted leading-relaxed my-1">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  });

  // Flush any trailing list items
  flushList(lines.length);

  return <div className="flex flex-col gap-1">{blocks}</div>;
};
