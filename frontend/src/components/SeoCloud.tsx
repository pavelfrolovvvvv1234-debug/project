import type { SiteKeyword } from "../lib/api";
import { Badge, Card } from "./Layout";

type KeywordWithSite = SiteKeyword & {
  site?: { id: string; domain: string; title: string };
};

function cloudSize(volume: number, max: number): string {
  if (max <= 0) return "text-sm";
  const ratio = volume / max;
  if (ratio > 0.8) return "text-xl font-bold";
  if (ratio > 0.55) return "text-lg font-semibold";
  if (ratio > 0.35) return "text-base font-medium";
  if (ratio > 0.2) return "text-sm";
  return "text-xs";
}

function intentLabel(intent: string) {
  const map: Record<string, string> = {
    informational: "инфо",
    commercial: "коммерч",
    navigational: "навигац",
    transactional: "транзакц",
  };
  return map[intent] ?? intent;
}

function intentColor(intent: string) {
  const map: Record<string, string> = {
    informational: "cyan",
    commercial: "yellow",
    navigational: "slate",
    transactional: "green",
  };
  return map[intent] ?? "slate";
}

function pctClass(value: number): string {
  if (value >= 70) return "text-rose-300";
  if (value >= 45) return "text-amber-300";
  return "text-emerald-300";
}

export function SeoCloud({
  keywords,
  totals,
  selected,
  onSelect,
  showSite = false,
}: {
  keywords: KeywordWithSite[];
  totals: { google: number; yandex: number };
  selected: SiteKeyword | null;
  onSelect: (k: SiteKeyword | null) => void;
  showSite?: boolean;
}) {
  const maxVol = Math.max(...keywords.map((k) => Math.max(k.googleVolume, k.yandexVolume)), 1);
  const avgCompetition = keywords.length
    ? Math.round(keywords.reduce((s, k) => s + k.competition, 0) / keywords.length)
    : 0;
  const avgPromotion = keywords.length
    ? Math.round(keywords.reduce((s, k) => s + k.difficulty, 0) / keywords.length)
    : 0;

  if (keywords.length === 0) {
    return <p className="text-slate-500 text-sm">Ключевые слова не найдены</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="!p-4 text-center">
          <p className="text-xs text-slate-400">Ключей</p>
          <p className="text-2xl font-bold text-white mt-1">{keywords.length}</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs text-slate-400">Google (сумма)</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">{totals.google.toLocaleString("ru")}</p>
          <p className="text-[10px] text-slate-500">запросов/мес</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs text-slate-400">Яндекс (сумма)</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{totals.yandex.toLocaleString("ru")}</p>
          <p className="text-[10px] text-slate-500">запросов/мес</p>
        </Card>
        <Card className="!p-4 text-center">
          <p className="text-xs text-slate-400">Ср. конкуренция</p>
          <p className={`text-2xl font-bold mt-1 ${pctClass(avgCompetition)}`}>{avgCompetition}%</p>
        </Card>
        <Card className="!p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400">Ср. сложность продвижения</p>
          <p className={`text-2xl font-bold mt-1 ${pctClass(avgPromotion)}`}>{avgPromotion}%</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-4">Облако ключей</h3>
        <p className="text-xs text-slate-500 mb-4">Крупнее — чаще ищут</p>
        <div className="flex flex-wrap gap-2 justify-center items-center min-h-[120px] p-4 rounded-lg bg-slate-950/50 border border-slate-800">
          {keywords.map((k) => (
            <button
              key={k.id}
              type="button"
              onClick={() => onSelect(selected?.id === k.id ? null : k)}
              className={`inline-flex items-center justify-center text-center px-3 py-1.5 rounded-full border transition hover:scale-105 ${cloudSize(Math.max(k.googleVolume, k.yandexVolume), maxVol)} ${
                selected?.id === k.id
                  ? "border-cyan-400 bg-cyan-600/30 text-cyan-200"
                  : "border-slate-700 bg-slate-800/80 text-slate-200 hover:border-cyan-600"
              }`}
            >
              {k.keyword}
            </button>
          ))}
        </div>
      </Card>

      {selected && (
        <Card className="border-cyan-800/50">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-cyan-300">{selected.keyword}</h3>
              {showSite && "site" in selected && selected.site && (
                <p className="text-sm text-slate-400 mt-1">{selected.site.domain}</p>
              )}
            </div>
            <Badge color={intentColor(selected.intent)}>{intentLabel(selected.intent)}</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="rounded-lg bg-slate-950/60 p-4 text-center border border-slate-800">
              <p className="text-xs text-slate-400">Google</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">
                {selected.googleVolume.toLocaleString("ru")}
              </p>
              <p className="text-[10px] text-slate-500">запросов/мес</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-4 text-center border border-slate-800">
              <p className="text-xs text-slate-400">Яндекс</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {selected.yandexVolume.toLocaleString("ru")}
              </p>
              <p className="text-[10px] text-slate-500">запросов/мес</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-4 text-center border border-slate-800">
              <p className="text-xs text-slate-400">Конкуренция</p>
              <p className={`text-2xl font-bold mt-1 ${pctClass(selected.competition)}`}>
                {selected.competition}%
              </p>
              <p className="text-[10px] text-slate-500">в выдаче</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-4 text-center border border-slate-800">
              <p className="text-xs text-slate-400">Сложность продвижения</p>
              <p className={`text-2xl font-bold mt-1 ${pctClass(selected.difficulty)}`}>
                {selected.difficulty}%
              </p>
              <p className="text-[10px] text-slate-500">в топ</p>
            </div>
            <div className="rounded-lg bg-slate-950/60 p-4 text-center border border-slate-800 sm:col-span-2 lg:col-span-1">
              <p className="text-xs text-slate-400">Потенциал</p>
              <p className="text-2xl font-bold text-emerald-300 mt-1">
                {Math.max(0, 100 - Math.round((selected.competition + selected.difficulty) / 2))}%
              </p>
              <p className="text-[10px] text-slate-500">сводная оценка</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <h3 className="font-semibold mb-4">Таблица ключевых слов</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="text-left py-2 pr-4">Ключ</th>
              {showSite && <th className="text-left py-2 pr-4">Сайт</th>}
              <th className="text-right py-2 pr-4">Google</th>
              <th className="text-right py-2 pr-4">Яндекс</th>
              <th className="text-right py-2 pr-4">Конкуренция</th>
              <th className="text-right py-2 pr-4">Сложность</th>
              <th className="text-right py-2">Интент</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((k) => (
              <tr
                key={k.id}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 cursor-pointer"
                onClick={() => onSelect(k)}
              >
                <td className="py-2.5 pr-4 text-cyan-300">{k.keyword}</td>
                {showSite && (
                  <td className="py-2.5 pr-4 text-slate-400 text-xs">{k.site?.domain}</td>
                )}
                <td className="py-2.5 pr-4 text-right">{k.googleVolume.toLocaleString("ru")}</td>
                <td className="py-2.5 pr-4 text-right">{k.yandexVolume.toLocaleString("ru")}</td>
                <td className={`py-2.5 pr-4 text-right ${pctClass(k.competition)}`}>{k.competition}%</td>
                <td className={`py-2.5 pr-4 text-right ${pctClass(k.difficulty)}`}>{k.difficulty}%</td>
                <td className="py-2.5 text-right">
                  <Badge color={intentColor(k.intent)}>{intentLabel(k.intent)}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
