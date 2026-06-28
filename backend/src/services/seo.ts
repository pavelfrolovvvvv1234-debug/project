import * as cheerio from "cheerio";

export type SeoResult = {
  pageTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robotsTxtOk: boolean;
  seoScore: number;
  auditDetails: SeoAuditDetails;
};

export type SeoAuditDetails = {
  fetchOk: boolean;
  fetchError?: string;
  statusCode?: number;
  openGraph: {
    title: string | null;
    description: string | null;
    image: string | null;
    type: string | null;
    twitterCard: string | null;
    twitterTitle: string | null;
  };
  checklist: {
    h1Count: number;
    h2Count: number;
    wordCount: number;
    internalLinks: number;
    externalLinks: number;
    imagesTotal: number;
    imagesMissingAlt: number;
    hasViewport: boolean;
    hasLang: boolean;
    items: { id: string; label: string; ok: boolean; hint?: string }[];
  };
  robots: {
    ok: boolean;
    hasDisallow: boolean;
    sitemapUrl: string | null;
    preview: string | null;
  };
  sitemap: {
    ok: boolean;
    url: string | null;
    urlCount: number;
    domainInSitemap: boolean;
  };
  tech: {
    https: boolean;
    responseMs: number;
    pageSizeKb: number;
    finalUrl: string | null;
  };
  structuredData: {
    hasJsonLd: boolean;
    types: string[];
  };
};

function normalizeUrl(domain: string): string {
  const trimmed = domain.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function countWords(text: string): number {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  return words.length;
}

function parseJsonLdTypes(html: string): string[] {
  const types = new Set<string>();
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      const list = Array.isArray(data) ? data : [data];
      for (const item of list) {
        if (item?.["@type"]) {
          const t = item["@type"];
          if (Array.isArray(t)) t.forEach((x) => types.add(String(x)));
          else types.add(String(t));
        }
        if (item?.["@graph"] && Array.isArray(item["@graph"])) {
          for (const node of item["@graph"]) {
            if (node?.["@type"]) types.add(String(node["@type"]));
          }
        }
      }
    } catch {
      // skip invalid json-ld
    }
  }
  return [...types];
}

function countSitemapUrls(xml: string): number {
  const locMatches = xml.match(/<loc>/gi);
  return locMatches?.length ?? 0;
}

function buildChecklist(
  $: cheerio.CheerioAPI,
  pageOrigin: string,
  pageTitle: string | null,
  metaDescription: string | null,
  h1: string | null,
  h1Count: number
): SeoAuditDetails["checklist"] {
  const bodyText = $("body").text();
  const wordCount = countWords(bodyText);

  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href")?.trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    try {
      const linkUrl = new URL(href, pageOrigin);
      if (linkUrl.origin === pageOrigin) internalLinks++;
      else externalLinks++;
    } catch {
      internalLinks++;
    }
  });

  let imagesTotal = 0;
  let imagesMissingAlt = 0;
  $("img").each((_, el) => {
    imagesTotal++;
    const alt = $(el).attr("alt");
    if (alt === undefined || alt.trim() === "") imagesMissingAlt++;
  });

  const hasViewport = $('meta[name="viewport"]').length > 0;
  const hasLang = Boolean($("html").attr("lang")?.trim());
  const h2Count = $("h2").length;

  const items = [
    {
      id: "title",
      label: "Title (от 10 символов)",
      ok: Boolean(pageTitle && pageTitle.length >= 10),
      hint: pageTitle ? `${pageTitle.length} симв.` : "не найден",
    },
    {
      id: "description",
      label: "Meta description (от 50 символов)",
      ok: Boolean(metaDescription && metaDescription.length >= 50),
      hint: metaDescription ? `${metaDescription.length} симв.` : "не найден",
    },
    {
      id: "h1-single",
      label: "Один H1 на странице",
      ok: h1Count === 1,
      hint: `найдено: ${h1Count}`,
    },
    {
      id: "h1-text",
      label: "H1 не пустой",
      ok: Boolean(h1 && h1.length >= 3),
    },
    {
      id: "h2",
      label: "Есть подзаголовки H2",
      ok: h2Count >= 1,
      hint: `${h2Count} шт.`,
    },
    {
      id: "words",
      label: "Достаточно текста (300+ слов)",
      ok: wordCount >= 300,
      hint: `${wordCount} слов`,
    },
    {
      id: "alt",
      label: "У картинок есть alt",
      ok: imagesTotal === 0 || imagesMissingAlt === 0,
      hint: imagesMissingAlt > 0 ? `без alt: ${imagesMissingAlt}` : `${imagesTotal} img`,
    },
    {
      id: "viewport",
      label: "Meta viewport (мобилка)",
      ok: hasViewport,
    },
    {
      id: "lang",
      label: "Атрибут lang у <html>",
      ok: hasLang,
    },
  ];

  return {
    h1Count,
    h2Count,
    wordCount,
    internalLinks,
    externalLinks,
    imagesTotal,
    imagesMissingAlt,
    hasViewport,
    hasLang,
    items,
  };
}

