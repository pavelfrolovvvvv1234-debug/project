import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { api, type DashboardData } from "../lib/api";
import { Badge, Card, StatCard } from "../components/Layout";
import { PageLoader } from "../components/PageLoader";
import { SiteHttpStatusPanel } from "../components/SiteHttpStatusPanel";

export function DashboardPage() {
  const { push } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  async function load() {
    const res = await api<DashboardData>("/dashboard");
    setData(res);
  }

  useEffect(() => {
    load()
      .catch((e) => push(e instanceof Error ? e.message : "Ошибка", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function checkAll() {
    setChecking(true);
    try {
      const res = await api<{ checked: number }>("/dashboard/check-all", { method: "POST" });
      push(`Проверено сайтов: ${res.checked}`, "success");
      await load();
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка проверки", "error");
    } finally {
      setChecking(false);
    }
  }

  if (loading) return <PageLoader label="Загрузка панели..." />;
  if (!data) return <p className="text-rose-400">Не удалось загрузить данные</p>;

  const { stats, networks, siteStatuses, httpSummary } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Главная панель</h2>
        <p className="text-slate-400 text-sm mt-1">Сводка по сети</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard label="Сети" value={stats.networkCount} />
        <StatCard label="Сайты" value={stats.siteCount} />
        <StatCard label="HTTP 200" value={httpSummary.ok} hint="доступны" />
        <StatCard label="Недоступны" value={stats.downSites} />
        <StatCard label="Ссылки" value={stats.linkCount} />
        <StatCard label="Ср. оценка" value={`${stats.avgSeoScore}%`} />
      </div>

      <SiteHttpStatusPanel
        sites={siteStatuses}
        summary={httpSummary}
        checking={checking}
        onCheckAll={checkAll}
      />

      <Card>
        <h3 className="font-semibold mb-4">Сети проектов</h3>
        <div className="space-y-3">
          {networks.map((n) => (
            <Link
              key={n.id}
              to={`/networks/${n.id}`}
              className="block p-3 rounded-lg bg-slate-950/50 hover:bg-slate-800 transition"
            >
              <div className="flex justify-between items-center gap-2">
                <span className="font-medium">{n.name}</span>
                <Badge color="cyan">
                  {n._count?.sites ?? 0} сайтов · {n._count?.links ?? 0} ссылок
                </Badge>
              </div>
            </Link>
          ))}
          {networks.length === 0 && (
            <p className="text-slate-500 text-sm">
              <Link to="/networks" className="text-cyan-400 hover:underline">
                Создайте первую сеть
              </Link>
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
