import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import app from "./server/app";

// Local development and self-hosting only. On Vercel, the API runs from api/[...path].ts
// and the website is served as static files, so this file is not used there.
const resolvedDirname = path.dirname(fileURLToPath(import.meta.url));

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const argPort = portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1], 10) : NaN;
const PORT = !isNaN(argPort) ? argPort : (process.env.NODE_ENV === "production" && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);

async function startServer() {
  let viteInstance: any = null;

  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    viteInstance = await createViteServer({
      server: { middlewareMode: true, hmr: isHmrDisabled ? false : undefined },
      appType: "spa",
    });
    app.use(viteInstance.middlewares);
  } else {
    const distPath = path.resolve(resolvedDirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Envision Eyewear Server] Live on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") console.error(`[Envision Eyewear Server] Port ${PORT} is already in use.`);
    else console.error("[Envision Eyewear Server] Server error:", err);
  });

  const cleanup = async () => {
    if (viteInstance) { try { await viteInstance.close(); } catch {} }
    server.close(() => process.exit(0));
  };
  process.on("SIGTERM", cleanup);
  process.on("SIGINT", cleanup);
}

startServer();
