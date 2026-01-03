import { json, redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Link } from "@remix-run/react";
import { getSession } from "../services/session.server";
import { getUserById, getAllUsers, getStats } from "../services/db.server";
import { StatsCard } from "../components/dashboard/StatsCard";
import type { User } from "../services/db.server";

import type { Env } from "../types/env";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/auth/login");
  }

  const env = context.env as Env;
  const db = env.DB;
  const user = await getUserById(db, userId);

  if (!user || user.role !== 'admin') {
    return redirect("/dashboard");
  }

  const [users, stats] = await Promise.all([
    getAllUsers(db),
    getStats(db)
  ]);

  return json({ user, users, stats });
}

export default function Admin() {
  const { users, stats } = useLoaderData<typeof loader>();

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="hacker-text">Admin Terminal</h1>
        <Link to="/dashboard" style={{ color: 'var(--color-text-grey)', fontSize: '0.9rem' }}>← Dashboard</Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        <StatsCard title="Total Entities" value={stats.users} icon="star" />
        <StatsCard title="Total Protocols" value={stats.subscriptions} icon="code" />
        <StatsCard title="System Status" value="OPTIMAL" icon="package" />
      </div>

      <h2 className="hacker-text">Indexed Entities (Users)</h2>
      <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--color-dark-green)' }}>
          <thead>
            <tr style={{ background: 'var(--color-darker-green)', textAlign: 'left' }}>
              <th style={{ padding: '1rem', border: '1px solid var(--color-dark-green)' }}>ID</th>
              <th style={{ padding: '1rem', border: '1px solid var(--color-dark-green)' }}>CODENAME</th>
              <th style={{ padding: '1rem', border: '1px solid var(--color-dark-green)' }}>SECURE_MAIL</th>
              <th style={{ padding: '1rem', border: '1px solid var(--color-dark-green)' }}>ROLE</th>
              <th style={{ padding: '1rem', border: '1px solid var(--color-dark-green)' }}>INDEXED_AT</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: User) => (
              <tr key={u.id} style={{ border: '1px solid var(--color-dark-green)' }}>
                <td style={{ padding: '1rem', border: '1px solid var(--color-dark-green)', fontSize: '0.8rem', color: 'var(--color-text-grey)' }}>{u.id.slice(0, 8)}</td>
                <td style={{ padding: '1rem', border: '1px solid var(--color-dark-green)' }}>{u.username || "---"}</td>
                <td style={{ padding: '1rem', border: '1px solid var(--color-dark-green)' }}>{u.email}</td>
                <td style={{ padding: '1rem', border: '1px solid var(--color-dark-green)', color: u.role === 'admin' ? 'var(--color-secondary)' : 'var(--color-primary)' }}>{u.role.toUpperCase()}</td>
                <td style={{ padding: '1rem', border: '1px solid var(--color-dark-green)', fontSize: '0.8rem', color: 'var(--color-text-grey)' }}>{new Date(u.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '4rem', padding: '2rem', border: '1px solid var(--color-warning-orange)', backgroundColor: 'rgba(255, 136, 0, 0.05)' }}>
        <h3 style={{ color: 'var(--color-warning-orange)' }}>Database Maintenance</h3>
        <p style={{ color: 'var(--color-text-grey)', fontSize: '0.9rem', margin: '1rem 0' }}>
          Perform raw SQL queries or maintenance tasks via Wrangler CLI.
        </p>
        <code style={{ display: 'block', padding: '1rem', background: 'var(--color-pure-black)', border: '1px solid var(--color-dark-green)' }}>
          wrangler d1 execute involvex-production --command "SELECT * FROM users LIMIT 10;"
        </code>
      </div>
    </div>
  );
}
