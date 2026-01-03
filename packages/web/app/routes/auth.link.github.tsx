import { redirect, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { getSession } from "../services/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    return redirect("/auth/login?error=not_logged_in");
  }

  // Pass a state parameter to identify this as a linking request
  return redirect(`/auth/github?state=linking:github`);
}
