# API — таблица для отчёта

| Метод | URL | Описание | Тело запроса |
|-------|-----|----------|--------------|
| POST | `/api/auth/register` | Регистрация | email, password |
| POST | `/api/auth/login` | Вход | email, password |
| GET | `/api/auth/me` | Текущий пользователь | — |
| GET | `/api/dashboard` | Статистика + HTTP-статусы сайтов | — |
| POST | `/api/dashboard/check-all` | Проверить uptime всех сайтов | — |
| GET | `/api/networks` | Список сетей | — |
| POST | `/api/networks` | Создать сеть | name, description |
| GET | `/api/networks/:id` | Детали сети | — |
| PUT | `/api/networks/:id` | Обновить сеть | name, description |
| DELETE | `/api/networks/:id` | Удалить сеть | — |
| GET | `/api/networks/:id/sitemap.xml` | Sitemap | — |
| GET | `/api/networks/:id/export-links.csv` | CSV ссылок | — |
| GET | `/api/sites` | Список сайтов | ?search, ?networkId |
| POST | `/api/sites` | Добавить сайт | networkId, domain, title |
| GET | `/api/sites/:id` | Детали сайта | — |
| PUT | `/api/sites/:id` | Обновить сайт | title, domain, status |
| DELETE | `/api/sites/:id` | Удалить сайт | — |
| POST | `/api/sites/:id/seo-check` | SEO-анализ | — |
| GET | `/api/sites/:id/seo-history` | История SEO | — |
| POST | `/api/sites/:id/uptime-check` | Проверка uptime | — |
| GET | `/api/sites/:id/uptime-history` | История uptime | — |
| POST | `/api/sites/:id/behavioral-check` | Анализ поведенческих факторов | — |
| GET | `/api/sites/:id/behavioral-history` | История ПФ + план задач | — |
| POST | `/api/sites/:id/preview` | HTML превью | — |
| GET | `/api/keywords/site/:siteId` | Ключи сайта (облако) | — |
| GET | `/api/keywords/network/:networkId` | Ключи сети | — |
| POST | `/api/keywords/site/:siteId` | Добавить ключ | keyword, volumes, competition, difficulty |
| GET | `/api/links/network/:id/matrix` | Матрица ссылок | — |
| POST | `/api/links` | Создать связь | fromSiteId, toSiteId, anchorText |
| DELETE | `/api/links/:id` | Удалить связь | — |

Полная интерактивная документация: `/api/docs`
