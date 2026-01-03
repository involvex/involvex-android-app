# @involvex/web

Cloudflare Pages site built with Remix - Landing page + Dashboard for Involvex.

## Features

- **Landing Page**: App info, download links, features
- **Dashboard**: View trending repos and packages (coming soon)
- **Admin Panel**: Manage content (coming soon)
- **HackerTheme**: Matrix-style dark green aesthetic matching the mobile app

## Development

```bash
# Start dev server
bun run dev

# Build for production
bun run build

# Deploy to Cloudflare Pages
bun run deploy
```

## Tech Stack

- Remix (React framework)
- Cloudflare Pages (hosting)
- TypeScript
- Vite (build tool)
- @involvex/shared (shared theme and types)

## Deployment

The site automatically deploys to Cloudflare Pages when you run `bun run deploy`.

Make sure you're logged in to Cloudflare:
```bash
wrangler login
```
