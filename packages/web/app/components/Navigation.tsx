/**
 * Navigation Component
 * Shared navigation used across all web pages with HackerTheme styling
 */

import { Link } from "@remix-run/react";

interface NavigationProps {
  username?: string;
  isAdmin?: boolean;
  currentPath?: string;
}

export function Navigation({
  username,
  isAdmin,
  currentPath,
}: NavigationProps) {
  return (
    <nav style={styles.nav}>
      <div style={styles.navLeft}>
        <Link to="/" style={styles.logo}>
          <span className="hacker-text">[ INVOLVEX ]</span>
        </Link>
      </div>

      <div style={styles.navRight}>
        {username ? (
          <>
            <Link
              to="/dashboard"
              style={
                currentPath === "/dashboard" ? styles.activeLink : styles.link
              }
            >
              DASHBOARD
            </Link>
            <Link
              to="/changelog"
              style={
                currentPath === "/changelog" ? styles.activeLink : styles.link
              }
            >
              CHANGELOG
            </Link>
            {isAdmin && (
              <Link to="/admin" style={styles.link}>
                ADMIN
              </Link>
            )}
            <Link to="/profile" style={styles.link}>
              {username.toUpperCase()}
            </Link>
          </>
        ) : (
          <>
            <Link to="/auth/login" style={styles.link}>
              LOGIN
            </Link>
            <Link to="/auth/signup" style={styles.link}>
              SIGN UP
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    borderBottom: "1px solid var(--color-dark-green)",
    backgroundColor: "var(--color-darker-green)",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textDecoration: "none",
    color: "var(--color-primary)",
    textShadow: "0 0 10px var(--color-primary)",
  },
  navRight: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  link: {
    color: "var(--color-primary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    padding: "0.5rem 1rem",
    border: "1px solid transparent",
    transition: "all 0.2s",
    borderRadius: "4px",
  },
  activeLink: {
    color: "var(--color-primary)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "500",
    padding: "0.5rem 1rem",
    border: "1px solid var(--color-primary)",
    backgroundColor: "rgba(0, 255, 65, 0.1)",
    borderRadius: "4px",
  },
};
