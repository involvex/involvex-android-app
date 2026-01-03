import React from 'react';
import type { GitHubRepository, NpmPackage } from "@involvex/shared";

interface TrendingListProps {
  type: 'github' | 'npm';
  items: GitHubRepository[] | NpmPackage[];
}

function GitHubItem({ repo }: { repo: GitHubRepository }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--color-dark-green)',
      padding: '1rem 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href={repo.html_url} target="_blank" rel="noreferrer" className="hacker-text" style={{ fontWeight: 'bold' }}>
          {repo.full_name}
        </a>
        <span style={{ color: 'var(--color-accent-green)', fontSize: '0.9rem' }}>
          ★ {repo.stargazers_count.toLocaleString()}
        </span>
      </div>
      <p style={{ color: 'var(--color-text-grey)', fontSize: '0.9rem' }}>{repo.description}</p>
      {repo.language && (
        <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
          {repo.language}
        </span>
      )}
    </div>
  );
}

function NpmItem({ pkg }: { pkg: NpmPackage }) {
  return (
    <div style={{
      borderBottom: '1px solid var(--color-dark-green)',
      padding: '1rem 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="hacker-text" style={{ fontWeight: 'bold' }}>
          {pkg.name}
        </span>
        <span style={{ color: 'var(--color-accent-green)', fontSize: '0.9rem' }}>
          ↓ {pkg.downloads.toLocaleString()}
        </span>
      </div>
      <p style={{ color: 'var(--color-text-grey)', fontSize: '0.9rem' }}>{pkg.description}</p>
      <span style={{ fontSize: '0.8rem', color: 'var(--color-secondary)' }}>
        v{pkg.version}
      </span>
    </div>
  );
}

export function TrendingList({ type, items }: TrendingListProps) {
  return (
    <div style={{
      backgroundColor: 'var(--color-darker-green)',
      border: '1px solid var(--color-dark-green)',
      padding: '1.5rem',
      flex: 1
    }}>
      <h3 style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem' }}>
        Trending {type === 'github' ? 'GitHub Repos' : 'npm Packages'}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.length === 0 ? (
          <p style={{ padding: '1rem 0', color: 'var(--color-text-grey)' }}>No trending items found.</p>
        ) : (
          items.map((item, index) => (
            type === 'github' 
              ? <GitHubItem key={(item as GitHubRepository).id} repo={item as GitHubRepository} />
              : <NpmItem key={(item as NpmPackage).name} pkg={item as NpmPackage} />
          ))
        )}
      </div>
    </div>
  );
}