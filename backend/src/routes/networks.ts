import { Router } from "express";
import { z } from "zod";
import { formatZodError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { assertNetworkOwner, ownerFilter } from "../middleware/ownership.js";
import { buildSitemapXml } from "../services/seo.js";

const router = Router();

const networkSchema = z.object({
  name: z.string().min(2, "Минимум 2 символа").max(120),
  description: z.string().max(500).optional(),
});

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const networks = await prisma.network.findMany({
    where: ownerFilter(req.user!),
    include: {
      _count: { select: { sites: true, links: true } },
      sites: {
        select: { id: true, domain: true, title: true, status: true },
        orderBy: { domain: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return res.json({ networks });
});

router.post("/", async (req, res) => {
  const parsed = networkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  const network = await prisma.network.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      ownerId: req.user!.id,
    },
  });
  return res.status(201).json({ network });
});

router.get("/:id", async (req, res) => {
  const network = await assertNetworkOwner(req.params.id, req.user!, res);
  if (!network) return;

  const full = await prisma.network.findUnique({
    where: { id: network.id },
    include: {
      sites: {
        include: {
          tags: { include: { tag: true } },
          seoSnapshots: { orderBy: { checkedAt: "desc" }, take: 1 },
          uptimeChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      },
      links: {
        include: {
          fromSite: { select: { id: true, domain: true, title: true } },
          toSite: { select: { id: true, domain: true, title: true } },
        },
      },
    },
  });

  return res.json({ network: full });
});

router.put("/:id", async (req, res) => {
  const network = await assertNetworkOwner(req.params.id, req.user!, res);
  if (!network) return;

  const parsed = networkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  const updated = await prisma.network.update({
    where: { id: network.id },
    data: parsed.data,
  });
  return res.json({ network: updated });
});

router.delete("/:id", async (req, res) => {
  const network = await assertNetworkOwner(req.params.id, req.user!, res);
  if (!network) return;

  await prisma.network.delete({ where: { id: network.id } });
  return res.status(204).send();
});

router.get("/:id/sitemap.xml", async (req, res) => {
  const network = await assertNetworkOwner(req.params.id, req.user!, res);
  if (!network) return;

  const sites = await prisma.site.findMany({
    where: { networkId: network.id, status: "active" },
    select: { domain: true, updatedAt: true },
  });

  const xml = buildSitemapXml(sites);
  res.setHeader("Content-Type", "application/xml");
  return res.send(xml);
});

router.get("/:id/export-links.csv", async (req, res) => {
  const network = await assertNetworkOwner(req.params.id, req.user!, res);
  if (!network) return;

  const links = await prisma.siteLink.findMany({
    where: { networkId: network.id },
    include: {
      fromSite: { select: { domain: true } },
      toSite: { select: { domain: true } },
    },
  });

  const header = "from_domain,to_domain,anchor_text,link_type\n";
  const rows = links
    .map(
      (l) =>
        `"${l.fromSite.domain}","${l.toSite.domain}","${l.anchorText.replace(/"/g, '""')}","${l.linkType}"`
    )
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="network-${network.id}-links.csv"`);
  return res.send("\uFEFF" + header + rows);
});

export default router;
