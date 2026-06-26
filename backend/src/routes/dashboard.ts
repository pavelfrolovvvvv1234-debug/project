import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { ownerFilter } from "../middleware/ownership.js";
import { checkUptime } from "../services/seo.js";

const router = Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const filter = ownerFilter(req.user!);
  const siteWhere = Object.keys(filter).length ? { site: filter } : {};

  const [networkCount, siteCount, activeSites, downSites, linkCount, seoAvg, recentChecks, sites] =
    await Promise.all([
      prisma.network.count({ where: filter }),
      prisma.site.count({ where: filter }),
      prisma.site.count({ where: { ...filter, status: "active" } }),
      prisma.site.count({ where: { ...filter, status: "down" } }),
      prisma.siteLink.count({
        where: Object.keys(filter).length ? { network: filter } : {},
      }),
      prisma.seoSnapshot.aggregate({
        _avg: { seoScore: true },
        where: siteWhere,
      }),
      prisma.uptimeCheck.findMany({
        where: siteWhere,
        orderBy: { checkedAt: "desc" },
        take: 5,
        include: { site: { select: { id: true, domain: true, title: true } } },
      }),
      prisma.site.findMany({
        where: filter,
        include: {
          network: { select: { id: true, name: true } },
          uptimeChecks: { orderBy: { checkedAt: "desc" }, take: 1 },
        },
        orderBy: { domain: "asc" },
      }),
    ]);

  const networks = await prisma.network.findMany({
    where: filter,
    include: {
      _count: { select: { sites: true, links: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const siteStatuses = sites.map((site) => {
    const check = site.uptimeChecks[0] ?? null;
    return {
      id: site.id,
      domain: site.domain,
      title: site.title,
      status: site.status,
      network: site.network,
      httpCode: check?.statusCode ?? null,
      responseMs: check?.responseMs ?? null,
      isUp: check?.isUp ?? false,
      checkedAt: check?.checkedAt ?? null,
    };
  });

  const httpSummary = {
    ok: siteStatuses.filter((s) => s.httpCode !== null && s.httpCode >= 200 && s.httpCode < 300).length,
    redirect: siteStatuses.filter((s) => s.httpCode !== null && s.httpCode >= 300 && s.httpCode < 400).length,
    clientError: siteStatuses.filter((s) => s.httpCode !== null && s.httpCode >= 400 && s.httpCode < 500).length,
    serverError: siteStatuses.filter((s) => s.httpCode !== null && s.httpCode >= 500).length,
    unchecked: siteStatuses.filter((s) => s.httpCode === null).length,
  };

  return res.json({
    stats: {
      networkCount,
      siteCount,
      activeSites,
      downSites,
      linkCount,
      avgSeoScore: Math.round(seoAvg._avg.seoScore ?? 0),
    },
    networks,
    recentChecks,
    siteStatuses,
    httpSummary,
  });
});

router.post("/check-all", async (req, res) => {
  const filter = ownerFilter(req.user!);
  const sites = await prisma.site.findMany({ where: filter });

  const results = [];
  for (const site of sites) {
    const result = await checkUptime(site.domain);
    const check = await prisma.uptimeCheck.create({
      data: {
        siteId: site.id,
        statusCode: result.statusCode,
        responseMs: result.responseMs,
        isUp: result.isUp,
      },
    });

    const newStatus = !result.isUp ? "down" : site.status === "down" ? "active" : site.status;
    if (newStatus !== site.status) {
      await prisma.site.update({ where: { id: site.id }, data: { status: newStatus } });
    }

    results.push({
      siteId: site.id,
      domain: site.domain,
      httpCode: check.statusCode,
      isUp: check.isUp,
      responseMs: check.responseMs,
    });
  }

  return res.json({ checked: results.length, results });
});

export default router;
