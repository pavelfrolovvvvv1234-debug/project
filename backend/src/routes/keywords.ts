import { Router } from "express";
import { z } from "zod";
import { formatZodError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { assertNetworkOwner, assertSiteOwner } from "../middleware/ownership.js";

const router = Router();

const keywordSchema = z.object({
  keyword: z.string().min(2).max(120),
  googleVolume: z.number().int().min(0).optional(),
  yandexVolume: z.number().int().min(0).optional(),
  difficulty: z.number().int().min(0).max(100).optional(),
  competition: z.number().int().min(0).max(100).optional(),
  intent: z.enum(["informational", "commercial", "navigational", "transactional"]).optional(),
});

router.use(authMiddleware);

router.get("/site/:siteId", async (req, res) => {
  const site = await assertSiteOwner(req.params.siteId, req.user!, res);
  if (!site) return;

  const keywords = await prisma.siteKeyword.findMany({
    where: { siteId: site.id },
    orderBy: { googleVolume: "desc" },
  });

  const totals = keywords.reduce(
    (acc, k) => ({
      google: acc.google + k.googleVolume,
      yandex: acc.yandex + k.yandexVolume,
    }),
    { google: 0, yandex: 0 }
  );

  return res.json({ keywords, totals, count: keywords.length });
});

router.get("/network/:networkId", async (req, res) => {
  const network = await assertNetworkOwner(req.params.networkId, req.user!, res);
  if (!network) return;

  const keywords = await prisma.siteKeyword.findMany({
    where: { site: { networkId: network.id } },
    include: { site: { select: { id: true, domain: true, title: true } } },
    orderBy: { googleVolume: "desc" },
  });

  const totals = keywords.reduce(
    (acc, k) => ({
      google: acc.google + k.googleVolume,
      yandex: acc.yandex + k.yandexVolume,
    }),
    { google: 0, yandex: 0 }
  );

  return res.json({ keywords, totals, count: keywords.length });
});

router.post("/site/:siteId", async (req, res) => {
  const site = await assertSiteOwner(req.params.siteId, req.user!, res);
  if (!site) return;

  const parsed = keywordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  const keyword = await prisma.siteKeyword.create({
    data: {
      siteId: site.id,
      keyword: parsed.data.keyword.toLowerCase(),
      googleVolume: parsed.data.googleVolume ?? 0,
      yandexVolume: parsed.data.yandexVolume ?? 0,
      competition: parsed.data.competition ?? 50,
      difficulty: parsed.data.difficulty ?? 50,
      intent: parsed.data.intent ?? "informational",
    },
  });

  return res.status(201).json({ keyword });
});

export default router;
