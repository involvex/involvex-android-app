/**
 * Subscriptions routes - User subscriptions to repos and packages
 */

import type { Env } from '../index';

export async function handleSubscriptions(
  request: Request,
  env: Env,
  headers: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;

  // GET /api/subscriptions - List subscriptions
  if (method === 'GET') {
    try {
      const result = await env.DB.prepare(
        'SELECT * FROM subscriptions WHERE is_active = 1 ORDER BY created_at DESC'
      ).all();

      return new Response(
        JSON.stringify({ success: true, data: result.results }),
        { headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { status: 500, headers }
      );
    }
  }

  // POST /api/subscriptions - Create subscription
  if (method === 'POST') {
    try {
      const body = await request.json() as any;
      const id = crypto.randomUUID();
      const now = Date.now();

      await env.DB.prepare(`
        INSERT INTO subscriptions (id, type, item_id, name, full_name, data, subscribed_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        body.type,
        body.item_id,
        body.name,
        body.full_name || null,
        JSON.stringify(body.data),
        now,
        now,
        now
      ).run();

      return new Response(
        JSON.stringify({ success: true, data: { id } }),
        { status: 201, headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create subscription' }),
        { status: 500, headers }
      );
    }
  }

  // DELETE /api/subscriptions/:id - Delete subscription
  if (method === 'DELETE') {
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    try {
      await env.DB.prepare(
        'DELETE FROM subscriptions WHERE id = ?'
      ).bind(id).run();

      return new Response(
        JSON.stringify({ success: true }),
        { headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to delete subscription' }),
        { status: 500, headers }
      );
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405, headers }
  );
}
