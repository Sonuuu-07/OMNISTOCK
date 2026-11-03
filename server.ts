import express from "express";
import path from "path";
import { pathToFileURL } from "url";
import { createServer as createViteServer } from "vite";
import { setupRoutes } from "./server/routes";
import { errorHandler } from "./server/middleware";

export const app = express();

export async function startServer(port = Number(process.env.PORT) || 3000) {
  // Middleware for parsing JSON and URL encoded data
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Request logger & timing header
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      // Optional logging for dev insights
      if (req.path.startsWith("/api")) {
        console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
      }
    });
    next();
  });

  // Setup modular API routes
  setupRoutes(app);
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "NotFound", message: "API endpoint not found" });
  });
  app.use(errorHandler);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return new Promise((resolve, reject) => {
    const server = app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 OmniStock Logistics & Inventory Server running at http://0.0.0.0:${port}`);
      resolve(server);
    });

    server.on("error", (error) => {
      reject(error);
    });
  });
}

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exitCode = 1;
  });
}
