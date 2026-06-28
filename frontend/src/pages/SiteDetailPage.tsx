import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { api, type BehavioralSnapshot, type BehavioralTask, type KeywordCloudData, type SeoSnapshot, type Site, type SiteKeyword, type UptimeCheck } from "../lib/api";
import { Badge, Button, Card, Input } from "../components/Layout";
import { PageLoader } from "../components/PageLoader";
import { SeoCloud } from "../components/SeoCloud";
import { BehavioralFactorsPanel } from "../components/BehavioralFactorsPanel";
import { SeoAuditPanel } from "../components/SeoAuditPanel";

type SiteDetail = Site & {
  seoSnapshots: SeoSnapshot[];
  uptimeChecks: UptimeCheck[];
  behavioralSnapshots: BehavioralSnapshot[];
  linksFrom: { id: string; anchorText: string; toSite: { domain: string } }[];
  linksTo: { id: string; anchorText: string; fromSite: { domain: string } }[];
  template?: { id: string; name: string } | null;
};

export function SiteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [site, setSite] = useState<SiteDetail | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: "", domain: "", niche: "", status: "active" });
  const [keywordData, setKeywordData] = useState<KeywordCloudData | null>(null);
  const [selectedKw, setSelectedKw] = useState<SiteKeyword | null>(null);
  const [behavioralTasks, setBehavioralTasks] = useState<BehavioralTask[]>([]);

  async function load() {
    if (!id) return;
    const [siteRes, kwRes] = await Promise.all([
      api<{ site: SiteDetail }>(`/sites/${id}`),
      api<KeywordCloudData>(`/keywords/site/${id}`),
    ]);
    setSite(siteRes.site);
    setKeywordData(kwRes);
    if (siteRes.site.behavioralSnapshots?.[0]) {
      const hist = await api<{ tasks: BehavioralTask[] }>(`/sites/${id}/behavioral-history`);
      setBehavioralTasks(hist.tasks);
    } else {
      setBehavioralTasks([]);
    }
    setForm({
      title: siteRes.site.title,
      domain: siteRes.site.domain,
      niche: siteRes.site.niche ?? "",
      status: siteRes.site.status,
    });
  }

  useEffect(() => {
    load().catch((e) => push(e instanceof Error ? e.message : "Ошибка", "error"));
  }, [id]);

  async function runCheck(type: "seo" | "uptime" | "behavioral") {
    if (!id) return;
    setLoading(type);
    try {
      if (type === "behavioral") {
        const data = await api<{ snapshot: BehavioralSnapshot; tasks: BehavioralTask[] }>(
          `/sites/${id}/behavioral-check`,
          { method: "POST" }
        );
        setBehavioralTasks(data.tasks);
        push("Готово", "success");
        await load();
      } else {
        await api(`/sites/${id}/${type}-check`, { method: "POST" });
        push(type === "seo" ? "Готово" : "Uptime проверен", "success");
        await load();
      }
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    } finally {
      setLoading("");
    }
  }

  async function loadPreview() {
    if (!id) return;
    try {
      const data = await api<{ html: string }>(`/sites/${id}/preview`, { method: "POST" });
      setPreview(data.html);
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка превью", "error");
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      await api(`/sites/${id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      push("Сайт обновлён", "success");
      setEditing(false);
      await load();
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    }
  }

  async function deleteSite() {
    if (!id || !confirm("Удалить этот сайт?")) return;
    try {
      await api(`/sites/${id}`, { method: "DELETE" });
      push("Сайт удалён", "success");
      navigate("/sites");
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    }
  }

  if (!site) return <PageLoader label="Загрузка сайта..." />;

  const latestSeo = site.seoSnapshots[0];
  const latestUptime = site.uptimeChecks[0];
  const latestBehavioral = site.behavioralSnapshots?.[0] ?? null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/sites" className="text-sm text-cyan-400 hover:underline">
          ← Сайты
        </Link>
        <div className="flex justify-between items-start mt-2 gap-4 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold">{site.title}</h2>
            <p className="text-cyan-400">{site.domain}</p>
            <p className="text-sm text-slate-400 mt-1">
              {site.network?.name} · {site.niche ?? "без ниши"}
            </p>
          </div>
          <Badge color={site.status === "active" ? "green" : site.status === "down" ? "red" : "yellow"}>
            {site.status}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => runCheck("seo")} disabled={!!loading}>
          {loading === "seo" ? "..." : "Проверить страницу"}
        </Button>
        <Button variant="secondary" onClick={() => runCheck("uptime")} disabled={!!loading}>
          {loading === "uptime" ? "Проверка..." : "Проверка uptime"}
        </Button>
        {site.template && (
          <Button variant="ghost" onClick={loadPreview}>
            Превью шаблона
          </Button>
        )}
        <Button variant="secondary" onClick={() => setEditing((v) => !v)}>
          {editing ? "Отмена" : "Редактировать"}
        </Button>
        <Button variant="danger" onClick={deleteSite}>
          Удалить
        </Button>
      </div>

      {editing && (
        <Card className="max-w-lg">
          <form onSubmit={saveEdit} className="space-y-3">
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Input value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
            <Input value={form.niche} onChange={(e) => setForm({ ...form, niche: e.target.value })} />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
            >
              <option value="active">active</option>
              <option value="draft">draft</option>
              <option value="down">down</option>
            </select>
            <Button type="submit">Сохранить изменения</Button>
          </form>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">Сводка</h3>
          {latestSeo ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Оценка</dt>
                <dd className="font-bold text-amber-300">{latestSeo.seoScore}%</dd>
              </div>
              <div>
                <dt className="text-slate-400">Title</dt>
                <dd>{latestSeo.pageTitle ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Description</dt>
                <dd className="text-slate-300">{latestSeo.metaDescription ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">H1</dt>
                <dd>{latestSeo.h1 ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">robots.txt</dt>
                <dd>{latestSeo.robotsTxtOk ? "OK" : "Нет"}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500 text-sm">Пока пусто</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Доступность</h3>
          {latestUptime ? (
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Статус</dt>
                <dd>
                  <Badge color={latestUptime.isUp ? "green" : "red"}>
                    {latestUptime.isUp ? "Доступен" : "Недоступен"}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">HTTP-код</dt>
                <dd>{latestUptime.statusCode ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Время ответа</dt>
                <dd>{latestUptime.responseMs ?? "—"} мс</dd>
              </div>
            </dl>
          ) : (
            <p className="text-slate-500 text-sm">Пока нет данных — нажми проверку uptime</p>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Исходящие ссылки</h3>
          <ul className="text-sm space-y-1">
            {site.linksFrom.map((l) => (
              <li key={l.id}>
                → <span className="text-cyan-400">{l.toSite.domain}</span> ({l.anchorText})
              </li>
            ))}
            {site.linksFrom.length === 0 && <li className="text-slate-500">Нет исходящих ссылок</li>}
          </ul>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Входящие ссылки</h3>
          <ul className="text-sm space-y-1">
            {site.linksTo.map((l) => (
              <li key={l.id}>
                ← <span className="text-cyan-400">{l.fromSite.domain}</span> ({l.anchorText})
              </li>
            ))}
            {site.linksTo.length === 0 && <li className="text-slate-500">Нет входящих ссылок</li>}
          </ul>
        </Card>
      </div>

      {latestSeo && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Подробности</h3>
          <SeoAuditPanel snapshot={latestSeo} />
        </div>
      )}

      {keywordData && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Ключевые слова</h3>
          <SeoCloud
            keywords={keywordData.keywords}
            totals={keywordData.totals}
            selected={selectedKw}
            onSelect={setSelectedKw}
          />
        </div>
      )}

      <BehavioralFactorsPanel
        snapshot={latestBehavioral}
        tasks={behavioralTasks}
        loading={loading === "behavioral"}
        onAnalyze={() => runCheck("behavioral")}
      />

      {preview && (
        <Card>
          <h3 className="font-semibold mb-4">Превью лендинга</h3>
          <iframe
            srcDoc={preview}
            title="preview"
            className="w-full h-96 rounded-lg border border-slate-700 bg-white"
          />
        </Card>
      )}
    </div>
  );
}
