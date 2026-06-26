import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { api, getToken, type Network, type Site, type SiteLink } from "../lib/api";
import { Badge, Button, Card, Input, Textarea } from "../components/Layout";
import { LinkMatrix } from "../components/LinkMatrix";
import { PageLoader } from "../components/PageLoader";
import { SeoCloud } from "../components/SeoCloud";
import type { KeywordCloudData, SiteKeyword } from "../lib/api";

type NetworkDetail = Network & {
  sites: Site[];
  links: SiteLink[];
};

type MatrixData = {
  sites: { id: string; domain: string; title: string }[];
  matrix: {
    from: { id: string; domain: string; title: string };
    to: { site: { id: string; domain: string }; link: { id: string; anchorText: string; linkType: string } | null }[];
  }[];
  stats: { siteCount: number; linkCount: number; avgSeoScore: number };
};

export function NetworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { push } = useToast();
  const [network, setNetwork] = useState<NetworkDetail | null>(null);
  const [matrix, setMatrix] = useState<MatrixData | null>(null);
  const [tab, setTab] = useState<"sites" | "matrix" | "seo" | "export" | "edit">("sites");
  const [fromSiteId, setFromSiteId] = useState("");
  const [toSiteId, setToSiteId] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [linkType, setLinkType] = useState<"dofollow" | "nofollow">("dofollow");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [keywordData, setKeywordData] = useState<KeywordCloudData | null>(null);
  const [selectedKw, setSelectedKw] = useState<SiteKeyword | null>(null);

  async function load() {
    if (!id) return;
    const [net, mat, kw] = await Promise.all([
      api<{ network: NetworkDetail }>(`/networks/${id}`),
      api<MatrixData>(`/links/network/${id}/matrix`),
      api<KeywordCloudData>(`/keywords/network/${id}`),
    ]);
    setNetwork(net.network);
    setMatrix(mat);
    setKeywordData(kw);
    setEditName(net.network.name);
    setEditDescription(net.network.description ?? "");
  }

  useEffect(() => {
    load().catch((e) => push(e instanceof Error ? e.message : "Ошибка загрузки", "error"));
  }, [id]);

  async function createLink(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      await api("/links", {
        method: "POST",
        body: JSON.stringify({ networkId: id, fromSiteId, toSiteId, anchorText, linkType }),
      });
      setAnchorText("");
      push("Ссылка добавлена", "success");
      await load();
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    }
  }

  async function saveNetwork(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    try {
      await api(`/networks/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editName, description: editDescription }),
      });
      push("Сеть обновлена", "success");
      await load();
      setTab("sites");
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    }
  }

  async function deleteNetwork() {
    if (!id || !confirm("Удалить сеть и все её сайты?")) return;
    try {
      await api(`/networks/${id}`, { method: "DELETE" });
      push("Сеть удалена", "success");
      navigate("/networks");
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    }
  }

  async function downloadExport(path: string, filename: string) {
    const token = getToken();
    const base = import.meta.env.VITE_API_URL ?? "/api";
    const res = await fetch(`${base}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      push("Ошибка экспорта", "error");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    push("Файл скачан", "success");
  }

  if (!network) return <PageLoader label="Загрузка сети..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link to="/networks" className="text-sm text-cyan-400 hover:underline">
            ← Сети
          </Link>
          <h2 className="text-2xl font-bold mt-2">{network.name}</h2>
          {network.description && (
            <p className="text-slate-400 text-sm mt-1">{network.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {matrix && (
            <>
              <Badge color="cyan">{matrix.stats.siteCount} сайтов</Badge>
              <Badge color="green">{matrix.stats.linkCount} ссылок</Badge>
              <Badge color="yellow">SEO {matrix.stats.avgSeoScore}%</Badge>
            </>
          )}
          <Button variant="danger" onClick={deleteNetwork}>
            Удалить сеть
          </Button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-800 pb-2 flex-wrap">
        {(
          [
            ["sites", "Сайты"],
            ["matrix", "Матрица"],
            ["seo", "SEO-облако"],
            ["export", "Экспорт"],
            ["edit", "Редактировать"],
          ] as const
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`inline-flex items-center justify-center text-center px-4 py-2.5 rounded-lg text-sm leading-none ${
              tab === t ? "bg-cyan-600/30 text-cyan-300 font-medium" : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "sites" && (
        <div className="flex flex-col gap-2 max-w-2xl">
          {network.sites.map((site) => (
            <Link key={site.id} to={`/sites/${site.id}`}>
              <Card className="hover:border-cyan-700 transition">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-cyan-400 font-medium">{site.domain}</p>
                    <p className="text-sm text-slate-400 mt-1">{site.title}</p>
                  </div>
                  <Badge
                    color={
                      site.status === "active" ? "green" : site.status === "down" ? "red" : "yellow"
                    }
                  >
                    {site.status}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
          {network.sites.length === 0 && (
            <p className="text-slate-500">Добавьте сайты в разделе «Сайты»</p>
          )}
        </div>
      )}

      {tab === "matrix" && matrix && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold mb-4">Новая ссылка</h3>
            <form onSubmit={createLink} className="grid md:grid-cols-4 gap-3">
              <select
                value={fromSiteId}
                onChange={(e) => setFromSiteId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
                required
              >
                <option value="">Откуда</option>
                {network.sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.domain}
                  </option>
                ))}
              </select>
              <select
                value={toSiteId}
                onChange={(e) => setToSiteId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
                required
              >
                <option value="">Куда</option>
                {network.sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.domain}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Текст ссылки"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value as "dofollow" | "nofollow")}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
                >
                  <option value="dofollow">dofollow</option>
                  <option value="nofollow">nofollow</option>
                </select>
                <Button type="submit">+</Button>
              </div>
            </form>
          </Card>
          <LinkMatrix data={matrix} onDelete={load} />
        </div>
      )}

      {tab === "seo" && keywordData && (
        <SeoCloud
          keywords={keywordData.keywords}
          totals={keywordData.totals}
          selected={selectedKw}
          onSelect={setSelectedKw}
          showSite
        />
      )}

      {tab === "export" && id && (
        <Card>
          <h3 className="font-semibold mb-4">Экспорт</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => downloadExport(`/networks/${id}/sitemap.xml`, `sitemap-${id}.xml`)}>
              Sitemap.xml
            </Button>
            <Button variant="secondary" onClick={() => downloadExport(`/networks/${id}/export-links.csv`, `links-${id}.csv`)}>
              CSV матрицы
            </Button>
          </div>
        </Card>
      )}

      {tab === "edit" && (
        <Card className="max-w-lg">
          <h3 className="font-semibold mb-4">Редактировать сеть</h3>
          <form onSubmit={saveNetwork} className="space-y-3">
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            <Button type="submit">Сохранить</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
