import { Link } from "react-router-dom";
import { Badge, Button, Card } from "./Layout";

export type SiteStatusRow = {
  id: string;
  domain: string;
  title: string;
  status: string;
  network?: { id: string; name: string };
  httpCode: number | null;
  responseMs: number | null;
  isUp: boolean;
  checkedAt: string | null;
};

function httpStatusMeta(code: number | null, isUp: boolean) {
  if (code === null) {
    return { badge: "—", color: "slate" as const, label: "Не проверен", positive: false };
  }
  if (code >= 200 && code < 300) {
    return { badge: String(code), color: "green" as const, label: "OK", positive: true };
  }
  if (code >= 300 && code < 400) {
    return { badge: String(code), color: "yellow" as const, label: "Редирект", positive: true };
  }
  if (code === 404) {
    return { badge: "404", color: "red" as const, label: "Не найден", positive: false };
  }
  if (code >= 400 && code < 500) {
    return { badge: String(code), color: "red" as const, label: "Ошибка клиента", positive: false };
  }
  if (code >= 500) {
    return { badge: String(code), color: "red" as const, label: "Ошибка сервера", positive: false };
  }
  return {
    badge: isUp ? String(code) : "ERR",
    color: (isUp ? "green" : "red") as "green" | "red",
    label: isUp ? "Доступен" : "Недоступен",
    positive: isUp,
  };
}

export function SiteHttpStatusPanel({
  sites,
  summary,
  checking,
  onCheckAll,
}: {
  sites: SiteStatusRow[];
  summary: {
    ok: number;
    redirect: number;
    clientError: number;
    serverError: number;
    unchecked: number;
  };
  checking: boolean;
  onCheckAll: () => void;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold">HTTP-статус сайтов</h3>
          <p className="text-xs text-slate-500 mt-1">200 и 301 — норм, 404 и 5xx — нет</p>
        </div>
        <Button onClick={onCheckAll} disabled={checking}>
          {checking ? "Проверка..." : "Проверить все"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge color="green">200 OK: {summary.ok}</Badge>
        <Badge color="yellow">3xx: {summary.redirect}</Badge>
        <Badge color="red">404/4xx: {summary.clientError}</Badge>
        <Badge color="red">5xx: {summary.serverError}</Badge>
        {summary.unchecked > 0 && <Badge color="slate">не проверено: {summary.unchecked}</Badge>}
      </div>

      <div className="space-y-2">
        {sites.map((site) => {
          const meta = httpStatusMeta(site.httpCode, site.isUp);
          return (
            <Link
              key={site.id}
              to={`/sites/${site.id}`}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/50 hover:bg-slate-800/80 transition border border-slate-800/80"
            >
              <div className="min-w-0 flex-1">
                <p className="text-cyan-400 text-sm font-medium truncate">{site.domain}</p>
                <p className="text-xs text-slate-500 truncate">
                  {site.network?.name} · {site.title}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {site.responseMs != null && (
                  <span className="text-xs text-slate-500 hidden sm:inline">{site.responseMs} мс</span>
                )}
                <Badge color={meta.color}>{meta.badge}</Badge>
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                    meta.positive ? "bg-emerald-500" : site.httpCode === null ? "bg-slate-600" : "bg-rose-500"
                  }`}
                  title={meta.label}
                />
              </div>
            </Link>
          );
        })}
        {sites.length === 0 && (
          <p className="text-slate-500 text-sm">Сайтов пока нет</p>
        )}
      </div>
    </Card>
  );
}
