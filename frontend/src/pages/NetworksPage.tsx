import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { api, type Network } from "../lib/api";
import { Badge, Button, Card, Input, Textarea } from "../components/Layout";
import { PageLoader } from "../components/PageLoader";

export function NetworksPage() {
  const { push } = useToast();
  const [networks, setNetworks] = useState<Network[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  async function load() {
    const data = await api<{ networks: Network[] }>("/networks");
    setNetworks(data.networks);
  }

  useEffect(() => {
    load()
      .catch((e) => push(e instanceof Error ? e.message : "Ошибка", "error"))
      .finally(() => setInitialLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api("/networks", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      setName("");
      setDescription("");
      push("Сеть создана", "success");
      await load();
    } catch (e) {
      push(e instanceof Error ? e.message : "Ошибка", "error");
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) return <PageLoader />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">SEO-сети</h2>
        <p className="text-slate-400 text-sm">Группы связанных сайтов для перелинковки</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h3 className="font-semibold mb-4">Новая сеть</h3>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              placeholder="Travel Network Q2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Textarea
              placeholder="Описание сети..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Сохранение..." : "Создать сеть"}
            </Button>
          </form>
        </Card>

        <div className="lg:col-span-2 space-y-3">
          {networks.map((n) => (
            <Link key={n.id} to={`/networks/${n.id}`}>
              <Card className="hover:border-cyan-700 transition cursor-pointer">
                <div className="flex justify-between items-start gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{n.name}</h3>
                    {n.description && (
                      <p className="text-sm text-slate-400 mt-1">{n.description}</p>
                    )}
                  </div>
                  <Badge color="cyan">
                    {n._count?.sites ?? 0} сайтов · {n._count?.links ?? 0} ссылок
                  </Badge>
                </div>
                {n.sites && n.sites.length > 0 && (
                  <ul className="flex flex-col gap-1.5 border-t border-slate-800 pt-3">
                    {n.sites.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 text-sm"
                      >
                        <span className="text-cyan-400/90 truncate">{s.domain}</span>
                        <Badge color={s.status === "active" ? "green" : "yellow"}>
                          {s.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </Link>
          ))}
          {networks.length === 0 && (
            <Card>
              <p className="text-slate-500 text-sm">Создайте первую SEO-сеть слева</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
