# API

| Метод | URL | Описание |
|-------|-----|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход |
| GET | `/api/auth/me` | Текущий пользователь |
| GET | `/api/dashboard` | Статистика и HTTP-статусы |
| POST | `/api/dashboard/check-all` | Проверить все сайты |
| GET | `/api/networks` | Список сетей |
| POST | `/api/networks` | Создать сеть |
| GET | `/api/networks/:id` | Сеть |
| PUT | `/api/networks/:id` | Изменить сеть |
| DELETE | `/api/networks/:id` | Удалить сеть |
| GET | `/api/networks/:id/sitemap.xml` | Sitemap |
| GET | `/api/networks/:id/export-links.csv` | CSV |
| GET | `/api/sites` | Сайты |
| POST | `/api/sites` | Добавить сайт |
| GET | `/api/sites/:id` | Сайт |
| PUT | `/api/sites/:id` | Изменить |
| DELETE | `/api/sites/:id` | Удалить |
| POST | `/api/sites/:id/seo-check` | SEO |
| POST | `/api/sites/:id/uptime-check` | Uptime |
| POST | `/api/sites/:id/behavioral-check` | Поведенческие метрики |
| GET | `/api/sites/:id/behavioral-history` | История ПФ |
| POST | `/api/sites/:id/preview` | Превью HTML |
| GET | `/api/keywords/site/:siteId` | Ключи сайта |
| GET | `/api/keywords/network/:networkId` | Ключи сети |
| POST | `/api/keywords/site/:siteId` | Добавить ключ |
| GET | `/api/links/network/:id/matrix` | Матрица |
| POST | `/api/links` | Создать ссылку |
| DELETE | `/api/links/:id` | Удалить ссылку |

Swagger: `/api/docs`
