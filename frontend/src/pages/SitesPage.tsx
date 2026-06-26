import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { api, type Network, type Site } from "../lib/api";
import { Badge, Button, Card, Input } from "../components/Layout";
import { PageLoader } from "../components/PageLoader";

export function SitesPage() {
  const { push } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [networks, setNetworks] = useState<Network[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    networkId: "",
    domain: "",
    title: "",
    niche: "",
    tags: "",
  });

  async function load() {
    const [sitesRes, netsRes] = await Promise.all([
      api<{ sites: Site[] }>(`/sites${search ? `?search=${encodeURIComponent(search)}` : ""}`),
      api<{ networks: Network[] }>("/networks"),
    ]);
    setSites(sitesRes.sites);
    setNetworks(netsRes.networks);
    if (!form.networkId && netsRes.networks[0]) {
      setForm((f) => ({ ...f, networkId: netsRes.networks[0].id }));
    }
  }

  useEffect(() => {
    load()
      .catch((e) => push(e instanceof Error ? e.message : "Ошибка", "error"))
      .finally(() => setLoading(false));
  }, [search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/sites", {
        method: "POST",
        body: JSON.stringify({
          networkId: form.networkId,
          domain: form.domain,
          title: form.title,
          niche: form.niche,
          status: "active",
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      setForm((f) => ({ ...f, domain: "", title: "", niche: "", tags: "" }));
      push("Сайт добавлен", "success");
      await load();
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">Сайты</h2>
          <p className="text-slate-400 text-sm">Все сайты во всех сетях</p>
        </div>
        <Input
          placeholder="Поиск по домену или названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">Добавить сайт</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <select
              value={form.networkId}
              onChange={(e) => setForm({ ...form, networkId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700"
              required
            >
              {networks.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
            <Input
              placeholder="example.com"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              required
            />
            <Input
              placeholder="Название"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <Input
              placeholder="Ниша (travel, tech...)"
              value={form.niche}
              onChange={(e) => setForm({ ...form, niche: e.target.value })}
            />
            <Input
              placeholder="Теги через запятую"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Сохранение..." : "Добавить"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          {sites.map((site) => (
            <Link key={site.id} to={`/sites/${site.id}`}>
              <Card className="hover:border-cyan-700 transition">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-medium">{site.title}</h3>
                    <p className="text-cyan-400 text-sm">{site.domain}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {site.network?.name} {site.niche && `· ${site.niche}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {site.seoSnapshots?.[0] && (
                      <Badge color="yellow">SEO {site.seoSnapshots[0].seoScore}%</Badge>
                    )}
                    <Badge
                      color={
                        site.status === "active"
                          ? "green"
                          : site.status === "down"
                            ? "red"
                            : "yellow"
                      }
                    >
                      {site.status}
                    </Badge>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {sites.length === 0 && (
            <Card>
              <p className="text-slate-500 text-sm">Сайтов пока нет — добавьте первый</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
