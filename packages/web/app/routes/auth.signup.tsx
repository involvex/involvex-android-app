import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, Link, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "../services/db.server";
import { getSession, commitSession } from "../services/session.server";
import type { Env } from "../types/env";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    return redirect("/dashboard");
  }
  return json({});
}

export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.env as Env;
  const db = env.DB;
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  if (!email || !password || !username) {
    return json({ error: "Missing fields" }, { status: 400 });
  }

  const existingUser = await getUserByEmail(db, email);
  if (existingUser) {
    return json({ error: "User already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser(db, email, passwordHash, username);

  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", user.id);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Signup() {
  const actionData = useActionData<typeof action>();

  return (
    <div
      className="container"
      style={{ maxWidth: "400px", paddingTop: "4rem" }}
    >
      <h1 className="hacker-text">Establish Identity</h1>
      <Form
        method="post"
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          name="username"
          placeholder="Codename (Username)"
          required
          style={{
            padding: "0.5rem",
            background: "var(--color-dark-grey)",
            color: "var(--color-primary)",
            border: "1px solid var(--color-primary)",
          }}
        />
        <input
          name="email"
          type="email"
          placeholder="Secure-Mail (Email)"
          required
          style={{
            padding: "0.5rem",
            background: "var(--color-dark-grey)",
            color: "var(--color-primary)",
            border: "1px solid var(--color-primary)",
          }}
        />
        <input
          name="password"
          type="password"
          placeholder="Access-Key (Password)"
          required
          style={{
            padding: "0.5rem",
            background: "var(--color-dark-grey)",
            color: "var(--color-primary)",
            border: "1px solid var(--color-primary)",
          }}
        />
        {actionData?.error && (
          <p style={{ color: "var(--color-error-red)" }}>{actionData.error}</p>
        )}
        <button
          type="submit"
          style={{
            padding: "0.75rem",
            background: "var(--color-primary)",
            color: "var(--color-pure-black)",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          Initialize Account
        </button>
      </Form>
      <p style={{ marginTop: "1rem", textAlign: "center" }}>
        Already indexed?{" "}
        <Link to="/auth/login" style={{ color: "var(--color-secondary)" }}>
          Login
        </Link>
      </p>
    </div>
  );
}
