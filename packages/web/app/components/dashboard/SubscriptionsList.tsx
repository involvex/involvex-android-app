import React from 'react';
import type { Subscription } from "@involvex/shared";

interface SubscriptionsListProps {
  subscriptions: Subscription[];
}

export function SubscriptionsList({ subscriptions }: SubscriptionsListProps) {
  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        border: '1px dashed var(--color-dark-green)',
        textAlign: 'center',
        color: 'var(--color-text-grey)'
      }}>
        No active subscriptions. Start tracking repositories or packages!
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '1rem',
      marginTop: '1rem'
    }}>
      {subscriptions.map((sub) => (
        <div key={sub.id} style={{
          border: '1px solid var(--color-dark-green)',
          backgroundColor: 'var(--color-dark-grey)',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div className="hacker-text" style={{ fontWeight: 'bold' }}>{sub.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-grey)' }}>
              {sub.type === 'github' ? 'GitHub' : 'npm'} • Subscribed {new Date(sub.subscribed_at).toLocaleDateString()}
            </div>
          </div>
          {sub.is_active && (
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'var(--color-dark-green)',
              color: 'var(--color-primary)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px'
            }}>
              ACTIVE
            </span>
          )}
        </div>
      ))}
    </div>
  );
}