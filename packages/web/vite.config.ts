// import  stylesheet  from '~/styles/global.css?url';
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3030,
    strictPort: true,
    allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "1.1.1.1"],
  },
  build: {
    sourcemap: false,
    outDir: "build",
    assetsDir: "assets",
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
});
