import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { HackerTheme } from "@involvex/shared";

export async function loader() {
  return json({
    appName: "Involvex",
    version: "0.0.3",
    theme: HackerTheme,
  });
}

export default function Index() {
  const { appName, version } = useLoaderData<typeof loader>();

  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h1 className="hacker-text" style={{ fontSize: '3rem', marginBottom: '2rem' }}>
        {appName}
      </h1>
      <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Trending GitHub Repos & npm Packages
      </p>
      <p style={{ color: '#B8B8B8', marginBottom: '2rem' }}>
        Version {version}
      </p>
      <div style={{ marginTop: '3rem' }}>
        <a href="https://github.com/involvex" style={{
          padding: '1rem 2rem',
          border: '2px solid var(--color-primary)',
          display: 'inline-block',
          marginRight: '1rem'
        }}>
          View on GitHub
        </a>
        <a href="/dashboard" style={{
          padding: '1rem 2rem',
          border: '2px solid var(--color-accent-green)',
          display: 'inline-block'
        }}>
          Dashboard
        </a>
      </div>
      <div style={{ marginTop: '4rem', padding: '2rem', border: '1px solid var(--color-dark-green)', backgroundColor: 'var(--color-darker-green)' }}>
        <h2>Download Mobile App</h2>
        <p style={{ margin: '1rem 0', color: 'var(--color-text-grey)' }}>
          Get the Android app to track trending repositories and packages on the go
        </p>
        <button style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-pure-black)',
          border: 'none',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Download APK
        </button>
      </div>
    </div>
  );
}
