import { Router } from "express";
import { z } from "zod";
import { formatZodError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { assertNetworkOwner, ownerFilter } from "../middleware/ownership.js";

const router = Router();

const linkSchema = z.object({
  networkId: z.string().min(1),
  fromSiteId: z.string().min(1),
  toSiteId: z.string().min(1),
  anchorText: z.string().min(1).max(200),
  linkType: z.enum(["dofollow", "nofollow"]).optional(),
});

router.use(authMiddleware);

router.get("/network/:networkId", async (req, res) => {
  const network = await assertNetworkOwner(req.params.networkId, req.user!, res);
  if (!network) return;

  const links = await prisma.siteLink.findMany({
    where: { networkId: network.id },
    include: {
      fromSite: { select: { id: true, domain: true, title: true } },
      toSite: { select: { id: true, domain: true, title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ links });
});

router.get("/network/:networkId/matrix", async (req, res) => {
  const network = await assertNetworkOwner(req.params.networkId, req.user!, res);
  if (!network) return;

  const sites = await prisma.site.findMany({
    where: { networkId: network.id },
    select: { id: true, domain: true, title: true },
    orderBy: { domain: "asc" },
  });

  const links = await prisma.siteLink.findMany({
    where: { networkId: network.id },
  });

  const matrix = sites.map((from) => ({
    from,
    to: sites.map((to) => {
      const link = links.find((l) => l.fromSiteId === from.id && l.toSiteId === to.id);
      return {
        site: to,
        link: link
          ? { id: link.id, anchorText: link.anchorText, linkType: link.linkType }
          : null,
      };
    }),
  }));

  const avgSeo = await prisma.seoSnapshot.aggregate({
    _avg: { seoScore: true },
    where: { site: { networkId: network.id } },
  });

  return res.json({
    sites,
    matrix,
    stats: {
      siteCount: sites.length,
      linkCount: links.length,
      avgSeoScore: Math.round(avgSeo._avg.seoScore ?? 0),
    },
  });
});

router.post("/", async (req, res) => {
  const parsed = linkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  if (parsed.data.fromSiteId === parsed.data.toSiteId) {
    return res.status(400).json({ error: "Нельзя ссылаться на тот же сайт" });
  }

  const network = await assertNetworkOwner(parsed.data.networkId, req.user!, res);
  if (!network) return;

  const siteFilter = ownerFilter(req.user!);

  const [fromSite, toSite] = await Promise.all([
    prisma.site.findFirst({
      where: { id: parsed.data.fromSiteId, networkId: network.id, ...siteFilter },
    }),
    prisma.site.findFirst({
      where: { id: parsed.data.toSiteId, networkId: network.id, ...siteFilter },
    }),
  ]);

  if (!fromSite || !toSite) {
    return res.status(400).json({ error: "Оба сайта должны принадлежать сети" });
  }

  const existing = await prisma.siteLink.findUnique({
    where: {
      fromSiteId_toSiteId: {
        fromSiteId: parsed.data.fromSiteId,
        toSiteId: parsed.data.toSiteId,
      },
    },
  });

  if (existing) {
    return res.status(409).json({ error: "Такая ссылка уже существует" });
  }

  const link = await prisma.siteLink.create({
    data: {
      networkId: network.id,
      fromSiteId: parsed.data.fromSiteId,
      toSiteId: parsed.data.toSiteId,
      anchorText: parsed.data.anchorText,
      linkType: parsed.data.linkType ?? "dofollow",
    },
    include: {
      fromSite: { select: { id: true, domain: true, title: true } },
      toSite: { select: { id: true, domain: true, title: true } },
    },
  });

  return res.status(201).json({ link });
});

router.delete("/:id", async (req, res) => {
  const filter = ownerFilter(req.user!);
  const link = await prisma.siteLink.findFirst({
    where: {
      id: req.params.id,
      network: Object.keys(filter).length ? { ownerId: req.user!.id } : {},
    },
  });

  if (!link) {
    return res.status(404).json({ error: "Ссылка не найдена" });
  }

  await prisma.siteLink.delete({ where: { id: link.id } });
  return res.status(204).send();
});

export default router;
