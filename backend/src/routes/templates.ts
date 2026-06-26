import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (_req, res) => {
  const templates = await prisma.siteTemplate.findMany({
    orderBy: { name: "asc" },
  });
  return res.json({ templates });
});

router.get("/:id", async (req, res) => {
  const template = await prisma.siteTemplate.findUnique({ where: { id: req.params.id } });
  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }
  return res.json({ template });
});

export default router;
