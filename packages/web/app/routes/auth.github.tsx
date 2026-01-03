import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import type { Env } from "../types/env";

export async function loader({ context }: LoaderFunctionArgs) {
  const env = context.env as Env;
  const clientId = env.GITHUB_OAUTH_CLIENT_ID;
  const callbackUrl = env.GITHUB_OAUTH_CALLBACK;

  if (!clientId) {
    throw new Error("GITHUB_OAUTH_CLIENT_ID not configured");
  }

  const state = `github:${Math.random().toString(36).substring(7)}`;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=read:user,user:email&state=${state}`;

  return redirect(githubAuthUrl);
}
