# Use Case → реализация (для отчёта)

| Use Case | Что показать на деплое | Файлы / модули |
|----------|------------------------|----------------|
| UC-1 Создание SEO-сети | Сети → форма → сеть в списке | `NetworksPage.tsx`, `routes/networks.ts` |
| UC-2 Добавление сайта | Сайты → форма → сайт в сети | `SitesPage.tsx`, `routes/sites.ts` |
| UC-3 SEO-анализ | Карточка сайта → SEO-анализ → score | `services/seo.ts`, `SiteDetailPage.tsx` |
| UC-4 Матрица перелинковки | Сеть → Матрица → добавить связь | `LinkMatrix.tsx`, `routes/links.ts` |

## Рекомендуемые коммиты для GitHub

```
feat(auth): регистрация и JWT авторизация
feat(db): схема Prisma — users, networks, sites
feat(api): CRUD сетей и сайтов
feat(seo): парсер title, description, h1
feat(links): матрица перелинковки и CSV экспорт
feat(ui): dashboard, сети, сайты, матрица
feat(deploy): конфиги Render и Vercel
docs: README, ERD, API таблица, текст отчёта
```

В отчёте напротив каждого Use Case вставь:
1. Скрин с деплоя
2. Ссылку на коммит GitHub
