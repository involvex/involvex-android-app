/**
 * StatsCard Component
 * Displays key metrics with hover effects and animations
 */

import { useState } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: "code" | "package" | "star";
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const iconMap: Record<string, string> = {
    code: "</>",
    package: "npm",
    star: "★",
  };

  return (
    <div
      style={{
        ...styles.card,
        boxShadow: isHovered
          ? "0 0 20px rgba(0, 255, 65, 0.3)"
          : "0 0 0 rgba(0, 255, 65, 0)",
        borderColor: isHovered
          ? "var(--color-primary)"
          : "var(--color-dark-green)",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <span
          className="hacker-text"
          style={{
            ...styles.icon,
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          {iconMap[icon]}
        </span>
      </div>
      <div className="hacker-text" style={styles.value}>
        {value}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid var(--color-dark-green)",
    backgroundColor: "var(--color-darker-green)",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    flex: 1,
    minWidth: "200px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    borderRadius: "8px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "var(--color-text-grey)",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  icon: {
    color: "var(--color-accent-green)",
    fontWeight: "bold",
    fontSize: "1.2rem",
    transition: "transform 0.3s ease",
  },
  value: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
};
