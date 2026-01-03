import React from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: "code" | "package" | "star";
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  const iconMap: Record<string, string> = {
    code: "</>",
    package: "npm",
    star: "★",
  };

  return (
    <div
      style={{
        border: "1px solid var(--color-dark-green)",
        backgroundColor: "var(--color-darker-green)",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        flex: 1,
        minWidth: "200px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "var(--color-text-grey)",
            fontSize: "0.8rem",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <span
          style={{ color: "var(--color-accent-green)", fontWeight: "bold" }}
        >
          {iconMap[icon]}
        </span>
      </div>
      <div
        style={{ fontSize: "2rem", fontWeight: "bold" }}
        className="hacker-text"
      >
        {value}
      </div>
    </div>
  );
}
