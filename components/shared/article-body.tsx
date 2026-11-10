"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Block =
  | { type: "p"; lines: string[] }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

const HTML_TAG = /<\/?[a-z][^>]*>/gi;

function normalize(body: string): string[] {
  return body
    .replace(/\r\n?/g, "\n")
    .replace(HTML_TAG, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/g, ""));
}

function parseBlocks(body: string): Block[] {
  const lines = normalize(body);
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: Block | null = null;

  const flushParagraph = () => {
    const text = paragraph.filter((l) => l.trim().length > 0);
    if (text.length > 0) blocks.push({ type: "p", lines: text });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const marks = heading[1] ?? "#";
      const text = heading[2] ?? "";
      blocks.push({ type: marks.length <= 2 ? "h2" : "h3", text: text.trim() });
      continue;
    }

    if (/^(>|“|")/.test(trimmed) && trimmed.startsWith(">")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: trimmed.replace(/^>\s?/, "") });
      continue;
    }

    const bullet = /^[-*•]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push((bullet[1] ?? "").trim());
      continue;
    }

    const numbered = /^(\d+)[.)]\s+(.*)$/.exec(trimmed);
    if (numbered) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push((numbered[2] ?? "").trim());
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  flushParagraph();
  flushList();
  return blocks;
}

/**
 * Renders inline emphasis without HTML injection. Text is always escaped by
 * React, so article content can never introduce markup or scripts. Supports
 * **bold** and *italic* which appear in existing Bengali content.
 */
function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*\n]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  const pushPlain = (value: string) => {
    // Source content sometimes contains an unmatched emphasis marker. Show
    // the words, never the stray marker characters.
    const cleaned = value.replace(/\*\*/g, "");
    if (cleaned) nodes.push(cleaned);
  };

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) pushPlain(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      nodes.push(<strong key={`b-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      nodes.push(<em key={`i-${key++}`}>{token.slice(1, -1)}</em>);
    } else {
      pushPlain(token);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) pushPlain(text.slice(lastIndex));
  return nodes;
}

export function ArticleBody({ body, className }: { body: string; className?: string }) {
  const blocks = React.useMemo(() => parseBlocks(body ?? ""), [body]);

  if (blocks.length === 0) return null;

  return (
    <div className={cn("prose-news font-bengali", className)}>
      {blocks.map((block, i) => {
        const animation = {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.45, delay: Math.min(i, 8) * 0.03 },
        };

        if (block.type === "h2") {
          return (
            <motion.h2 key={i} {...animation}>
              {renderInline(block.text)}
            </motion.h2>
          );
        }
        if (block.type === "h3") {
          return (
            <motion.h3 key={i} {...animation}>
              {renderInline(block.text)}
            </motion.h3>
          );
        }
        if (block.type === "quote") {
          return (
            <motion.blockquote key={i} {...animation}>
              {renderInline(block.text)}
            </motion.blockquote>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const ListTag = block.type === "ul" ? motion.ul : motion.ol;
          return (
            <ListTag key={i} {...animation}>
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ListTag>
          );
        }
        return (
          <motion.p key={i} {...animation}>
            {block.lines.map((line, j) => (
              <React.Fragment key={j}>
                {j > 0 && <br />}
                {renderInline(line)}
              </React.Fragment>
            ))}
          </motion.p>
        );
      })}
    </div>
  );
}
