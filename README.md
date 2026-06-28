# SiteNet Manager

Панель для сети сайтов: учёт, проверки, ссылки между доменами.

<!-- После Code Climate вставь сюда badge из их сайта -->

## Ссылки

| | URL |
|---|---|
| GitHub | https://github.com/pavelfrolovvvvv1234-debug/project |
| Деплой (фронт) | _добавь после Vercel_ |
| API | _добавь после Render_ `/api/health` |
| Swagger | _добавь после Render_ `/api/docs` |
| Демо GIF | _добавь ссылку на gif_ |

**Логин:** `demo@college.local` / `Demo123!`

## Стек

React, Vite, TypeScript, Tailwind · Express, Prisma · PostgreSQL

## Локальный запуск

```bash
docker compose up -d
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run setup
npm run dev
```

- Фронт: http://localhost:5173
- API: http://localhost:3001/api/health
- Swagger: http://localhost:3001/api/docs

## Деплой

### 1. Render (API + PostgreSQL)

1. [render.com](https://render.com) → New PostgreSQL (free)
2. New Web Service → репо `project`, **Root Directory:** `backend`
3. Build: `npm install && npx prisma migrate deploy && npx prisma db seed && npm run build`
4. Start: `npm start`
5. Env:
   - `DATABASE_URL` — Internal URL из PostgreSQL
   - `JWT_SECRET` — случайная строка
   - `FRONTEND_URL` — URL Vercel (после шага 2)

### 2. Vercel (фронт)

1. [vercel.com](https://vercel.com) → Import `project`, **Root:** `frontend`
2. Env: `VITE_API_URL=https://ВАШ-API.onrender.com/api`
3. После деплоя — обнови `FRONTEND_URL` на Render

### 3. SQL для ПМ11

Один раз на прод-БД:

```bash
psql "EXTERNAL_DATABASE_URL" -f docs/postgresql-extras.sql
```

ERD: `docs/erd.mmd` (открыть на https://mermaid.live → экспорт PNG)

## Структура

```
backend/   Express API, Prisma, SEO/uptime сервисы
frontend/  React SPA
docs/      schema.sql, postgresql-extras.sql, erd.mmd
```
