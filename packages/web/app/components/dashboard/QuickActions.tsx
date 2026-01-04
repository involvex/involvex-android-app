/**
 * Quick Actions Panel
 * Provides quick access to common dashboard tasks
 */

interface ActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button style={styles.actionButton} onClick={onClick}>
      <div style={styles.actionIcon}>{icon}</div>
      <span style={styles.actionLabel}>{label}</span>
    </button>
  );
}

export function QuickActions() {
  const handleSearch = () => {
    // Navigate to search or trigger search UI
    alert("Search functionality - to be implemented");
  };

  const handleTrending = () => {
    // Scroll to trending section
    const trendingSection = document.getElementById("trending");
    if (trendingSection) {
      trendingSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSettings = () => {
    // Navigate to profile/settings
    window.location.href = "/profile";
  };

  const handleAnalytics = () => {
    // Show analytics view
    alert("Analytics coming soon!");
  };

  return (
    <div style={styles.container}>
      <h3 className="hacker-text" style={styles.title}>
        Quick Actions
      </h3>
      <div style={styles.actionGrid}>
        <ActionButton icon="🔍" label="Search" onClick={handleSearch} />
        <ActionButton icon="⭐" label="Trending" onClick={handleTrending} />
        <ActionButton icon="⚙️" label="Settings" onClick={handleSettings} />
        <ActionButton icon="📊" label="Analytics" onClick={handleAnalytics} />
      </div>
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
  actionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "1rem",
  },
  actionButton: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    padding: "1.5rem 1rem",
    backgroundColor: "rgba(0, 255, 65, 0.05)",
    border: "1px solid rgba(0, 255, 65, 0.2)",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s",
    color: "var(--color-primary)",
    fontFamily: "inherit",
  },
  actionIcon: {
    fontSize: "2rem",
  },
  actionLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
  },
};
