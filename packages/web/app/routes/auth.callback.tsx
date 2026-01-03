import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  getUserByDiscordId,
  getUserByGitHubId,
  createUser,
  linkDiscordAccount,
  linkGitHubAccount,
} from "../services/db.server";
import { getSession, commitSession } from "../services/session.server";
import type { Env } from "../types/env";

interface GitHubUserProfile {
  id: number;
  login: string;
  email: string | null;
}

interface DiscordUserProfile {
  id: string;
  username: string;
  email: string | null;
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state"); // e.g., "linking:discord" or "github:randomstring"

  if (!code || !state) {
    return redirect("/auth/login?error=invalid_request");
  }

  const [actionOrProvider, providerOrRandom] = state.split(":");
  const isLinking = actionOrProvider === "linking";
  const provider = isLinking ? providerOrRandom : actionOrProvider;

  const env = context.env as Env;
  const db = env.DB;
  const session = await getSession(request.headers.get("Cookie"));

  try {
    let userProfile: GitHubUserProfile | DiscordUserProfile;
    let oauthId: string;

    if (provider === "github") {
      const tokenRes = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: env.GITHUB_OAUTH_CLIENT_ID,
            client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
            code,
          }),
        },
      );
      const tokenData = (await tokenRes.json()) as {
        access_token: string;
        error?: string;
      };
      if (tokenData.error)
        throw new Error(`GitHub token error: ${tokenData.error}`);

      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "Involvex-Portal",
        },
      });
      userProfile = (await userRes.json()) as GitHubUserProfile;
      oauthId = String(userProfile.id);
    } else if (provider === "discord") {
      const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: env.DISCORD_OAUTH_CALLBACK,
        }),
      });
      const tokenData = (await tokenRes.json()) as {
        access_token: string;
        error?: string;
      };
      if (tokenData.error)
        throw new Error(`Discord token error: ${tokenData.error}`);

      const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      userProfile = (await userRes.json()) as DiscordUserProfile;
      oauthId = String(userProfile.id);
    } else {
      throw new Error("Invalid provider specified in state");
    }

    if (isLinking) {
      const userId = session.get("userId");
      if (!userId) {
        session.flash("error", "You must be logged in to link an account.");
        return redirect("/profile", {
          headers: { "Set-Cookie": await commitSession(session) },
        });
      }

      if (provider === "github") {
        await linkGitHubAccount(db, userId, oauthId);
      } else {
        await linkDiscordAccount(db, userId, oauthId);
      }

      session.flash("success", `Successfully linked ${provider} account.`);
      return redirect("/profile", {
        headers: { "Set-Cookie": await commitSession(session) },
      });
    }

    // Standard login/signup flow
    let user =
      provider === "github"
        ? await getUserByGitHubId(db, oauthId)
        : await getUserByDiscordId(db, oauthId);

    if (!user) {
      const username =
        provider === "github"
          ? (userProfile as GitHubUserProfile).login
          : (userProfile as DiscordUserProfile).username;
      const email = userProfile.email || null;
      user = await createUser(db, email, null, username, {
        provider,
        id: oauthId,
      });
    }

    session.set("userId", user.id);

    return redirect("/dashboard", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "A non-Error was thrown";
    session.flash("error", `OAuth failed: ${errorMessage}`);
    return redirect(isLinking ? "/profile" : "/auth/login", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }
}
