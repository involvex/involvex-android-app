import type {
  GitHubRepository,
  NpmPackage,
  Subscription,
} from "@involvex/shared";
import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { ActivityFeed } from "../components/dashboard/ActivityFeed";
import { NotificationsWidget } from "../components/dashboard/NotificationsWidget";
import { QuickActions } from "../components/dashboard/QuickActions";
import { Navigation } from "../components/Navigation";
import { StatsCard } from "../components/dashboard/StatsCard";
import { SubscriptionsList } from "../components/dashboard/SubscriptionsList";
import { TrendingList } from "../components/dashboard/TrendingList";
import { getUserById } from "../services/db.server";
import { getSession } from "../services/session.server";
import type { Env } from "../types/env";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId") as string | undefined;

  if (!userId) {
    return redirect("/auth/login");
  }

  const env = context.env as Env;
  const db = env.DB;
  const user = await getUserById(db, userId);

  if (!user) {
    return redirect("/auth/login");
  }

  const apiBase = "https://involvex-api.involvex.workers.dev";

  try {
    // Parallel fetch: trending GitHub, npm, and user-specific subscriptions from D1
    const [githubRes, npmRes, userSubs] = await Promise.all([
      fetch(`${apiBase}/api/trending/github?timeframe=daily`).catch(() => null),
      fetch(`${apiBase}/api/trending/npm?timeframe=daily`).catch(() => null),
      db
        .prepare(
          "SELECT * FROM subscriptions WHERE user_id = ? AND is_active = 1",
        )
        .bind(userId)
        .all<Subscription>(),
    ]);

    const githubData = githubRes
      ? await githubRes.json().catch(() => ({ repositories: [] }))
      : { repositories: [] };
    const npmData = npmRes
      ? await npmRes.json().catch(() => ({ packages: [] }))
      : { packages: [] };

    const githubRepos = (githubData.repositories || []) as GitHubRepository[];
    const npmPackages = (npmData.packages || []) as NpmPackage[];
    const subscriptions = (userSubs.results || []) as Subscription[];

    // Generate recent activity from subscriptions
    const recentActivity = subscriptions.slice(0, 5).map((sub, index) => ({
      id: `activity-${sub.id}`,
      type: "subscription" as const,
      itemName: sub.name,
      timestamp: new Date(Date.now() - index * 3600000).toISOString(),
      metadata: sub.type === "github" ? "GitHub Repo" : "npm Package",
    }));

    // Generate sample notifications (in production, fetch from database)
    const notifications = [
      {
        id: "notif-1",
        type: "release" as const,
        message: "New release available for react",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: false,
      },
      {
        id: "notif-2",
        type: "update" as const,
        message: "typescript package updated to v5.3.3",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
      },
    ];

    return json({
      user,
      github: githubRepos.slice(0, 10),
      npm: npmPackages.slice(0, 10),
      subscriptions,
      recentActivity,
      notifications,
      stats: {
        totalGithubRepos: githubRepos.length,
        totalNpmPackages: npmPackages.length,
        totalSubscriptions: subscriptions.length,
      },
    });
  } catch (error) {
    console.error("Dashboard loader error:", error);
    return json({
      user,
      github: [],
      npm: [],
      subscriptions: [],
      recentActivity: [],
      notifications: [],
      stats: {
        totalGithubRepos: 0,
        totalNpmPackages: 0,
        totalSubscriptions: 0,
      },
    });
  }
}

export default function Dashboard() {
  const {
    user,
    github,
    npm,
    subscriptions,
    recentActivity,
    notifications,
    stats,
  } = useLoaderData<typeof loader>();

  return (
    <>
      <Navigation
        username={user.username || user.email}
        isAdmin={user.role === "admin"}
        currentPath="/dashboard"
      />

      <div className="container">
        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1 className="hacker-text" style={{ margin: 0 }}>
            Terminal: {user.username || user.email}
          </h1>
          <Form action="/auth/logout" method="post">
            <button
              type="submit"
              style={{
                background: "none",
                border: "none",
                color: "var(--color-error-red)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
            >
              [ DISCONNECT ]
            </button>
          </Form>
        </div>

        {/* Row 1: Stats Cards */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          <StatsCard
            title="Trending Repos"
            value={stats.totalGithubRepos}
            icon="code"
          />
          <StatsCard
            title="Trending Packages"
            value={stats.totalNpmPackages}
            icon="package"
          />
          <StatsCard
            title="Your Subs"
            value={stats.totalSubscriptions}
            icon="star"
          />
        </div>

        {/* Row 2: Activity Feed + Quick Actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <ActivityFeed activities={recentActivity} />
          <QuickActions />
        </div>

        {/* Row 3: Notifications */}
        <NotificationsWidget notifications={notifications} />

        {/* Row 4: Subscriptions */}
        <div style={{ marginBottom: "3rem" }} id="subscriptions">
          <h2 className="hacker-text">Active Protocols (Subscriptions)</h2>
          <SubscriptionsList subscriptions={subscriptions} />
        </div>

        {/* Row 5: Trending Lists */}
        <div
          id="trending"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "2rem",
          }}
        >
          <TrendingList type="github" items={github} />
          <TrendingList type="npm" items={npm} />
        </div>

        <footer
          style={{
            marginTop: "4rem",
            padding: "2rem 0",
            borderTop: "1px solid var(--color-dark-green)",
            textAlign: "center",
            color: "var(--color-text-grey)",
            fontSize: "0.8rem",
          }}
        >
          Involvex Neural Link v0.0.3 • Connection Secure • ID:{" "}
          {user.id.slice(0, 8)}
        </footer>
      </div>
    </>
  );
}