function calcScore(
  data: Pick<SeoResult, "pageTitle" | "metaDescription" | "h1" | "canonical" | "robotsTxtOk">,
  audit: SeoAuditDetails
): number {
  let score = 0;
  if (data.pageTitle && data.pageTitle.length >= 10) score += 20;
  if (data.metaDescription && data.metaDescription.length >= 50) score += 20;
  if (data.h1 && data.h1.length >= 3) score += 15;
  if (audit.checklist.h1Count === 1) score += 5;
  if (data.canonical) score += 5;
  if (data.robotsTxtOk) score += 5;
  if (audit.openGraph.title || audit.openGraph.image) score += 5;
  if (audit.structuredData.hasJsonLd) score += 5;
  if (audit.sitemap.ok) score += 5;
  if (audit.tech.https) score += 5;
  if (audit.checklist.hasViewport) score += 5;
  if (audit.checklist.wordCount >= 300) score += 5;
  if (audit.fetchOk && (audit.statusCode ?? 0) >= 200 && (audit.statusCode ?? 0) < 400) score += 5;
  return Math.min(score, 100);
}

async function analyzeRobots(origin: string): Promise<SeoAuditDetails["robots"]> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": "SiteNet-Manager/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { ok: false, hasDisallow: false, sitemapUrl: null, preview: null };
    }
    const text = await res.text();
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const sitemapLine = lines.find((l) => l.toLowerCase().startsWith("sitemap:"));
    const sitemapUrl = sitemapLine ? sitemapLine.split(":").slice(1).join(":").trim() : null;
    const hasDisallow = lines.some((l) => l.toLowerCase().startsWith("disallow:") && !l.match(/disallow:\s*$/i));
    return {
      ok: true,
      hasDisallow,
      sitemapUrl,
      preview: lines.slice(0, 6).join("\n"),
    };
  } catch {
    return { ok: false, hasDisallow: false, sitemapUrl: null, preview: null };
  }
}

async function analyzeSitemap(origin: string, domain: string, robotsSitemapUrl: string | null): Promise<SeoAuditDetails["sitemap"]> {
  const candidates = [
    robotsSitemapUrl,
    `${origin}/sitemap.xml`,
    `${origin}/sitemap_index.xml`,
  ].filter(Boolean) as string[];

  const domainHost = domain.replace(/^https?:\/\//, "").split("/")[0].toLowerCase();

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "SiteNet-Manager/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const urlCount = countSitemapUrls(xml);
      const domainInSitemap = xml.toLowerCase().includes(domainHost);
      return { ok: true, url: url, urlCount, domainInSitemap };
    } catch {
      continue;
    }
  }

  return { ok: false, url: null, urlCount: 0, domainInSitemap: false };
}

