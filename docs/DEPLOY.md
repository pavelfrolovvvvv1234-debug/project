# Деплой

## Render (API)

1. Создать PostgreSQL на Render, скопировать Internal Database URL.
2. Web Service из репозитория, root: `backend`.
3. Build: `npm install && npx prisma migrate deploy && npx prisma db seed && npm run build`
4. Start: `npm start`
5. Переменные: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` (пока можно localhost, потом URL Vercel).

Проверка: `https://ваш-сервис.onrender.com/api/health`

## Vercel (сайт)

1. Импорт репо, root: `frontend`.
2. `VITE_API_URL=https://ваш-сервис.onrender.com/api`
3. После деплоя обновить `FRONTEND_URL` на Render.

## SQL для PostgreSQL

В консоли БД на Render выполнить скрипт `postgresql-extras.sql` (view, функция, триггер).

## Code Climate

Подключить репозиторий на codeclimate.com, вставить badge в README если нужен по заданию.

## GIF для отчёта

Записать 1–2 мин: вход → главная → сеть → матрица → карточка сайта (SEO, ключи).
