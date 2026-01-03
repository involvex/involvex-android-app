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
    <div className="container" style={{ textAlign: 'center', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
        <a href="/auth/login" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>[ LOGIN ]</a>
        <a href="/auth/signup" style={{ color: 'var(--color-secondary)', fontSize: '0.9rem' }}>[ SIGN_UP ]</a>
      </div>
      
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
        <a href="https://github.com/involvex/involvex-android-app" style={{
          padding: '1rem 1rem',
          border: '2px solid var(--color-primary)',
           display: 'flex',
          margin: '10px 10px 10px 10px',
          justifyContent: 'center',
        }}>
          View on GitHub
        </a>
        <a href="/dashboard" style={{
          padding: '1rem 2rem',
          border: '2px solid var(--color-accent-green)',
          display: 'flex',
          margin: '10px 10px 10px 10px',
          justifyContent: 'center',
        }}>
          Dashboard
        </a>
        <a href="https://involvex.github.io/involvex-android-app/" style={{
          padding: '1rem 1rem',
          border: '2px solid var(--color-secondary)',
          display: 'flex',
          margin: '10px 10px 10px 10px',
          justifyContent: 'center',
        }} target="_blank" rel="noreferrer">
          Documentation
        </a>
      </div>
      <div style={{ marginTop: '4rem', padding: '2rem', border: '1px solid var(--color-dark-green)', backgroundColor: 'var(--color-darker-green)' }}>
        <h2>Download Mobile App</h2>
        <p style={{ margin: '1rem 0', color: 'var(--color-text-grey)' }}>
          Get the Android app to track trending repositories and packages on the go
        </p>
        <a 
          href="https://github.com/involvex/involvex-android-app/releases/latest"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-pure-black)',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'inline-block',
            textDecoration: 'none'
          }}
        >
          Download APK
        </a>
      </div>
    </div>
  );
}
