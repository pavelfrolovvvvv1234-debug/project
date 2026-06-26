import type { BehavioralSnapshot, BehavioralTask } from "../lib/api";
import { Badge, Button, Card } from "./Layout";

function metricColor(value: number, invert = false): "green" | "yellow" | "red" {
  const good = invert ? value <= 40 : value >= 70;
  const mid = invert ? value <= 60 : value >= 45;
  if (good) return "green";
  if (mid) return "yellow";
  return "red";
}

function metricTextClass(value: number, invert = false): string {
  const color = metricColor(value, invert);
  if (color === "green") return "text-emerald-300";
  if (color === "yellow") return "text-amber-300";
  return "text-rose-300";
}

function taskStatusLabel(status: BehavioralTask["status"]) {
  const map = {
    done: "выполнено",
    in_progress: "в работе",
    planned: "запланировано",
  };
  return map[status];
}

function taskStatusColor(status: BehavioralTask["status"]) {
  const map = {
    done: "green",
    in_progress: "yellow",
    planned: "slate",
  } as const;
  return map[status];
}

function impactLabel(impact: BehavioralTask["impact"]) {
  const map = { high: "высокий", medium: "средний", low: "низкий" };
  return map[impact];
}

export function BehavioralFactorsPanel({
  snapshot,
  tasks,
  loading,
  onAnalyze,
}: {
  snapshot: BehavioralSnapshot | null;
  tasks: BehavioralTask[];
  loading: boolean;
  onAnalyze: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Работа с поведенческими факторами</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Легальная оптимизация UX и контента: удержание, глубина просмотра, скорость. Без накрутки
            кликов и ботов — только улучшение качества сайта для реальных пользователей.
          </p>
        </div>
        <Button onClick={onAnalyze} disabled={loading}>
          {loading ? "Анализ..." : snapshot ? "Обновить анализ ПФ" : "Запустить анализ ПФ"}
        </Button>
      </div>

      {!snapshot ? (
        <Card>
          <p className="text-slate-500 text-sm">
            Запустите анализ, чтобы получить метрики вовлечённости и план работ по поведенческим факторам.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <Card className="!p-4 text-center">
              <p className="text-xs text-slate-400">Индекс вовлечённости</p>
              <p className="text-2xl font-bold text-emerald-300 mt-1">{snapshot.engagementScore}%</p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="text-xs text-slate-400">Отказы</p>
              <p className={`text-2xl font-bold mt-1 ${metricTextClass(snapshot.bounceRate, true)}`}>
                {snapshot.bounceRate}%
              </p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="text-xs text-slate-400">Время на сайте</p>
              <p className="text-2xl font-bold text-cyan-300 mt-1">{snapshot.avgTimeSec} с</p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="text-xs text-slate-400">Глубина (стр.)</p>
              <p className="text-2xl font-bold text-violet-300 mt-1">{snapshot.pagesPerSession}</p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="text-xs text-slate-400">Скролл</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">{snapshot.scrollDepth}%</p>
            </Card>
            <Card className="!p-4 text-center">
              <p className="text-xs text-slate-400">Возвраты</p>
              <p className="text-2xl font-bold text-sky-300 mt-1">{snapshot.returnRate}%</p>
            </Card>
          </div>

          <Card>
            <h4 className="font-semibold mb-3">План улучшения ПФ (white-hat)</h4>
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 flex flex-wrap gap-3 justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-100">{task.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center shrink-0">
                    <Badge color="cyan">эффект: {impactLabel(task.impact)}</Badge>
                    <Badge color={taskStatusColor(task.status)}>{taskStatusLabel(task.status)}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
