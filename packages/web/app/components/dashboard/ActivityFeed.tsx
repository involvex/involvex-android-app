/**
 * Activity Feed Widget
 * Displays recent user activity (subscriptions, releases, trending views)
 */

interface Activity {
  id: string;
  type: "subscription" | "release" | "trending";
  itemName: string;
  timestamp: string;
  metadata: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "subscription":
        return "⭐";
      case "release":
        return "📦";
      case "trending":
        return "🔥";
      default:
        return "•";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div style={styles.container}>
      <h3 className="hacker-text" style={styles.title}>
        Recent Activity
      </h3>
      {activities.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No recent activity</p>
        </div>
      ) : (
        <div style={styles.activityList}>
          {activities.map((activity) => (
            <div key={activity.id} style={styles.activityItem}>
              <div style={styles.activityIcon}>{getIcon(activity.type)}</div>
              <div style={styles.activityContent}>
                <p style={styles.activityName}>{activity.itemName}</p>
                <p style={styles.activityMeta}>{activity.metadata}</p>
              </div>
              <span style={styles.activityTime}>
                {formatTimestamp(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "var(--color-dark-grey)",
    border: "1px solid var(--color-primary)",
    borderRadius: "8px",
    padding: "1.5rem",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "0.75rem",
    backgroundColor: "rgba(0, 255, 65, 0.05)",
    border: "1px solid rgba(0, 255, 65, 0.1)",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
  activityIcon: {
    fontSize: "1.5rem",
    minWidth: "2rem",
    textAlign: "center",
  },
  activityContent: {
    flex: 1,
    minWidth: 0,
  },
  activityName: {
    color: "var(--color-primary)",
    fontWeight: "600",
    fontSize: "0.9rem",
    marginBottom: "0.25rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  activityMeta: {
    color: "var(--color-text-grey)",
    fontSize: "0.8rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  activityTime: {
    color: "var(--color-text-grey)",
    fontSize: "0.75rem",
    whiteSpace: "nowrap",
    fontStyle: "italic",
  },
  emptyState: {
    padding: "2rem 0",
    textAlign: "center",
  },
  emptyText: {
    color: "var(--color-text-grey)",
    fontStyle: "italic",
  },
};
