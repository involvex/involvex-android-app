import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, Form, Link, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { getSession, commitSession } from "../services/session.server";
import { getUserById } from "../services/db.server";
import type { User } from "../services/db.server";
import type { Env } from "../types/env";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId") as string | undefined;

  if (!userId) {
    return redirect("/auth/login");
  }

  const env = context.env as Env;
  const db = env.DB;
  const user = await getUserById(db, userId);

  if (!user) {
    // This could happen if the user was deleted but the session still exists
    return redirect("/auth/login");
  }

  const message = session.get("success") || session.get("error");
  const headers = message ? { "Set-Cookie": await commitSession(session) } : {};

  return json({ user, message }, { headers });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId") as string | undefined;
  if (!userId) return redirect("/auth/login");

  const env = context.env as Env;
  const db = env.DB;

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "unlink_discord") {
    await db
      .prepare(
        "UPDATE users SET discord_id = NULL, updated_at = ? WHERE id = ?",
      )
      .bind(Date.now(), userId)
      .run();
    session.flash("success", "Discord account unlinked successfully.");
    return redirect("/profile", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  if (intent === "unlink_github") {
    await db
      .prepare("UPDATE users SET github_id = NULL, updated_at = ? WHERE id = ?")
      .bind(Date.now(), userId)
      .run();
    session.flash("success", "GitHub account unlinked successfully.");
    return redirect("/profile", {
      headers: { "Set-Cookie": await commitSession(session) },
    });
  }

  // Default action: update profile
  const username = formData.get("username") as string;
  const avatarUrl = formData.get("avatarUrl") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await getUserById(db, userId);
  if (!user) return redirect("/auth/login");

  let passwordHash = user.password_hash;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  await db
    .prepare(
      "UPDATE users SET username = ?, avatar_url = ?, email = COALESCE(email, ?), password_hash = COALESCE(password_hash, ?) WHERE id = ?",
    )
    .bind(username, avatarUrl, email || null, passwordHash, userId)
    .run();

  return json({ success: true });
}

export default function Profile() {
  const { user, message } = useLoaderData<{ user: User; message?: string }>();
  const actionData = useActionData<typeof action>();

  const isOAuthUser = !user.password_hash;

  return (
    <div
      className="container"
      style={{ maxWidth: "600px", paddingTop: "4rem" }}
    >
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="hacker-text">Identity Config</h1>
        <Link to="/dashboard" className="link-subtle">
          ← Dashboard
        </Link>
      </div>

      {message && (
        <div
          className={`flash-message ${message.includes("success") ? "success" : "error"}`}
        >
          <p>{message}</p>
        </div>
      )}

      {/* Account Linking Section */}
      <div className="card">
        <h2>Linked Accounts</h2>
        <div className="account-linking">
          {user.discord_id ? (
            <div className="linked-account">
              <span>
                <i className="fab fa-discord"></i> Discord Linked
              </span>
              <Form method="post">
                <button
                  type="submit"
                  name="intent"
                  value="unlink_discord"
                  className="btn-link-destructive"
                >
                  Unlink
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/auth/link/discord" className="btn btn-discord">
              Link Discord Account
            </Link>
          )}
          {user.github_id ? (
            <div className="linked-account">
              <span>
                <i className="fab fa-github"></i> GitHub Linked
              </span>
              <Form method="post">
                <button
                  type="submit"
                  name="intent"
                  value="unlink_github"
                  className="btn-link-destructive"
                >
                  Unlink
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/auth/link/github" className="btn btn-github">
              Link GitHub Account
            </Link>
          )}
        </div>
      </div>

      <Form method="post" className="profile-form">
        {isOAuthUser && (
          <div className="flash-message warning">
            <p>
              [ ATTENTION ] You are currently logged in via OAuth. Establish a
              permanent identity (Email/Password) to access the system via all
              terminals.
            </p>
          </div>
        )}

        <div className="form-group">
          <label>CODENAME</label>
          <input name="username" defaultValue={user.username || ""} />
        </div>

        <div className="form-group">
          <label>AVATAR_LINK</label>
          <input
            name="avatarUrl"
            defaultValue={user.avatar_url || ""}
            placeholder="https://..."
          />
        </div>

        <div className="form-group">
          <label className={user.email ? "label-disabled" : ""}>
            SECURE_MAIL {user.email ? "(READ-ONLY)" : "(ESTABLISH)"}
          </label>
          <input
            name="email"
            defaultValue={user.email || ""}
            disabled={!!user.email}
            placeholder="your@email.com"
          />
        </div>

        {!user.password_hash && (
          <div className="form-group">
            <label>ESTABLISH ACCESS_KEY (PASSWORD)</label>
            <input
              name="password"
              type="password"
              placeholder="Minimum 8 characters recommended"
            />
          </div>
        )}

        {actionData?.success && (
          <p className="success-message">Protocol updated successfully.</p>
        )}

        <button
          type="submit"
          name="intent"
          value="update_profile"
          className="btn btn-primary"
        >
          Commit Changes
        </button>
      </Form>

      <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>Deleting your identity is permanent and cannot be reversed.</p>
        <button
          className="btn btn-destructive"
          onClick={() =>
            alert("Identity deletion requires manual override (Contact Admin)")
          }
        >
          Purge Identity
        </button>
      </div>
    </div>
  );
}
