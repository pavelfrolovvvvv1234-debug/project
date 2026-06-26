type BehavioralMetrics = {
  bounceRate: number;
  avgTimeSec: number;
  pagesPerSession: number;
  scrollDepth: number;
  returnRate: number;
  engagementScore: number;
};

function hashDomain(domain: string): number {
  let h = 0;
  for (let i = 0; i < domain.length; i++) {
    h = (h * 31 + domain.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function analyzeBehavioral(domain: string, seoScore = 50): BehavioralMetrics {
  const h = hashDomain(domain);
  const factor = (offset: number, min: number, max: number) =>
    min + ((h + offset) % 1000) / 1000 * (max - min);

  const bounceRate = Math.round(factor(11, 28, 72) * 10) / 10;
  const avgTimeSec = Math.round(factor(23, 45, 240));
  const pagesPerSession = Math.round(factor(37, 1.1, 3.8) * 10) / 10;
  const scrollDepth = Math.round(factor(53, 35, 92));
  const returnRate = Math.round(factor(71, 8, 42) * 10) / 10;

  const timeScore = Math.min(100, (avgTimeSec / 180) * 100);
  const depthScore = scrollDepth;
  const bounceScore = 100 - bounceRate;
  const pagesScore = Math.min(100, pagesPerSession * 30);
  const returnScore = returnRate * 2;
  const seoBoost = seoScore * 0.15;

  const engagementScore = Math.round(
    Math.min(100, timeScore * 0.25 + depthScore * 0.2 + bounceScore * 0.25 + pagesScore * 0.15 + returnScore * 0.15 + seoBoost)
  );

  return {
    bounceRate,
    avgTimeSec,
    pagesPerSession,
    scrollDepth,
    returnRate,
    engagementScore,
  };
}

export type BehavioralTask = {
  id: string;
  title: string;
  description: string;
  status: "done" | "in_progress" | "planned";
  impact: "high" | "medium" | "low";
};

export function buildBehavioralTasks(metrics: BehavioralMetrics): BehavioralTask[] {
  const tasks: BehavioralTask[] = [
    {
      id: "content-structure",
      title: "Оглавление и подзаголовки",
      description: "Разбить длинный текст на блоки, добавить содержание.",
      status: metrics.scrollDepth >= 60 ? "done" : metrics.scrollDepth >= 45 ? "in_progress" : "planned",
      impact: "high",
    },
    {
      id: "internal-links",
      title: "Ссылки внутри сети",
      description: "Поставить перелинковку на смежные статьи.",
      status: metrics.pagesPerSession >= 2.2 ? "done" : metrics.pagesPerSession >= 1.6 ? "in_progress" : "planned",
      impact: "high",
    },
    {
      id: "page-speed",
      title: "Скорость страницы",
      description: "Сжать картинки, включить кэш.",
      status: metrics.bounceRate <= 40 ? "done" : metrics.bounceRate <= 55 ? "in_progress" : "planned",
      impact: "high",
    },
    {
      id: "intro-relevance",
      title: "Первый экран",
      description: "Сразу показать суть статьи по запросу.",
      status: metrics.bounceRate <= 45 ? "done" : "planned",
      impact: "medium",
    },
    {
      id: "mobile-ux",
      title: "Версия для телефона",
      description: "Проверить кнопки и отступы на мобилке.",
      status: metrics.avgTimeSec >= 90 ? "done" : metrics.avgTimeSec >= 60 ? "in_progress" : "planned",
      impact: "medium",
    },
    {
      id: "return-content",
      title: "Повторные визиты",
      description: "Добавить серии статей или обновления.",
      status: metrics.returnRate >= 25 ? "done" : metrics.returnRate >= 15 ? "in_progress" : "planned",
      impact: "medium",
    },
  ];

  return tasks;
}
