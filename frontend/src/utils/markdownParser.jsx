
/**
 * Parses inline markdown symbols (**bold** and `code`) into React elements.
 */
const parseInlineMarkdown = (text) => {
  if (!text) return "";
  
  // Regex to split text by **bold** or `code` blocks
  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = text.split(regex);
  
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-text-main">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code 
          key={i} 
          className="bg-black/25 dark:bg-black/50 border border-border-color px-1.5 py-0.5 rounded text-[11px] font-mono text-secondary"
        >
          {part.slice(1, -1)}
        </code>
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
  
  const lines = text.split("\n");
  let listItems = [];
  const blocks = [];

  const flushList = (key) => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-2 flex flex-col gap-1 text-[13.5px] text-text-muted">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Headers (H2) e.g., "# Header"
    if (trimmed.startsWith("# ")) {
      flushList(index);
      blocks.push(
        <h2 
          key={index} 
          className="text-[14.5px] font-bold text-text-main mt-4 mb-2 border-b border-border-color pb-1.5 uppercase tracking-wider text-primary"
        >
          {parseInlineMarkdown(trimmed.substring(2))}
        </h2>
      );
      return;
    }

    // Headers (H3) e.g., "## Header"
    if (trimmed.startsWith("## ")) {
      flushList(index);
      blocks.push(
        <h3 
          key={index} 
          className="text-[13.5px] font-bold text-text-main mt-3.5 mb-1.5 border-b border-border-color/60 pb-1 uppercase tracking-wider text-secondary"
        >
          {parseInlineMarkdown(trimmed.substring(3))}
        </h3>
      );
      return;
    }

    // Subheaders (H4) e.g., "### Subheader"
    if (trimmed.startsWith("### ")) {
      flushList(index);
      blocks.push(
        <h4 
          key={index} 
          className="text-[13px] font-bold text-secondary mt-3 mb-1 flex items-center gap-1.5"
        >
          {parseInlineMarkdown(trimmed.substring(4))}
        </h4>
      );
      return;
    }

    // List items e.g., "- item" or "* item" or "1. item"
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || /^\d+\.\s/.test(trimmed)) {
      const content = trimmed.startsWith("- ") || trimmed.startsWith("* ") 
        ? trimmed.substring(2) 
        : trimmed.replace(/^\d+\.\s/, "");
        
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
      blocks.push(<div key={index} className="h-1.5" />);
      return;
    }

    // Standard paragraph block
    flushList(index);
    blocks.push(
      <p key={index} className="text-[13.5px] text-text-muted leading-relaxed my-0.5">
        {parseInlineMarkdown(line)}
      </p>
    );
  });

  // Flush any remaining list items
  flushList(lines.length);

  return <div className="flex flex-col gap-1">{blocks}</div>;
};
