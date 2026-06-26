# SiteNet Manager

Панель для учёта сайтов в SEO-сети: сети, сайты, проверки, перелинковка.

React + Express + PostgreSQL + Prisma.

## Запуск

```bash
docker compose up -d
cp backend/.env.example backend/.env
npm run setup
npm run dev
```

- http://localhost:5173 — интерфейс
- http://localhost:3001/api/health — API
- http://localhost:3001/api/docs — Swagger

Тестовый аккаунт: `demo@college.local` / `Demo123!`

## Что умеет

- авторизация (JWT)
- сети и сайты (добавить, править, удалить)
- SEO-проверка страницы
- uptime и HTTP-коды на главной
- ключевые слова: частотность, конкуренция, сложность
- поведенческие метрики и список задач по UX
- матрица ссылок, экспорт CSV и sitemap

## Деплой

Backend на Render (папка `backend`), frontend на Vercel (папка `frontend`).

Переменные:

- Render: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`
- Vercel: `VITE_API_URL=https://ваш-api.onrender.com/api`

После миграции на PostgreSQL выполнить `docs/postgresql-extras.sql`.

Подробнее — `docs/DEPLOY.md`.

## Структура

```
backend/   API, Prisma
frontend/  React
docs/      SQL, ERD, текст для отчёта
```
