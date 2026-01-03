/**
 * Trending routes - GitHub and npm trending data
 */

import type { Env } from '../index';

export async function handleTrending(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // GET /api/trending/github
  if (path === '/api/trending/github') {
    const timeframe = url.searchParams.get('timeframe') || 'daily';
    const language = url.searchParams.get('language') || '';

    // TODO: Fetch from GitHub trending API or scrape
    // For now, return mock data
    const mockData = {
      timeframe,
      language,
      repositories: [],
      cached_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(mockData), { headers });
  }

  // GET /api/trending/npm
  if (path === '/api/trending/npm') {
    const timeframe = url.searchParams.get('timeframe') || 'daily';

    // TODO: Fetch from npm trending API
    // For now, return mock data
    const mockData = {
      timeframe,
      packages: [],
      cached_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify(mockData), { headers });
  }

  return new Response(
    JSON.stringify({ error: 'Not found' }),
    { status: 404, headers }
  );
}
