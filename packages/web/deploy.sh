#!/bin/bash
# Build and deploy Remix app to Cloudflare Pages

echo "Building Remix app..."
bun run build

echo "Copying functions to build/client..."
mkdir -p build/client/functions
cat > build/client/functions/\[\[path\]\].js << 'EOF'
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '../../server';

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context) => ({
    env: context.env,
  }),
});
EOF

echo "Deploying to Cloudflare Pages..."
cd build/client && wrangler pages deploy . --project-name=app
