import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { Env } from "../types/env";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.env as Env;
  const clientId = env.DISCORD_CLIENT_ID;
  const callbackUrl = env.DISCORD_OAUTH_CALLBACK;

  if (!clientId) {
    throw new Error("DISCORD_CLIENT_ID not configured");
  }

  const state = `discord:${Math.random().toString(36).substring(7)}`;
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=identify%20email&state=${state}`;

  return redirect(discordAuthUrl);
}
