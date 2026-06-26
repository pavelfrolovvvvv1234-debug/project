import * as cheerio from "cheerio";

export type SeoResult = {
  pageTitle: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robotsTxtOk: boolean;
  seoScore: number;
};

function normalizeUrl(domain: string): string {
  const trimmed = domain.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function calcScore(data: Omit<SeoResult, "seoScore">): number {
  let score = 0;
  if (data.pageTitle && data.pageTitle.length >= 10) score += 30;
  if (data.metaDescription && data.metaDescription.length >= 50) score += 30;
  if (data.h1 && data.h1.length >= 3) score += 25;
  if (data.canonical) score += 10;
  if (data.robotsTxtOk) score += 5;
  return Math.min(score, 100);
}

export async function analyzeSeo(domain: string): Promise<SeoResult> {
  const url = normalizeUrl(domain);
  const origin = new URL(url).origin;

  let pageTitle: string | null = null;
  let metaDescription: string | null = null;
  let h1: string | null = null;
  let canonical: string | null = null;
  let robotsTxtOk = false;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "SiteNet-Manager/1.0 (College Practice SEO Bot)" },
      signal: AbortSignal.timeout(12000),
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    pageTitle = $("title").first().text().trim() || null;
    metaDescription =
      $('meta[name="description"]').attr("content")?.trim() ||
      $('meta[property="og:description"]').attr("content")?.trim() ||
      null;
    h1 = $("h1").first().text().trim() || null;
    canonical = $('link[rel="canonical"]').attr("href")?.trim() || null;
  } catch {
    // leave defaults
  }

  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
    });
    robotsTxtOk = robotsRes.ok;
  } catch {
    robotsTxtOk = false;
  }

  const partial = { pageTitle, metaDescription, h1, canonical, robotsTxtOk };
  return { ...partial, seoScore: calcScore(partial) };
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
