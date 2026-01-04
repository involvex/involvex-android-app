/**
 * TrendingList Component
 * Displays trending GitHub repos or npm packages with enhanced UX
 */

import { useState } from "react";
import type { GitHubRepository, NpmPackage } from "@involvex/shared";

interface TrendingListProps {
  type: "github" | "npm";
  items: GitHubRepository[] | NpmPackage[];
}

function GitHubItem({
  repo,
  index,
}: {
  repo: GitHubRepository;
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.itemContainer,
        backgroundColor:
          index % 2 === 0 ? "rgba(0, 255, 65, 0.03)" : "rgba(0, 255, 65, 0.01)",
        ...(isHovered && {
          backgroundColor: "rgba(0, 255, 65, 0.08)",
          borderLeft: "3px solid var(--color-primary)",
          paddingLeft: "calc(1rem - 3px)",
        }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.itemHeader}>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="hacker-text"
          style={styles.itemTitle}
        >
          {repo.full_name}
        </a>
        <span style={styles.metric}>
          ★ {repo.stargazers_count.toLocaleString()}
        </span>
      </div>
      {repo.description && <p style={styles.description}>{repo.description}</p>}
      <div style={styles.itemFooter}>
        {repo.language && <span style={styles.language}>{repo.language}</span>}
        <span style={styles.forks}>🍴 {repo.forks_count.toLocaleString()}</span>
      </div>
    </div>
  );
}

function NpmItem({ pkg, index }: { pkg: NpmPackage; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.itemContainer,
        backgroundColor:
          index % 2 === 0 ? "rgba(0, 255, 65, 0.03)" : "rgba(0, 255, 65, 0.01)",
        ...(isHovered && {
          backgroundColor: "rgba(0, 255, 65, 0.08)",
          borderLeft: "3px solid var(--color-primary)",
          paddingLeft: "calc(1rem - 3px)",
        }),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.itemHeader}>
        <span className="hacker-text" style={styles.itemTitle}>
          {pkg.name}
        </span>
        <span style={styles.metric}>↓ {pkg.downloads.toLocaleString()}</span>
      </div>
      {pkg.description && <p style={styles.description}>{pkg.description}</p>}
      <div style={styles.itemFooter}>
        <span style={styles.language}>v{pkg.version}</span>
      </div>
    </div>
  );
}

export function TrendingList({ type, items }: TrendingListProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        Trending {type === "github" ? "GitHub Repos" : "npm Packages"}
      </h3>
      <div style={styles.listContainer}>
        {items.length === 0 ? (
          <p style={styles.emptyState}>No trending items found.</p>
        ) : (
          items.map((item, index) =>
            type === "github" ? (
              <GitHubItem
                key={(item as GitHubRepository).id}
                repo={item as GitHubRepository}
                index={index}
              />
            ) : (
              <NpmItem
                key={(item as NpmPackage).name}
                pkg={item as NpmPackage}
                index={index}
              />
            ),
          )
        )}
      </div>
      {items.length > 0 && (
        <div style={styles.viewMore}>
          <a href="#" style={styles.viewMoreLink}>
            View all {type === "github" ? "repositories" : "packages"} →
          </a>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "var(--color-darker-green)",
    border: "1px solid var(--color-dark-green)",
    padding: "1.5rem",
    flex: 1,
    borderRadius: "8px",
  },
  title: {
    borderBottom: "2px solid var(--color-primary)",
    paddingBottom: "0.5rem",
    marginBottom: "1rem",
    color: "var(--color-primary)",
  },
  listContainer: {
    display: "flex",
    flexDirection: "column",
  },
  itemContainer: {
    borderBottom: "1px solid var(--color-dark-green)",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    transition: "all 0.2s ease",
    cursor: "pointer",
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
  },
  itemTitle: {
    fontWeight: "bold",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  metric: {
    color: "var(--color-accent-green)",
    fontSize: "0.9rem",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  description: {
    color: "var(--color-text-grey)",
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    lineHeight: "1.4",
    margin: 0,
  },
  itemFooter: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  language: {
    fontSize: "0.8rem",
    color: "var(--color-secondary)",
    fontWeight: "500",
  },
  forks: {
    fontSize: "0.8rem",
    color: "var(--color-text-grey)",
  },
  emptyState: {
    padding: "1rem 0",
    color: "var(--color-text-grey)",
    textAlign: "center",
    fontStyle: "italic",
  },
  viewMore: {
    borderTop: "1px solid var(--color-dark-green)",
    marginTop: "1rem",
    paddingTop: "1rem",
    textAlign: "center",
  },
  viewMoreLink: {
    color: "var(--color-primary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
    transition: "all 0.2s",
  },
};
