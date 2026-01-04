/**
 * Notifications Widget
 * Displays recent notifications with unread count badge
 */

interface Notification {
  id: string;
  type: "release" | "update" | "info";
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationsWidgetProps {
  notifications: Notification[];
}

export function NotificationsWidget({
  notifications,
}: NotificationsWidgetProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "release":
        return "🚀";
      case "update":
        return "📦";
      case "info":
        return "ℹ️";
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

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 className="hacker-text" style={styles.title}>
          Notifications
        </h3>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount}</span>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No notifications</p>
        </div>
      ) : (
        <div style={styles.notificationList}>
          {notifications.slice(0, 5).map((notif) => (
            <div
              key={notif.id}
              style={{
                ...styles.notificationItem,
                ...(notif.isRead
                  ? {}
                  : { backgroundColor: "rgba(0, 255, 65, 0.08)" }),
              }}
            >
              <div style={styles.notificationIcon}>
                {getNotificationIcon(notif.type)}
              </div>
              <div style={styles.notificationContent}>
                <p style={styles.notificationMessage}>{notif.message}</p>
                <span style={styles.notificationTime}>
                  {formatTimestamp(notif.timestamp)}
                </span>
              </div>
              {!notif.isRead && <div style={styles.notificationDot} />}
            </div>
          ))}
          {notifications.length > 5 && (
            <button style={styles.viewAllButton}>
              View all {notifications.length} notifications
            </button>
          )}
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },
  title: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    margin: 0,
  },
  badge: {
    backgroundColor: "var(--color-error-red)",
    color: "var(--color-pure-black)",
    fontSize: "0.75rem",
    fontWeight: "bold",
    padding: "0.25rem 0.5rem",
    borderRadius: "9999px",
    minWidth: "1.5rem",
    textAlign: "center",
  },
  notificationList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  notificationItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "rgba(0, 255, 65, 0.03)",
    border: "1px solid rgba(0, 255, 65, 0.1)",
    borderRadius: "6px",
    position: "relative",
    transition: "all 0.2s",
  },
  notificationIcon: {
    fontSize: "1.25rem",
    minWidth: "1.5rem",
    textAlign: "center",
  },
  notificationContent: {
    flex: 1,
    minWidth: 0,
  },
  notificationMessage: {
    color: "var(--color-primary)",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  notificationTime: {
    color: "var(--color-text-grey)",
    fontSize: "0.7rem",
    fontStyle: "italic",
  },
  notificationDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--color-error-red)",
    flexShrink: 0,
  },
  viewAllButton: {
    marginTop: "0.5rem",
    padding: "0.5rem",
    backgroundColor: "transparent",
    border: "1px solid var(--color-primary)",
    color: "var(--color-primary)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    transition: "all 0.2s",
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
