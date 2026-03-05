import React from "react";
import type { Components } from "react-markdown";

export function cleanMd(s: string) {
  return s
    .replace(/\u00a0/g, " ")
    .replace(/^(\s*)[–—]\s+/gm, "$1- ")
    .replace(/^(\s*)-\s+/gm, "$1- ")
    .replace(/^\s*\n+/, "")
    .trim();
}

export const mdComponents: Components = {
  p: ({ node, children, ...props }) => <p {...props}>{children}</p>,

  li: ({ node, children, ...props }) => {
    // on force un type large pour accepter ce que JSX peut produire
    const arr = React.Children.toArray(children) as unknown[];

    const firstIdx = arr.findIndex((n) => {
      if (n == null) return false;
      if (typeof n === "string") return n.trim() !== "";
      return true;
    });

    let head: unknown = firstIdx >= 0 ? arr[firstIdx] : null;
    const tail = firstIdx >= 0 ? (arr.slice(firstIdx + 1) as React.ReactNode[]) : [];

    // Si le premier élément est un <p>, on "déplie" son contenu
    if (React.isValidElement(head) && head.type === "p") {
      const el = head as React.ReactElement<{ children?: React.ReactNode }>;
      head = el.props.children ?? null;
    }

    const mergedStyle: React.CSSProperties = {
      ...(props.style as React.CSSProperties),
      margin: 0,
      display: "list-item",
      listStylePosition: "outside",
    };

    return (
      <li {...props} style={mergedStyle}>
        <span style={{ display: "inline" }}>{head as React.ReactNode}</span>
        {tail as React.ReactNode}
      </li>
    );
  },
};
