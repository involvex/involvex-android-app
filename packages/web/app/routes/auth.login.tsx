import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "../services/db.server";
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

  const user = await getUserByEmail(db, email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  session.set("userId", user.id);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '4rem' }}>
      <h1 className="hacker-text">System Access</h1>
      <Form method="post" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          name="email"
          type="email"
          placeholder="Secure-Mail (Email)"
          required
          style={{ padding: '0.5rem', background: 'var(--color-dark-grey)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
        />
        <input
          name="password"
          type="password"
          placeholder="Access-Key (Password)"
          required
          style={{ padding: '0.5rem', background: 'var(--color-dark-grey)', color: 'var(--color-primary)', border: '1px solid var(--color-primary)' }}
        />
        {actionData?.error && <p style={{ color: 'var(--color-error-red)' }}>{actionData.error}</p>}
        <button
          type="submit"
          style={{ padding: '0.75rem', background: 'var(--color-primary)', color: 'var(--color-pure-black)', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          Authenticate
        </button>
      </Form>

      <div style={{ margin: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-dark-green)' }}></div>
          <span style={{ color: 'var(--color-text-grey)', fontSize: '0.8rem' }}>OR OAUTH_ACCESS</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-dark-green)' }}></div>
        </div>

        <Link 
          to="/auth/discord" 
          style={{ 
            padding: '0.75rem', 
            background: '#5865F2', 
            color: 'white', 
            textAlign: 'center', 
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          Login with Discord
        </Link>
        <Link 
          to="/auth/github" 
          style={{ 
            padding: '0.75rem', 
            background: '#24292e', 
            color: 'white', 
            textAlign: 'center', 
            fontWeight: 'bold',
            textDecoration: 'none'
          }}
        >
          Login with GitHub
        </Link>
      </div>

      <p style={{ marginTop: '1rem', textAlign: 'center' }}>
        New entity? <Link to="/auth/signup" style={{ color: 'var(--color-secondary)' }}>Sign Up</Link>
      </p>
    </div>
  );
}
