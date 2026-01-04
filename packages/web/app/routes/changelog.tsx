import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Navigation } from "../components/Navigation";
import { getUserById } from "../services/db.server";
import { getSession } from "../services/session.server";
import type { Changelog } from "../types/changelog";
import type { Env } from "../types/env";

export const meta: MetaFunction = () => [
  { title: "Changelog - Involvex" },
  {
    name: "description",
    content: "View all updates and improvements to Involvex",
  },
];

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId") as string | undefined;

  let user = null;
  if (userId) {
    const env = context.env as Env;
    const db = env.DB;
    user = await getUserById(db, userId);
  }

  const changelogs: Changelog[] = [
    {
      version: "0.0.16",
      releaseDate: "2026-01-04",
      status: "Latest",
      highlights: [
        "📱 Enhanced SearchScreen with AI chat and consolidated filters",
        "🌐 Shared Navigation component across web platform",
        "📊 New Dashboard widgets (Activity Feed, Quick Actions, Notifications)",
        "✨ Enhanced visual design with hover effects and animations",
        "🎨 Changelog page now uses HackerTheme for consistency",
      ],
      changes: {
        Added: [
          "Mobile: AI chat floating action button in SearchScreen",
          "Mobile: Long-press on items to open AI chat with context",
          "Mobile: InfoCard preview mode integration in SearchScreen",
          "Mobile: Active filters display with individual close buttons",
          "Mobile: Filter count badge on filter icon",
          "Mobile: Pull-to-refresh capability in SearchScreen",
          "Mobile: Error state with retry button in SearchScreen",
          "Mobile: Enhanced Recently Updated cards (wider, better styling)",
          "Web: Shared Navigation component with active route highlighting",
          "Web: Activity Feed dashboard widget showing recent actions",
          "Web: Quick Actions panel for common tasks",
          "Web: Notifications widget with unread count badge",
          "Web: Navigation to Changelog page",
        ],
        Improved: [
          "Mobile: SearchScreen stats display with bold monospace styling",
          "Mobile: SearchScreen empty state with title and subtitle",
          "Mobile: Consolidated filter UI into unified header",
          "Mobile: Recently Updated cards increased from 140px to 180px width",
          "Mobile: Added icon container, version badge, and date to Recently Updated cards",
          "Web: StatsCard with hover effects, glow, and smooth transitions",
          "Web: TrendingList with alternating row backgrounds and hover states",
          "Web: TrendingList items with left border highlight on hover",
          "Web: SubscriptionsList with action menus (View, Share, Remove)",
          "Web: SubscriptionsList cards with hover effects and animations",
          "Web: Changelog styling converted from Tailwind to HackerTheme",
          "Web: Dashboard layout reorganized with new widget sections",
        ],
        Fixed: [],
      },
      features: [
        {
          title: "SearchScreen AI Integration",
          description:
            "Complete AI chat integration in SearchScreen matching HomeScreen functionality with FAB, long-press gestures, and InfoCard preview mode.",
          components: ["SearchScreen.tsx", "aiChatStore.ts", "InfoCard.ts"],
        },
        {
          title: "Consolidated Search Filters",
          description:
            "Unified filter UI showing active filters as removable chips, filter count badge, and clear all button for better UX.",
          components: ["SearchScreen.tsx"],
        },
        {
          title: "Web Navigation Component",
          description:
            "Shared navigation component used across all web pages with HackerTheme styling, active route highlighting, and responsive layout.",
          components: ["Navigation.tsx", "dashboard.tsx", "changelog.tsx"],
        },
        {
          title: "Dashboard Widgets",
          description:
            "Three new dashboard widgets (Activity Feed, Quick Actions, Notifications) providing better user engagement and quick access to common tasks.",
          components: [
            "ActivityFeed.tsx",
            "QuickActions.tsx",
            "NotificationsWidget.tsx",
          ],
        },
        {
          title: "Enhanced Component Visuals",
          description:
            "All dashboard components enhanced with hover effects, smooth transitions, alternating backgrounds, and action menus for improved UX.",
          components: [
            "StatsCard.tsx",
            "TrendingList.tsx",
            "SubscriptionsList.tsx",
          ],
        },
      ],
      technicalDetails: {
        dependencies: "No new dependencies added",
        breakingChanges: "None",
        migrations: "No database migrations required",
        compatibility:
          "React Native 0.83.1+, Remix 2.15+, Cloudflare Pages, TypeScript 5.8+",
      },
    },
    {
      version: "0.0.15",
      releaseDate: "2025-01-04",
      status: "Stable",
      highlights: [
        "🤖 Multi-Provider AI Chat Support",
        "🔍 Advanced SearchScreen UI",
        "📱 InfoCard Preview Modal",
        "⚙️ OpenRouter Integration",
        "🎯 npm Category Filters",
      ],
      changes: {
        Added: [
          "OpenRouter AI provider with Claude 3.5 Sonnet, GPT-4, Llama 2 model selection",
          "OpenRouter API key configuration in Settings → AI Assistant",
          "npm package category filters (12 categories: Frontend, Backend, CLI, Documentation, CSS, Testing, IoT, Coverage, Mobile, Frameworks, Robotics, Math)",
          "Recently Updated Packages section in SearchScreen",
          "InfoCard preview modal with optional in-app browser",
          "InfoCard enable/disable setting",
          "VSCode launch configs and build tasks",
          "Enhanced VSCode settings for development",
        ],
        Improved: [
          "SearchScreen UI: better spacing, styling, and visual hierarchy",
          "Quick filter chips: more visible borders, better active states",
          "Filter panel: enhanced padding, better organization",
          "Settings screen: expanded AI section to 9 configuration options",
          "Gradle configuration: fixed hard link issues on Windows",
        ],
        Fixed: [
          "Author URL case sensitivity (https://involvex.github.io/Involvex/)",
          "Gradle hard link warnings with cross-drive configuration",
          "TypeScript type definitions for OpenRouter provider",
        ],
      },
      features: [
        {
          title: "OpenRouter Integration",
          description:
            "Added complete support for OpenRouter API with secure key storage, model selection, and settings configuration.",
          components: ["aiClient.ts", "SettingsScreen.tsx", "secureStorage.ts"],
        },
        {
          title: "SearchScreen Enhancements",
          description:
            "Improved UI with npm category filters and recently updated packages section for better package discovery.",
          components: ["SearchScreen.tsx", "npmService.ts"],
        },
        {
          title: "InfoCard Modal",
          description:
            "Two-mode interface with preview cards and optional in-app WebView browser with share and external open options.",
          components: ["InfoCardModal.tsx", "InfoCard.ts"],
        },
      ],
      technicalDetails: {
        dependencies:
          "No new dependencies added (uses existing react-native-webview)",
        breakingChanges: "None",
        migrations: "No database migrations required",
        compatibility: "React Native 0.83.1+, TypeScript 5.9+",
      },
    },
    {
      version: "0.0.14",
      releaseDate: "2025-01-03",
      status: "Stable",
      highlights: [
        "✨ Initial app version bump",
        "🐛 Bug fixes and improvements",
      ],
      changes: {
        Added: ["Alert component to App.tsx"],
        Fixed: [
          "Missing Alert import in App.tsx",
          "TypeScript errors in type checking",
        ],
      },
      features: [],
      technicalDetails: {
        dependencies: "None",
        breakingChanges: "None",
        migrations: "None",
        compatibility: "React Native 0.83.1+",
      },
    },
    {
      version: "0.0.13",
      releaseDate: "2025-01-02",
      status: "Stable",
      highlights: ["🤖 AI-powered chat assistant", "💬 GitHub and npm support"],
      changes: {
        Added: [
          "AI-powered chat assistant for GitHub repositories and npm packages",
          "Integration with Gemini and Ollama AI providers",
          "Chat history management",
          "Context-aware responses for repos and packages",
          "Secure API key storage",
        ],
        Improved: [
          "Home screen layout for better content discovery",
          "User interface responsiveness",
        ],
      },
      features: [],
      technicalDetails: {
        dependencies: "Added Zustand for state management",
        breakingChanges: "None",
        migrations: "None",
        compatibility: "React Native 0.83.1+",
      },
    },
  ];

  return json({ changelogs, user });
}

