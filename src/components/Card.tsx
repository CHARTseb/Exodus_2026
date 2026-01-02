import React from "react";

export function Card(props: { title: string; children: React.ReactNode }) {
  return (
    <section style={styles.card}>
      <h2 style={styles.h2}>{props.title}</h2>
      <div style={styles.body}>{props.children}</div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "white",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
    marginBottom: 14,
    border: "1px solid rgba(0,0,0,.06)"
  },
  h2: { margin: 0, fontSize: 16 },
  body: { marginTop: 10, lineHeight: 1.5, whiteSpace: "pre-wrap" }
};
