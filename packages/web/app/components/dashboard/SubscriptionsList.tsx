/**
 * SubscriptionsList Component
 * Displays user subscriptions with action menus
 */

import type { Subscription } from "@involvex/shared";
import { useState } from "react";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

function SubscriptionCard({ sub }: { sub: Subscription }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleView = () => {
    alert(`View ${sub.name}`);
  };

  const handleShare = () => {
    alert(`Share ${sub.name}`);
  };

  const handleRemove = () => {
    if (confirm(`Remove ${sub.name} from subscriptions?`)) {
      // In production, call API to remove subscription
      alert(`Removed ${sub.name}`);
    }
  };

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered && {
          borderColor: "var(--color-primary)",
          boxShadow: "0 0 15px rgba(0, 255, 65, 0.2)",
          transform: "translateY(-2px)",
        }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardContent}>
        <div>
          <div className="hacker-text" style={styles.cardTitle}>
            {sub.name}
          </div>
          <div style={styles.cardMeta}>
            {sub.type === "github" ? "📦 GitHub" : "📦 npm"} • Subscribed{" "}
            {new Date(sub.subscribed_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        {sub.is_active && <span style={styles.activeBadge}>ACTIVE</span>}
      </div>

      {/* Action Menu (appears on hover) */}
      {isHovered && (
        <div style={styles.actionMenu}>
          <button style={styles.actionButton} onClick={handleView}>
            View
          </button>
          <button style={styles.actionButton} onClick={handleShare}>
            Share
          </button>
          <button
            style={{ ...styles.actionButton, ...styles.removeButton }}
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyText}>
          No active subscriptions. Start tracking repositories or packages!
        </p>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {subscriptions.map((sub) => (
        <SubscriptionCard key={sub.id} sub={sub} />
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1rem",
    marginTop: "1rem",
  },
  card: {
    border: "1px solid var(--color-dark-green)",
    backgroundColor: "var(--color-dark-grey)",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    transition: "all 0.3s ease",
    borderRadius: "8px",
    position: "relative",
  },
  cardContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: "1rem",
    marginBottom: "0.5rem",
  },
  cardMeta: {
    fontSize: "0.8rem",
    color: "var(--color-text-grey)",
  },
  activeBadge: {
    fontSize: "0.7rem",
    backgroundColor: "var(--color-dark-green)",
    color: "var(--color-primary)",
    padding: "0.25rem 0.6rem",
    borderRadius: "4px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
  },
  actionMenu: {
    display: "flex",
    gap: "0.5rem",
    borderTop: "1px solid var(--color-dark-green)",
    paddingTop: "0.75rem",
    animation: "fadeIn 0.2s ease-in",
  },
  actionButton: {
    flex: 1,
    padding: "0.5rem",
    backgroundColor: "rgba(0, 255, 65, 0.1)",
    border: "1px solid var(--color-primary)",
    borderRadius: "4px",
    color: "var(--color-primary)",
    fontSize: "0.8rem",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },
  removeButton: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderColor: "var(--color-error-red)",
    color: "var(--color-error-red)",
  },
  emptyState: {
    padding: "2rem",
    border: "1px dashed var(--color-dark-green)",
    textAlign: "center",
    borderRadius: "8px",
    marginTop: "1rem",
  },
  emptyText: {
    color: "var(--color-text-grey)",
    fontStyle: "italic",
  },
};
