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
    background: "var(--card)",
    color: "var(--text)",               // 👈 CRUCIAL
    borderRadius: "var(--radius)",
    padding: 16,
    marginBottom: 14,
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  h2: {
    margin: 0,
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  body: {
    marginTop: 10,
    lineHeight: 1.45,
  },
};

