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
      name: "Landing Basic",
      htmlBody: landingTemplate,
      defaultMetaTitle: "SiteNet Landing",
      defaultMetaDescription: "Лендинг для сети сайтов",
    },
  });

  const travel = await prisma.network.create({
    data: {
      name: "Travel Network",
      description: "Travel-сайты",
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
      { domain: "wikipedia.org", title: "Wikipedia", niche: "travel" },
      { domain: "lonelyplanet.com", title: "Lonely Planet", niche: "travel" },
      { domain: "booking.com", title: "Booking.com", niche: "travel" },
      { domain: "skyscanner.net", title: "Skyscanner", niche: "travel" },
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
      { domain: "github.com", title: "GitHub", niche: "tech" },
      { domain: "stackoverflow.com", title: "Stack Overflow", niche: "tech" },
      { domain: "developer.mozilla.org", title: "MDN Web Docs", niche: "tech" },
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
        metaDescription: `Описание для ${site.domain}`,
        h1: site.title,
        canonical: `https://${site.domain}`,
        robotsTxtOk: true,
        seoScore: 85,
      },
    });
  }

  const keywordData: Record<string, { keyword: string; google: number; yandex: number; difficulty: number; intent: string }[]> = {
    "wikipedia.org": [
      { keyword: "википедия", google: 450000, yandex: 320000, difficulty: 85, intent: "navigational" },
      { keyword: "энциклопедия онлайн", google: 12000, yandex: 9800, difficulty: 55, intent: "informational" },
      { keyword: "история страны", google: 8900, yandex: 7200, difficulty: 42, intent: "informational" },
    ],
    "lonelyplanet.com": [
      { keyword: "путеводитель по странам", google: 6600, yandex: 4100, difficulty: 48, intent: "informational" },
      { keyword: "куда поехать в отпуск", google: 18500, yandex: 14200, difficulty: 52, intent: "informational" },
      { keyword: "достопримечательности европы", google: 9800, yandex: 11200, difficulty: 45, intent: "commercial" },
    ],
    "booking.com": [
      { keyword: "бронирование отелей", google: 33100, yandex: 24500, difficulty: 78, intent: "transactional" },
      { keyword: "отели онлайн", google: 19800, yandex: 15600, difficulty: 70, intent: "transactional" },
      { keyword: "дешёвые отели", google: 14800, yandex: 9200, difficulty: 62, intent: "commercial" },
    ],
    "skyscanner.net": [
      { keyword: "дешёвые авиабилеты", google: 33100, yandex: 24500, difficulty: 72, intent: "transactional" },
      { keyword: "сравнение цен на билеты", google: 12400, yandex: 9800, difficulty: 58, intent: "commercial" },
      { keyword: "авиабилеты со скидкой", google: 5600, yandex: 4200, difficulty: 48, intent: "transactional" },
    ],
    "github.com": [
      { keyword: "github репозиторий", google: 27600, yandex: 19400, difficulty: 68, intent: "navigational" },
      { keyword: "open source проекты", google: 11200, yandex: 7800, difficulty: 55, intent: "informational" },
      { keyword: "git hosting", google: 8900, yandex: 6200, difficulty: 52, intent: "commercial" },
    ],
    "stackoverflow.com": [
      { keyword: "stackoverflow вопросы", google: 41200, yandex: 28700, difficulty: 75, intent: "navigational" },
      { keyword: "ошибка javascript", google: 19800, yandex: 15600, difficulty: 48, intent: "informational" },
      { keyword: "как исправить баг", google: 5200, yandex: 3800, difficulty: 40, intent: "informational" },
    ],
    "developer.mozilla.org": [
      { keyword: "mdn документация", google: 9600, yandex: 12400, difficulty: 45, intent: "navigational" },
      { keyword: "справочник html", google: 3400, yandex: 2100, difficulty: 35, intent: "informational" },
      { keyword: "javascript api", google: 16700, yandex: 13800, difficulty: 55, intent: "informational" },
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
    "wikipedia.org": { code: 200, ms: 280 },
    "lonelyplanet.com": { code: 200, ms: 320 },
    "booking.com": { code: 200, ms: 350 },
    "skyscanner.net": { code: 200, ms: 290 },
    "github.com": { code: 200, ms: 210 },
    "stackoverflow.com": { code: 200, ms: 245 },
    "developer.mozilla.org": { code: 200, ms: 265 },
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