export async function analyzeSeo(domain: string): Promise<SeoResult> {
  const url = normalizeUrl(domain);
  const origin = new URL(url).origin;
  const started = Date.now();

  let pageTitle: string | null = null;
  let metaDescription: string | null = null;
  let h1: string | null = null;
  let canonical: string | null = null;
  let html = "";
  let fetchOk = false;
  let fetchError: string | undefined;
  let statusCode: number | undefined;
  let finalUrl: string | null = null;

  const emptyAudit = (): SeoAuditDetails => ({
    fetchOk: false,
    fetchError,
    statusCode,
    openGraph: { title: null, description: null, image: null, type: null, twitterCard: null, twitterTitle: null },
    checklist: {
      h1Count: 0,
      h2Count: 0,
      wordCount: 0,
      internalLinks: 0,
      externalLinks: 0,
      imagesTotal: 0,
      imagesMissingAlt: 0,
      hasViewport: false,
      hasLang: false,
      items: [],
    },
    robots: { ok: false, hasDisallow: false, sitemapUrl: null, preview: null },
    sitemap: { ok: false, url: null, urlCount: 0, domainInSitemap: false },
    tech: { https: url.startsWith("https://"), responseMs: Date.now() - started, pageSizeKb: 0, finalUrl: null },
    structuredData: { hasJsonLd: false, types: [] },
  });

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "SiteNet-Manager/1.0" },
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    statusCode = response.status;
    finalUrl = response.url;
    fetchOk = response.ok;
    if (!response.ok) fetchError = `HTTP ${response.status}`;
    html = await response.text();
  } catch (e) {
    fetchError = e instanceof Error ? e.message : "Не удалось открыть сайт";
  }

  const responseMs = Date.now() - started;
  const pageSizeKb = Math.round((html.length / 1024) * 10) / 10;

  if (!html) {
    const robots = await analyzeRobots(origin);
    const sitemap = await analyzeSitemap(origin, domain, robots.sitemapUrl);
    const audit = emptyAudit();
    audit.robots = robots;
    audit.sitemap = sitemap;
    audit.tech = { https: url.startsWith("https://"), responseMs, pageSizeKb: 0, finalUrl };
    return {
      pageTitle: null,
      metaDescription: null,
      h1: null,
      canonical: null,
      robotsTxtOk: robots.ok,
      seoScore: 0,
      auditDetails: audit,
    };
  }

  const $ = cheerio.load(html);
  pageTitle = $("title").first().text().trim() || null;
  metaDescription =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    null;
  h1 = $("h1").first().text().trim() || null;
  canonical = $('link[rel="canonical"]').attr("href")?.trim() || null;
  const h1Count = $("h1").length;

  const pageOrigin = finalUrl ? new URL(finalUrl).origin : origin;

  const openGraph = {
    title: $('meta[property="og:title"]').attr("content")?.trim() || null,
    description: $('meta[property="og:description"]').attr("content")?.trim() || null,
    image: $('meta[property="og:image"]').attr("content")?.trim() || null,
    type: $('meta[property="og:type"]').attr("content")?.trim() || null,
    twitterCard: $('meta[name="twitter:card"]').attr("content")?.trim() || null,
    twitterTitle: $('meta[name="twitter:title"]').attr("content")?.trim() || null,
  };

  const checklist = buildChecklist($, pageOrigin, pageTitle, metaDescription, h1, h1Count);
  const jsonLdTypes = parseJsonLdTypes(html);
  const structuredData = {
    hasJsonLd: jsonLdTypes.length > 0,
    types: jsonLdTypes,
  };

  const robots = await analyzeRobots(origin);
  const sitemap = await analyzeSitemap(origin, domain, robots.sitemapUrl);

  const auditDetails: SeoAuditDetails = {
    fetchOk,
    fetchError,
    statusCode,
    openGraph,
    checklist,
    robots,
    sitemap,
    tech: {
      https: (finalUrl ?? url).startsWith("https://"),
      responseMs,
      pageSizeKb,
      finalUrl,
    },
    structuredData,
  };

  const partial = {
    pageTitle,
    metaDescription,
    h1,
    canonical,
    robotsTxtOk: robots.ok,
  };

  return {
    ...partial,
    seoScore: calcScore(partial, auditDetails),
    auditDetails,
  };
}

export async function checkUptime(domain: string) {
  const url = normalizeUrl(domain);
  const started = Date.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "SiteNet-Manager/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    const responseMs = Date.now() - started;
    return {
      statusCode: response.status,
      responseMs,
      isUp: response.status >= 200 && response.status < 400,
    };
  } catch {
    return {
      statusCode: null,
      responseMs: Date.now() - started,
      isUp: false,
    };
  }
}

export function buildSitemapXml(sites: { domain: string; updatedAt: Date }[]): string {
  const urls = sites
    .map((site) => {
      const loc = site.domain.startsWith("http") ? site.domain : `https://${site.domain}`;
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${site.updatedAt.toISOString().split("T")[0]}</lastmod>\n  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export function renderTemplate(
  htmlBody: string,
  vars: Record<string, string>
): string {
  let result = htmlBody;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}
