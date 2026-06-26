# SiteNet Manager

[![Maintainability](https://api.codeclimate.com/v1/badges/REPLACE_AFTER_CODECLIMATE/maintainability)](https://codeclimate.com/github/pavelfrolovvvvv1234-debug/project)

Веб-система управления сетью сайтов с SEO-мониторингом и планированием перелинковки.

**Практика:** ПМ11 / ПМ02 — 09.02.07 «Информационные системы и программирование»

**GitHub:** https://github.com/pavelfrolovvvvv1234-debug/project

## Стек

| Слой | Технологии |
|------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript, Prisma |
| БД | PostgreSQL |
| API Docs | Swagger UI |

## Демо-доступ

После деплоя или локального `npm run setup`:

- **Email:** `demo@college.local`
- **Password:** `Demo123!`

## Быстрый старт (локально)

```bash
# 1. PostgreSQL (Docker)
docker compose up -d

# 2. Из корня проекта
cp backend/.env.example backend/.env
npm run setup
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001/api/health
- Swagger: http://localhost:3001/api/docs

## Функции

- Регистрация / авторизация (JWT)
- CRUD SEO-сетей и сайтов
- Дашборд: статистика + HTTP-статусы всех сайтов
- SEO-анализ URL (title, description, h1, robots.txt)
- Uptime-мониторинг
- Семантическое ядро: облако ключей, конкуренция %, сложность продвижения %
- Работа с поведенческими факторами (white-hat UX, без накрутки)
- Матрица перелинковки
- Экспорт sitemap.xml и CSV
- Генератор HTML-лендинга с anchor links

## Структура

```
backend/     — Express API + Prisma
frontend/    — React SPA
docs/        — отчёт, ERD, SQL, инструкция сдачи
```

## Деплой

Пошагово: **`docs/SUBMIT_NOW.md`**

### Backend (Render)

1. [Render Dashboard](https://dashboard.render.com) → New → Blueprint → подключить репо
2. Или вручную: Web Service, root `backend`
3. Build: `npm install && npx prisma migrate deploy && npx prisma db seed && npm run build`
4. Start: `npm start`
5. Env: `DATABASE_URL` (из Render PostgreSQL), `JWT_SECRET`, `FRONTEND_URL` (URL Vercel)

### Frontend (Vercel)

1. [Vercel](https://vercel.com) → Import repo → root `frontend`
2. Env: `VITE_API_URL=https://YOUR-API.onrender.com/api`

### PostgreSQL extras (ПМ11)

После миграции на проде:

```bash
psql $DATABASE_URL -f docs/postgresql-extras.sql
```

## Code Climate (оценка 4–5)

1. https://codeclimate.com → Add Repository → `pavelfrolovvvvv1234-debug/project`
2. Скопировать badge URL → заменить `REPLACE_AFTER_CODECLIMATE` в README

## Use Cases

1. Создание SEO-сети
2. Добавление сайта
3. SEO-анализ
4. Матрица перелинковки

## Лицензия

MIT — учебный проект
