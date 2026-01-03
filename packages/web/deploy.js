import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function run(command, args, options = {}) {
  console.log(`> ${command} ${args.join(" ")}`);
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    ...options,
  });
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

console.log("Building Remix app...");
run("bun", ["run", "build"]);

console.log("Copying functions to build/client...");
const functionsDir = join("build", "client", "functions");
mkdirSync(functionsDir, { recursive: true });

const handlerContent = `
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '../../server';

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext: (context) => ({
    env: context.env,
  }),
});
`;

writeFileSync(join(functionsDir, "[[path]].js"), handlerContent.trim());

console.log("Deploying to Cloudflare Pages...");
// Note: Using 'app' as project name as 'involvex-app' creation failed. 
// You can rename this in Cloudflare Dashboard if needed.
run("npx", ["wrangler", "pages", "deploy", "build/client", "--project-name=app"]);