export default function Changelog() {
  const { changelogs, user } = useLoaderData<typeof loader>();

  return (
    <>
      <Navigation
        username={user?.username || user?.email}
        isAdmin={user?.role === "admin"}
        currentPath="/changelog"
      />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <h1 className="hacker-text" style={styles.title}>
              Changelog
            </h1>
            <p style={styles.subtitle}>
              Track all updates and improvements to Involvex
            </p>
          </div>
        </div>

        {/* Changelogs */}
        <div style={styles.changelogsContainer}>
          {changelogs.map((changelog) => (
            <ChangelogItem key={changelog.version} changelog={changelog} />
          ))}
        </div>
      </div>
    </>
  );
}

function ChangelogItem({ changelog }: { changelog: Changelog }) {
  return (
    <div style={styles.changelogItem}>
      {/* Version Header */}
      <div style={styles.versionHeader}>
        <div style={styles.versionTitleRow}>
          <h2 className="hacker-text" style={styles.versionTitle}>
            v{changelog.version}
          </h2>
          <div style={styles.badges}>
            {changelog.status === "Latest" && (
              <span style={{ ...styles.badge, ...styles.badgeLatest }}>
                Latest
              </span>
            )}
            {changelog.status === "Stable" && (
              <span style={{ ...styles.badge, ...styles.badgeStable }}>
                Stable
              </span>
            )}
          </div>
        </div>
        <p style={styles.releaseDate}>
          Released on{" "}
          {new Date(changelog.releaseDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Highlights */}
      {changelog.highlights.length > 0 && (
        <div style={styles.highlightsContainer}>
          <h3 style={styles.sectionTitle}>Highlights</h3>
          <ul style={styles.list}>
            {changelog.highlights.map((highlight, idx) => (
              <li key={idx} style={styles.highlightItem}>
                ✨ {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Changes */}
      <div style={styles.changesGrid}>
        {Object.entries(changelog.changes).map(
          ([category, items]) =>
            items.length > 0 && (
              <div key={category} style={styles.changeCard}>
                <h3 style={styles.changeCategory}>
                  {category === "Added" && "➕ Added"}
                  {category === "Improved" && "⬆️ Improved"}
                  {category === "Fixed" && "🔧 Fixed"}
                </h3>
                <ul style={styles.list}>
                  {items.map((item, idx) => (
                    <li key={idx} style={styles.changeItem}>
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ),
        )}
      </div>

      {/* Features */}
      {changelog.features.length > 0 && (
        <div style={styles.featuresSection}>
          <h3 style={styles.featuresSectionTitle}>Featured Updates</h3>
          <div style={styles.featuresGrid}>
            {changelog.features.map((feature, idx) => (
              <div key={idx} style={styles.featureCard}>
                <h4 className="hacker-text" style={styles.featureTitle}>
                  {feature.title}
                </h4>
                <p style={styles.featureDescription}>{feature.description}</p>
                <div style={styles.componentsContainer}>
                  {feature.components.map((comp) => (
                    <code key={comp} style={styles.componentBadge}>
                      {comp}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Details */}
      <div style={styles.technicalDetails}>
        <h4 style={styles.technicalTitle}>Technical Details</h4>
        <div style={styles.technicalContent}>
          <p style={styles.technicalItem}>
            <strong style={styles.technicalLabel}>Dependencies:</strong>{" "}
            {changelog.technicalDetails.dependencies}
          </p>
          <p style={styles.technicalItem}>
            <strong style={styles.technicalLabel}>Breaking Changes:</strong>{" "}
            {changelog.technicalDetails.breakingChanges}
          </p>
          <p style={styles.technicalItem}>
            <strong style={styles.technicalLabel}>Migrations:</strong>{" "}
            {changelog.technicalDetails.migrations}
          </p>
          <p style={styles.technicalItem}>
            <strong style={styles.technicalLabel}>Compatibility:</strong>{" "}
            {changelog.technicalDetails.compatibility}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider}></div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #000000, #051a05, #000000)",
  },
  header: {
    borderBottom: "1px solid rgba(0, 255, 65, 0.2)",
    backgroundColor: "rgba(5, 26, 5, 0.5)",
    backdropFilter: "blur(10px)",
  },
  headerContent: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "4rem 1.5rem",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "var(--color-text-grey)",
  },
  changelogsContainer: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "3rem 1.5rem",
  },
  changelogItem: {
    marginBottom: "3rem",
  },
  versionHeader: {
    marginBottom: "1.5rem",
  },
  versionTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  versionTitle: {
    fontSize: "1.875rem",
    fontWeight: "bold",
  },
  badges: {
    display: "flex",
    gap: "0.5rem",
  },
  badge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  badgeLatest: {
    backgroundColor: "rgba(0, 255, 65, 0.2)",
    border: "1px solid rgba(0, 255, 65, 0.5)",
    color: "var(--color-primary)",
  },
  badgeStable: {
    backgroundColor: "rgba(0, 217, 255, 0.2)",
    border: "1px solid rgba(0, 217, 255, 0.5)",
    color: "#00d9ff",
  },
  releaseDate: {
    fontSize: "0.875rem",
    color: "var(--color-text-grey)",
  },
  highlightsContainer: {
    marginBottom: "1.5rem",
    padding: "1rem",
    backgroundColor: "rgba(0, 255, 65, 0.1)",
    border: "1px solid rgba(0, 255, 65, 0.2)",
    borderRadius: "0.5rem",
  },
  sectionTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--color-primary)",
    marginBottom: "0.75rem",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  highlightItem: {
    fontSize: "0.875rem",
    color: "var(--color-accent-green)",
    marginBottom: "0.5rem",
  },
  changesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  changeCard: {
    padding: "1rem",
    backgroundColor: "rgba(26, 26, 26, 0.5)",
    border: "1px solid rgba(64, 64, 64, 0.5)",
    borderRadius: "0.5rem",
  },
  changeCategory: {
    fontWeight: "600",
    color: "var(--color-text-grey)",
    marginBottom: "0.75rem",
  },
  changeItem: {
    fontSize: "0.875rem",
    color: "var(--color-text-grey)",
    lineHeight: "1.6",
    marginBottom: "0.5rem",
  },
  featuresSection: {
    marginBottom: "1.5rem",
  },
  featuresSectionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "var(--color-text-grey)",
    marginBottom: "1rem",
  },
  featuresGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  featureCard: {
    padding: "1rem",
    backgroundColor: "rgba(26, 26, 26, 0.3)",
    border: "1px solid rgba(64, 64, 64, 0.3)",
    borderRadius: "0.5rem",
  },
  featureTitle: {
    fontWeight: "600",
    marginBottom: "0.5rem",
  },
  featureDescription: {
    fontSize: "0.875rem",
    color: "var(--color-text-grey)",
    marginBottom: "0.75rem",
  },
  componentsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  componentBadge: {
    padding: "0.25rem 0.5rem",
    backgroundColor: "var(--color-pure-black)",
    fontSize: "0.75rem",
    color: "var(--color-accent-green)",
    borderRadius: "0.25rem",
    border: "1px solid var(--color-light-grey)",
  },
  technicalDetails: {
    padding: "1rem",
    backgroundColor: "rgba(26, 26, 26, 0.3)",
    border: "1px solid rgba(64, 64, 64, 0.3)",
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
  },
  technicalTitle: {
    fontWeight: "600",
    color: "var(--color-text-grey)",
    marginBottom: "0.75rem",
  },
  technicalContent: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    color: "var(--color-text-grey)",
  },
  technicalItem: {
    margin: 0,
  },
  technicalLabel: {
    color: "var(--color-text-grey)",
  },
  divider: {
    marginTop: "2rem",
    borderTop: "1px solid rgba(64, 64, 64, 0.5)",
  },
};
