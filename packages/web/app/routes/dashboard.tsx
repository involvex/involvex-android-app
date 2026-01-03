import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Form, Link } from "@remix-run/react";
import { StatsCard } from "../components/dashboard/StatsCard";
import { TrendingList } from "../components/dashboard/TrendingList";
import { SubscriptionsList } from "../components/dashboard/SubscriptionsList";
import type {
  GitHubRepository,
  NpmPackage,
  Subscription,
} from "@involvex/shared";
import { getSession } from "../services/session.server";
import { getUserById } from "../services/db.server";
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

    return json({
      user,
      github: githubRepos.slice(0, 10),
      npm: npmPackages.slice(0, 10),
      subscriptions,
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
      stats: {
        totalGithubRepos: 0,
        totalNpmPackages: 0,
        totalSubscriptions: 0,
      },
    });
  }
}

export default function Dashboard() {
  const { user, github, npm, subscriptions, stats } =
    useLoaderData<typeof loader>();

  return (
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
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user.role === "admin" && (
            <Link
              to="/admin"
              style={{ color: "var(--color-secondary)", fontSize: "0.9rem" }}
            >
              [ ADMIN_PANEL ]
            </Link>
          )}
          <Link
            to="/profile"
            style={{ color: "var(--color-accent-green)", fontSize: "0.9rem" }}
          >
            [ PROFILE ]
          </Link>
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
      </div>

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

      <div style={{ marginBottom: "3rem" }}>
        <h2 className="hacker-text">Active Protocols (Subscriptions)</h2>
        <SubscriptionsList subscriptions={subscriptions} />
      </div>

      <div
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
  );
}
