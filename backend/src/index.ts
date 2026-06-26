import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.js";
import networkRoutes from "./routes/networks.js";
import siteRoutes from "./routes/sites.js";
import linkRoutes from "./routes/links.js";
import templateRoutes from "./routes/templates.js";
import keywordRoutes from "./routes/keywords.js";
import dashboardRoutes from "./routes/dashboard.js";
import { openApiSpec } from "./swagger.js";

const app = express();
const PORT = Number(process.env.PORT ?? 3001);
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err && typeof err === "object" && "type" in err && (err as { type: string }).type === "entity.parse.failed") {
    return res.status(400).json({ error: "Некорректный JSON в теле запроса" });
  }
  next(err);
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "SiteNet Manager API", timestamp: new Date().toISOString() });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get("/api/openapi.json", (_req, res) => res.json(openApiSpec));

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/networks", networkRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/keywords", keywordRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(PORT, () => {
  console.log(`SiteNet API running on http://localhost:${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
});
