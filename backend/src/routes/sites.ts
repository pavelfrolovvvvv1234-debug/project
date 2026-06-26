import { Router } from "express";
import { z } from "zod";
import { formatZodError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { assertNetworkOwner, assertSiteOwner, ownerFilter } from "../middleware/ownership.js";
import { analyzeSeo, checkUptime, renderTemplate } from "../services/seo.js";
import { analyzeBehavioral, buildBehavioralTasks } from "../services/behavioral.js";

const router = Router();

const siteSchema = z.object({
  networkId: z.string().min(1),
  domain: z.string().min(3).max(255),
  title: z.string().min(2).max(200),
  niche: z.string().max(100).optional(),
  status: z.enum(["active", "draft", "down"]).optional(),
  templateId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

const siteUpdateSchema = siteSchema.partial().omit({ networkId: true });

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const { networkId, status, search } = req.query;

  const sites = await prisma.site.findMany({
    where: {
      ...ownerFilter(req.user!),
      ...(networkId ? { networkId: String(networkId) } : {}),
      ...(status ? { status: String(status) } : {}),
      ...(search
        ? {
            OR: [
              { domain: { contains: String(search) } },
              { title: { contains: String(search) } },
              { niche: { contains: String(search) } },
            ],
          }
        : {}),
    },
    include: {
      network: { select: { id: true, name: true } },
      tags: { include: { tag: true } },
      seoSnapshots: { orderBy: { checkedAt: "desc" }, take: 1 },
      uptimeChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  return res.json({ sites });
});

router.post("/", async (req, res) => {
  const parsed = siteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  const network = await assertNetworkOwner(parsed.data.networkId, req.user!, res);
  if (!network) return;

  const tags = parsed.data.tags ?? [];
  const site = await prisma.site.create({
    data: {
      networkId: parsed.data.networkId,
      ownerId: req.user!.id,
      domain: parsed.data.domain.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      title: parsed.data.title,
      niche: parsed.data.niche,
      status: parsed.data.status ?? "draft",
      templateId: parsed.data.templateId ?? null,
      tags: {
        create: await Promise.all(
          tags.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name: name.toLowerCase() },
              create: { name: name.toLowerCase() },
              update: {},
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
    include: {
      tags: { include: { tag: true } },
      network: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({ site });
});

router.get("/:id", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const full = await prisma.site.findUnique({
    where: { id: site.id },
    include: {
      network: true,
      template: true,
      tags: { include: { tag: true } },
      seoSnapshots: { orderBy: { checkedAt: "desc" }, take: 20 },
      uptimeChecks: { orderBy: { checkedAt: "desc" }, take: 20 },
      behavioralSnapshots: { orderBy: { checkedAt: "desc" }, take: 20 },
      linksFrom: { include: { toSite: { select: { id: true, domain: true, title: true } } } },
      linksTo: { include: { fromSite: { select: { id: true, domain: true, title: true } } } },
    },
  });

  return res.json({ site: full });
});

router.put("/:id", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const parsed = siteUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  if (parsed.data.tags) {
    await prisma.siteTag.deleteMany({ where: { siteId: site.id } });
    for (const name of parsed.data.tags) {
      const tag = await prisma.tag.upsert({
        where: { name: name.toLowerCase() },
        create: { name: name.toLowerCase() },
        update: {},
      });
      await prisma.siteTag.create({ data: { siteId: site.id, tagId: tag.id } });
    }
  }

  const updated = await prisma.site.update({
    where: { id: site.id },
    data: {
      ...(parsed.data.domain
        ? { domain: parsed.data.domain.replace(/^https?:\/\//, "").replace(/\/$/, "") }
        : {}),
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.niche !== undefined ? { niche: parsed.data.niche } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.templateId !== undefined ? { templateId: parsed.data.templateId } : {}),
    },
    include: {
      tags: { include: { tag: true } },
      network: { select: { id: true, name: true } },
    },
  });

  return res.json({ site: updated });
});

router.delete("/:id", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  await prisma.site.delete({ where: { id: site.id } });
  return res.status(204).send();
});

router.post("/:id/seo-check", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const result = await analyzeSeo(site.domain);
  const snapshot = await prisma.seoSnapshot.create({
    data: {
      siteId: site.id,
      ...result,
    },
  });

  return res.json({ snapshot });
});

router.get("/:id/seo-history", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const history = await prisma.seoSnapshot.findMany({
    where: { siteId: site.id },
    orderBy: { checkedAt: "desc" },
    take: 50,
  });

  return res.json({ history });
});

router.post("/:id/uptime-check", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const result = await checkUptime(site.domain);
  const check = await prisma.uptimeCheck.create({
    data: {
      siteId: site.id,
      statusCode: result.statusCode,
      responseMs: result.responseMs,
      isUp: result.isUp,
    },
  });

  if (!result.isUp && site.status !== "down") {
    await prisma.site.update({ where: { id: site.id }, data: { status: "down" } });
  } else if (result.isUp && site.status === "down") {
    await prisma.site.update({ where: { id: site.id }, data: { status: "active" } });
  }

  return res.json({ check });
});

router.get("/:id/uptime-history", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const history = await prisma.uptimeCheck.findMany({
    where: { siteId: site.id },
    orderBy: { checkedAt: "desc" },
    take: 50,
  });

  return res.json({ history });
});

router.post("/:id/behavioral-check", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const latestSeo = await prisma.seoSnapshot.findFirst({
    where: { siteId: site.id },
    orderBy: { checkedAt: "desc" },
  });

  const metrics = analyzeBehavioral(site.domain, latestSeo?.seoScore ?? 50);
  const snapshot = await prisma.behavioralSnapshot.create({
    data: {
      siteId: site.id,
      ...metrics,
    },
  });

  const tasks = buildBehavioralTasks(metrics);

  return res.json({ snapshot, tasks });
});

router.get("/:id/behavioral-history", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const history = await prisma.behavioralSnapshot.findMany({
    where: { siteId: site.id },
    orderBy: { checkedAt: "desc" },
    take: 50,
  });

  const latest = history[0];
  const tasks = latest ? buildBehavioralTasks(latest) : [];

  return res.json({ history, tasks });
});

router.post("/:id/preview", async (req, res) => {
  const site = await assertSiteOwner(req.params.id, req.user!, res);
  if (!site) return;

  const full = await prisma.site.findUnique({
    where: { id: site.id },
    include: {
      template: true,
      linksFrom: { include: { toSite: true } },
    },
  });

  if (!full?.template) {
    return res.status(400).json({ error: "У сайта не назначен шаблон" });
  }

  const anchorLinks = full.linksFrom
    .map(
      (l) =>
        `<a href="https://${l.toSite.domain}" rel="${l.linkType === "nofollow" ? "nofollow" : ""}">${l.anchorText}</a>`
    )
    .join(" · ");

  const html = renderTemplate(full.template.htmlBody, {
    title: full.title,
    description: full.template.defaultMetaDescription,
    domain: full.domain,
    niche: full.niche ?? "",
    anchor_links: anchorLinks || "No outbound links yet",
  });

  return res.json({ html });
});

export default router;
