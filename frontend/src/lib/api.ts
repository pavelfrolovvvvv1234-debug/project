import { formatClientError } from "./errors";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export function getToken(): string | null {
  return localStorage.getItem("sitenet_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("sitenet_token", token);
  else localStorage.removeItem("sitenet_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(formatClientError(data.error) || `Ошибка HTTP ${res.status}`);
  }
  return data as T;
}

export type User = { id: string; email: string; role: string };

export type Network = {
  id: string;
  name: string;
  description?: string | null;
  _count?: { sites: number; links: number };
  sites?: { id: string; domain: string; title: string; status: string }[];
};

export type Site = {
  id: string;
  domain: string;
  title: string;
  niche?: string | null;
  status: string;
  network?: { id: string; name: string };
  tags?: { tag: { id: string; name: string } }[];
  seoSnapshots?: SeoSnapshot[];
  uptimeChecks?: UptimeCheck[];
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

export type SeoSnapshot = {
  id: string;
  checkedAt: string;
  pageTitle?: string | null;
  metaDescription?: string | null;
  h1?: string | null;
  canonical?: string | null;
  robotsTxtOk: boolean;
  seoScore: number;
  auditDetails?: SeoAuditDetails | null;
};

export type UptimeCheck = {
  id: string;
  checkedAt: string;
  statusCode?: number | null;
  responseMs?: number | null;
  isUp: boolean;
};

export type SiteKeyword = {
  id: string;
  keyword: string;
  googleVolume: number;
  yandexVolume: number;
  competition: number;
  difficulty: number;
  intent: string;
  site?: { id: string; domain: string; title: string };
};

export type BehavioralSnapshot = {
  id: string;
  checkedAt: string;
  bounceRate: number;
  avgTimeSec: number;
  pagesPerSession: number;
  scrollDepth: number;
  returnRate: number;
  engagementScore: number;
};

export type BehavioralTask = {
  id: string;
  title: string;
  description: string;
  status: "done" | "in_progress" | "planned";
  impact: "high" | "medium" | "low";
};

export type KeywordCloudData = {
  keywords: SiteKeyword[];
  totals: { google: number; yandex: number };
  count: number;
};

export type SiteLink = {
  id: string;
  anchorText: string;
  linkType: string;
  fromSite: { id: string; domain: string; title: string };
  toSite: { id: string; domain: string; title: string };
};

export type DashboardData = {
  stats: {
    networkCount: number;
    siteCount: number;
    activeSites: number;
    downSites: number;
    linkCount: number;
    avgSeoScore: number;
  };
  networks: Network[];
  recentChecks: {
    id: string;
    checkedAt: string;
    isUp: boolean;
    site: { domain: string; title: string };
  }[];
  siteStatuses: {
    id: string;
    domain: string;
    title: string;
    status: string;
    network?: { id: string; name: string };
    httpCode: number | null;
    responseMs: number | null;
    isUp: boolean;
    checkedAt: string | null;
  }[];
  httpSummary: {
    ok: number;
    redirect: number;
    clientError: number;
    serverError: number;
    unchecked: number;
  };
};
