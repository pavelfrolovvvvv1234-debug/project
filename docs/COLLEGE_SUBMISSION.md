# Сдача практики — статус чеклиста

## ✅ Готово в проекте (тебе ничего не кодить)

| Пункт | Статус | Где |
|-------|--------|-----|
| GitHub-ready структура | ✅ | monorepo backend + frontend |
| README полный | ✅ | `README.md` |
| `.env` в gitignore | ✅ | `.gitignore` |
| Frontend + Backend + БД | ✅ | React + Express + Prisma |
| Auth + demo login | ✅ | `demo@college.local` / `Demo123!` |
| 4 Use Case реализованы | ✅ | см. `docs/REPORT_TEXT.md` |
| ERD диаграмма | ✅ | `docs/ERD.md` (Mermaid) |
| SQL CREATE TABLE | ✅ | `docs/schema.sql` |
| View + Function + Trigger | ✅ | `docs/postgresql-extras.sql` |
| API документация | ✅ | `/api/docs` Swagger |
| Таблица API для отчёта | ✅ | `docs/API_TABLE.md` |
| Текст для docx | ✅ | `docs/REPORT_TEXT.md` |
| Маппинг Use Case → фичи | ✅ | `docs/COMMITS_GUIDE.md` |
| Деплой-конфиги | ✅ | `render.yaml`, `frontend/vercel.json` |
| CRUD + удаление + редактирование | ✅ | UI обновлён |
| Мобильная вёрстка | ✅ | sidebar + меню |
| Toast уведомления | ✅ | |
| Favicon | ✅ | `frontend/public/favicon.svg` |

## ⚠️ Нужно сделать ТЕБЕ (без этого не примут)

| Пункт | Действие | Время |
|-------|----------|-------|
| **Деплой frontend** | Vercel → root `frontend`, env `VITE_API_URL` | 15 мин |
| **Деплой backend** | Render → root `backend`, PostgreSQL | 20 мин |
| **PostgreSQL на проде** | В `schema.prisma` сменить provider на `postgresql`, migrate | 10 мин |
| **Запустить postgresql-extras.sql** | На прод БД | 5 мин |
| **GitHub публичный репо** | 15+ коммитов | 10 мин |
| **Code Climate** | codeclimate.com → подключить репо → badge в README | 10 мин |
| **GIF/видео демо** | ScreenToGif: логин → сеть → SEO → матрица | 15 мин |
| **Заполнить docx отчёт** | Шаблон + скрины деплоя + ссылки | 1–2 ч |
| **Дневник + бумаги** | Даты практики из колледжа | 30 мин |

## Демо для защиты (скрипт GIF)

1. Открыть деплой → войти `demo@college.local` / `Demo123!`
2. Главная — показать статистику
3. Сети → Travel Network → Матрица ссылок
4. Сайты → example.com → SEO-анализ
5. Экспорт CSV

## Оценки

- **Оценка 3:** деплой + README + GitHub + demo login
- **Оценка 4:** + Code Climate badge + GIF
- **Оценка 5:** + auth в отчёте + сложные фичи (SEO + матрица) — уже есть

## Ссылки для отчёта

```
Демо: https://____________.vercel.app
API:  https://____________.onrender.com/api/health
Swagger: https://____________.onrender.com/api/docs
GitHub: https://github.com/pavelfrolovvvvv1234-debug/project
GIF:  (ссылка на Google Drive / GitHub)
```
