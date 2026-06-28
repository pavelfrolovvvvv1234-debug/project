import type { SeoAuditDetails, SeoSnapshot } from "../lib/api";
import { Badge, Card } from "./Layout";

function statusBadge(ok: boolean) {
  return <Badge color={ok ? "green" : "red"}>{ok ? "OK" : "Нет"}</Badge>;
}

export function SeoAuditPanel({ snapshot }: { snapshot: SeoSnapshot }) {
  const audit = snapshot.auditDetails;
  if (!audit) {
    return (
      <p className="text-slate-500 text-sm">
        Запусти SEO-анализ ещё раз — старый снимок без расширенного аудита.
      </p>
    );
  }

  if (!audit.fetchOk && audit.fetchError) {
    return (
      <Card className="border-rose-900/50">
        <p className="text-rose-300 text-sm">Сайт не открылся: {audit.fetchError}</p>
        <p className="text-slate-500 text-xs mt-2">Проверь домен или попробуй реальный сайт (github.com, wikipedia.org).</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="!p-3 text-center">
          <p className="text-xs text-slate-400">Время ответа</p>
          <p className="text-xl font-bold text-cyan-300">{audit.tech.responseMs} мс</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-xs text-slate-400">Размер HTML</p>
          <p className="text-xl font-bold text-amber-300">{audit.tech.pageSizeKb} KB</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-xs text-slate-400">HTTPS</p>
          <p className="text-xl font-bold mt-1">{statusBadge(audit.tech.https)}</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-xs text-slate-400">HTTP-код</p>
          <p className="text-xl font-bold text-white">{audit.statusCode ?? "—"}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h4 className="font-semibold mb-3">Open Graph</h4>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-slate-400">og:title</dt>
              <dd>{audit.openGraph.title ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-400">og:description</dt>
              <dd className="text-slate-300">{audit.openGraph.description ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-400">og:image</dt>
              <dd className="break-all text-cyan-400 text-xs">{audit.openGraph.image ?? "—"}</dd>
            </div>
            <div className="flex gap-4">
              <div>
                <dt className="text-slate-400">og:type</dt>
                <dd>{audit.openGraph.type ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">twitter:card</dt>
                <dd>{audit.openGraph.twitterCard ?? "—"}</dd>
              </div>
            </div>
          </dl>
          {audit.openGraph.image && (
            <img
              src={audit.openGraph.image}
              alt="og preview"
              className="mt-3 rounded-lg border border-slate-700 max-h-32 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </Card>

        <Card>
          <h4 className="font-semibold mb-3">JSON-LD / Schema.org</h4>
          {audit.structuredData.hasJsonLd ? (
            <div className="flex flex-wrap gap-2">
              {audit.structuredData.types.map((t) => (
                <Badge key={t} color="cyan">
                  {t}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Разметка не найдена</p>
          )}
        </Card>
      </div>

      <Card>
        <h4 className="font-semibold mb-3">SEO-чеклист</h4>
        <ul className="space-y-2">
          {audit.checklist.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 text-sm py-1 border-b border-slate-800/50">
              <span className={item.ok ? "text-slate-200" : "text-slate-400"}>{item.label}</span>
              <div className="flex items-center gap-2 shrink-0">
                {item.hint && <span className="text-xs text-slate-500">{item.hint}</span>}
                {statusBadge(item.ok)}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mt-3">
          Ссылок: {audit.checklist.internalLinks} внутр. / {audit.checklist.externalLinks} внешн.
        </p>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <h4 className="font-semibold mb-3">robots.txt</h4>
          {audit.robots.ok ? (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {statusBadge(true)}
                {audit.robots.hasDisallow && <Badge color="yellow">есть Disallow</Badge>}
                {audit.robots.sitemapUrl && <Badge color="cyan">sitemap в robots</Badge>}
              </div>
              <pre className="text-xs bg-slate-950 p-3 rounded-lg overflow-x-auto text-slate-400 whitespace-pre-wrap">
                {audit.robots.preview ?? "—"}
              </pre>
            </>
          ) : (
            <p className="text-slate-500 text-sm">Файл не найден или недоступен</p>
          )}
        </Card>

        <Card>
          <h4 className="font-semibold mb-3">sitemap.xml</h4>
          {audit.sitemap.ok ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">URL</dt>
                <dd className="text-cyan-400 text-xs break-all max-w-[60%] text-right">{audit.sitemap.url}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Страниц в карте</dt>
                <dd>{audit.sitemap.urlCount}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-slate-400">Домен в sitemap</dt>
                <dd>{statusBadge(audit.sitemap.domainInSitemap)}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500 text-sm">Sitemap не найден</p>
          )}
        </Card>
      </div>
    </div>
  );
}
