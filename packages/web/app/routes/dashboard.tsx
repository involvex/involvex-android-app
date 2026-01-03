import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { StatsCard } from "../components/dashboard/StatsCard";
import { TrendingList } from "../components/dashboard/TrendingList";
import { SubscriptionsList } from "../components/dashboard/SubscriptionsList";
import type { GitHubRepository, NpmPackage, Subscription } from "@involvex/shared";

export async function loader({ context }: LoaderFunctionArgs) {
  const apiBase = "https://involvex-api.involvex.workers.dev";

  try {
    // Parallel fetch: trending GitHub, npm, subscriptions
    // Using simple fetch for now. In production, these might need auth headers.
    const [githubRes, npmRes, subsRes] = await Promise.all([
      fetch(`${apiBase}/api/trending/github?timeframe=daily`).catch(() => null),
      fetch(`${apiBase}/api/trending/npm?timeframe=daily`).catch(() => null),
      fetch(`${apiBase}/api/subscriptions`).catch(() => null),
    ]);

    const githubData = githubRes ? await githubRes.json().catch(() => ({ repositories: [] })) : { repositories: [] };
    const npmData = npmRes ? await npmRes.json().catch(() => ({ packages: [] })) : { packages: [] };
    const subsData = subsRes ? await subsRes.json().catch(() => ({ data: [] })) : { data: [] };

    const githubRepos = (githubData.repositories || []) as GitHubRepository[];
    const npmPackages = (npmData.packages || []) as NpmPackage[];
    const subscriptions = (subsData.data || []) as Subscription[];

    return json({
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
  const { github, npm, subscriptions, stats } = useLoaderData<typeof loader>();

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="hacker-text" style={{ margin: 0 }}>System Dashboard</h1>
        <a href="/" style={{ fontSize: '0.9rem', color: 'var(--color-text-grey)' }}>← Back to Home</a>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <StatsCard title="Trending Repos" value={stats.totalGithubRepos} icon="code" />
        <StatsCard title="Trending Packages" value={stats.totalNpmPackages} icon="package" />
        <StatsCard title="Active Subs" value={stats.totalSubscriptions} icon="star" />
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 className="hacker-text">Your Subscriptions</h2>
        <SubscriptionsList subscriptions={subscriptions} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        <TrendingList type="github" items={github} />
        <TrendingList type="npm" items={npm} />
      </div>

      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--color-dark-green)', textAlign: 'center', color: 'var(--color-text-grey)', fontSize: '0.8rem' }}>
        Involvex Neural Link v0.0.3 • Connection Secure
      </footer>
    </div>
  );
}
