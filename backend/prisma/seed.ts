import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { analyzeBehavioral } from "../src/services/behavioral.js";

const prisma = new PrismaClient();

const landingTemplate = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <meta name="description" content="{description}" />
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.6; }
    h1 { color: #1e3a5f; }
    .meta { color: #64748b; font-size: 14px; }
    .links { margin-top: 24px; padding: 16px; background: #f1f5f9; border-radius: 8px; }
  </style>
</head>
<body>
  <p class="meta">{domain} · {niche}</p>
  <h1>{title}</h1>
  <p>{description}</p>
  <div class="links"><strong>Перелинковка:</strong> {anchor_links}</div>
</body>
</html>`;

async function main() {
  await prisma.siteLink.deleteMany();
  await prisma.seoSnapshot.deleteMany();
  await prisma.uptimeCheck.deleteMany();
  await prisma.siteKeyword.deleteMany();
  await prisma.siteTag.deleteMany();
  await prisma.site.deleteMany();
  await prisma.network.deleteMany();
  await prisma.siteTemplate.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo123!", 10);

  const demo = await prisma.user.create({
    data: {
      email: "demo@college.local",
      passwordHash,
      role: "admin",
    },
  });

  const template = await prisma.siteTemplate.create({
    data: {
      name: "SEO Landing Basic",
      htmlBody: landingTemplate,
      defaultMetaTitle: "SiteNet Landing",
      defaultMetaDescription: "Оптимизированный лендинг для сети сайтов",
    },
  });

  const travel = await prisma.network.create({
    data: {
      name: "Travel Network",
      description: "Сеть travel-проектов для SEO-кампании Q2",
      ownerId: demo.id,
    },
  });

  const tech = await prisma.network.create({
    data: {
      name: "Tech Blog Network",
      description: "Технологические блоги с перекрёстными ссылками",
      ownerId: demo.id,
    },
  });

  const travelSites = await Promise.all(
    [
      { domain: "budget-hotels-guide.com", title: "Гид по бюджетным отелям", niche: "travel" },
      { domain: "europe-travel-tips.net", title: "Советы путешественникам", niche: "travel" },
      { domain: "cheap-flights-blog.org", title: "Дешёвые авиабилеты", niche: "travel" },
      { domain: "weekend-getaways.ru", title: "Выходные за городом", niche: "travel" },
    ].map((s) =>
      prisma.site.create({
        data: {
          ...s,
          networkId: travel.id,
          ownerId: demo.id,
          status: "active",
          templateId: template.id,
          tags: {
            create: {
              tag: {
                connectOrCreate: {
                  where: { name: s.niche },
                  create: { name: s.niche },
                },
              },
            },
          },
        },
      })
    )
  );

  const techSites = await Promise.all(
    [
      { domain: "gadget-review-hub.com", title: "Обзоры гаджетов", niche: "tech" },
      { domain: "best-laptops-2026.net", title: "Лучшие ноутбуки", niche: "tech" },
      { domain: "smart-home-setup.blog", title: "Умный дом", niche: "tech" },
    ].map((s) =>
      prisma.site.create({
        data: {
          ...s,
          networkId: tech.id,
          ownerId: demo.id,
          status: "active",
          templateId: template.id,
        },
      })
    )
  );

  await prisma.siteLink.createMany({
    data: [
      {
        networkId: travel.id,
        fromSiteId: travelSites[0].id,
        toSiteId: travelSites[1].id,
        anchorText: "бюджетные отели Европы",
        linkType: "dofollow",
      },
      {
        networkId: travel.id,
        fromSiteId: travelSites[1].id,
        toSiteId: travelSites[2].id,
        anchorText: "дешёвые перелёты",
        linkType: "dofollow",
      },
      {
        networkId: tech.id,
        fromSiteId: techSites[0].id,
        toSiteId: techSites[1].id,
        anchorText: "рейтинг ноутбуков",
        linkType: "dofollow",
      },
      {
        networkId: tech.id,
        fromSiteId: techSites[1].id,
        toSiteId: techSites[2].id,
        anchorText: "настройка умного дома",
        linkType: "nofollow",
      },
    ],
  });

  for (const site of [travelSites[0], techSites[0]]) {
    await prisma.seoSnapshot.create({
      data: {
        siteId: site.id,
        pageTitle: site.title,
        metaDescription: `SEO описание для ${site.domain}`,
        h1: site.title,
        canonical: `https://${site.domain}`,
        robotsTxtOk: true,
        seoScore: 85,
      },
    });
  }

  const keywordData: Record<string, { keyword: string; google: number; yandex: number; difficulty: number; intent: string }[]> = {
    "budget-hotels-guide.com": [
      { keyword: "бюджетные отели", google: 14800, yandex: 9200, difficulty: 42, intent: "commercial" },
      { keyword: "дешёвые отели европа", google: 6600, yandex: 4100, difficulty: 38, intent: "commercial" },
      { keyword: "где остановиться недорого", google: 3200, yandex: 2800, difficulty: 35, intent: "informational" },
      { keyword: "отели без звёзд", google: 1900, yandex: 1500, difficulty: 28, intent: "informational" },
      { keyword: "booking альтернатива", google: 2400, yandex: 3600, difficulty: 55, intent: "navigational" },
    ],
    "europe-travel-tips.net": [
      { keyword: "советы путешественникам", google: 8100, yandex: 5400, difficulty: 40, intent: "informational" },
      { keyword: "путешествие по европе", google: 22200, yandex: 12800, difficulty: 58, intent: "informational" },
      { keyword: "маршрут европа 2 недели", google: 4400, yandex: 3100, difficulty: 45, intent: "informational" },
      { keyword: "шенген виза 2026", google: 12100, yandex: 18600, difficulty: 62, intent: "informational" },
    ],
    "cheap-flights-blog.org": [
      { keyword: "дешёвые авиабилеты", google: 33100, yandex: 24500, difficulty: 72, intent: "transactional" },
      { keyword: "авиабилеты со скидкой", google: 12400, yandex: 9800, difficulty: 65, intent: "transactional" },
      { keyword: "когда покупать билеты", google: 5600, yandex: 4200, difficulty: 38, intent: "informational" },
      { keyword: "лоукостеры европа", google: 3900, yandex: 5100, difficulty: 48, intent: "commercial" },
    ],
    "weekend-getaways.ru": [
      { keyword: "куда поехать на выходные", google: 18500, yandex: 14200, difficulty: 44, intent: "informational" },
      { keyword: "отдых рядом с москвой", google: 9800, yandex: 11200, difficulty: 50, intent: "commercial" },
      { keyword: "загородный отдых", google: 7200, yandex: 8900, difficulty: 41, intent: "commercial" },
    ],
    "gadget-review-hub.com": [
      { keyword: "обзор смартфонов", google: 27600, yandex: 19400, difficulty: 68, intent: "informational" },
      { keyword: "лучшие гаджеты 2026", google: 8900, yandex: 6200, difficulty: 52, intent: "commercial" },
      { keyword: "сравнение телефонов", google: 11200, yandex: 7800, difficulty: 55, intent: "commercial" },
      { keyword: "наушники рейтинг", google: 15400, yandex: 10300, difficulty: 60, intent: "transactional" },
      { keyword: "умные часы обзор", google: 6800, yandex: 4500, difficulty: 47, intent: "informational" },
    ],
    "best-laptops-2026.net": [
      { keyword: "лучшие ноутбуки 2026", google: 41200, yandex: 28700, difficulty: 75, intent: "transactional" },
      { keyword: "ноутбук для работы", google: 19800, yandex: 15600, difficulty: 63, intent: "commercial" },
      { keyword: "игровой ноутбук недорого", google: 14300, yandex: 11200, difficulty: 70, intent: "transactional" },
      { keyword: "macbook vs windows", google: 5200, yandex: 3800, difficulty: 45, intent: "informational" },
    ],
    "smart-home-setup.blog": [
      { keyword: "умный дом своими руками", google: 9600, yandex: 12400, difficulty: 48, intent: "informational" },
      { keyword: "настройка alexa", google: 3400, yandex: 2100, difficulty: 35, intent: "informational" },
      { keyword: "датчики движения wifi", google: 2800, yandex: 3200, difficulty: 42, intent: "commercial" },
      { keyword: "умная колонка купить", google: 16700, yandex: 13800, difficulty: 66, intent: "transactional" },
    ],
  };

  const allSites = [...travelSites, ...techSites];
  for (const site of allSites) {
    const kws = keywordData[site.domain] ?? [];
    for (const kw of kws) {
      const competition = Math.min(
        100,
        kw.difficulty + (kw.intent === "transactional" ? 10 : kw.intent === "commercial" ? 6 : kw.intent === "navigational" ? 8 : 4)
      );
      await prisma.siteKeyword.create({
        data: {
          siteId: site.id,
          keyword: kw.keyword,
          googleVolume: kw.google,
          yandexVolume: kw.yandex,
          competition,
          difficulty: kw.difficulty,
          intent: kw.intent,
        },
      });
    }
  }

  const uptimeSeed: Record<string, { code: number; ms: number }> = {
    "budget-hotels-guide.com": { code: 200, ms: 312 },
    "europe-travel-tips.net": { code: 200, ms: 278 },
    "cheap-flights-blog.org": { code: 301, ms: 190 },
    "weekend-getaways.ru": { code: 200, ms: 445 },
    "gadget-review-hub.com": { code: 200, ms: 256 },
    "best-laptops-2026.net": { code: 200, ms: 301 },
    "smart-home-setup.blog": { code: 404, ms: 120 },
  };

  for (const site of allSites) {
    const u = uptimeSeed[site.domain] ?? { code: 200, ms: 240 };
    const isUp = u.code >= 200 && u.code < 400;
    await prisma.uptimeCheck.create({
      data: {
        siteId: site.id,
        statusCode: u.code,
        responseMs: u.ms,
        isUp,
      },
    });
    if (!isUp) {
      await prisma.site.update({ where: { id: site.id }, data: { status: "down" } });
    }
  }

  for (const site of allSites) {
    const seo = await prisma.seoSnapshot.findFirst({
      where: { siteId: site.id },
      orderBy: { checkedAt: "desc" },
    });
    const metrics = analyzeBehavioral(site.domain, seo?.seoScore ?? 50);
    await prisma.behavioralSnapshot.create({
      data: { siteId: site.id, ...metrics },
    });
  }

  console.log("seed ok — demo@college.local / Demo123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
