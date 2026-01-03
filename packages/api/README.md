# @involvex/api

Cloudflare Workers API for Involvex mobile app.

## Features

- **Trending**: GitHub repos and npm packages trending data
- **Subscriptions**: User subscriptions CRUD
- **Auth**: OAuth callbacks for Discord/GitHub

## Development

```bash
# Start dev server
bun run dev

# Deploy to Cloudflare
bun run deploy

# View logs
bun run tail
```

## API Endpoints

### Trending
- `GET /api/trending/github?timeframe=daily&language=typescript`
- `GET /api/trending/npm?timeframe=weekly`

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `POST /api/subscriptions` - Create subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Auth
- `GET /api/auth/callback` - OAuth callback handler

### Health
- `GET /health` - Health check

## Environment Variables

Set in Cloudflare Workers dashboard or via `wrangler secret put`:

- `GITHUB_CLIENT_ID` - GitHub OAuth app ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret

## Database

Uses D1 database from `@involvex/database` package. Make sure to:
1. Create the database
2. Run migrations
3. Copy the database_id to `wrangler.toml`
