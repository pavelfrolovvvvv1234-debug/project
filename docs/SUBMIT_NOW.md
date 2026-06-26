# Сдача за 1–2 часа — только твои действия

Код, документация и GitHub-история подготовлены. Ниже — что **нельзя сделать за тебя** (нужен твой аккаунт).

---

## Шаг 1. GitHub (5 мин)

Репозиторий: https://github.com/pavelfrolovvvvv1234-debug/project

Если код ещё не на GitHub — в корне проекта:

```powershell
git remote add origin https://github.com/pavelfrolovvvvv1234-debug/project.git
git push -u origin main
```

При запросе логина — войди в GitHub (или Personal Access Token вместо пароля).

Проверь: на GitHub **15+ коммитов**, репо **Public**.

---

## Шаг 2. Render — backend + PostgreSQL (25 мин)

1. Зайди на https://dashboard.render.com
2. **New +** → **PostgreSQL** → имя `sitenet-db`, Free → Create
3. Скопируй **Internal Database URL**
4. **New +** → **Web Service** → подключи репо `pavelfrolovvvvv1234-debug/project`
   - Root Directory: `backend`
   - Build: `npm install && npx prisma migrate deploy && npx prisma db seed && npm run build`
   - Start: `npm start`
   - Environment:
     - `DATABASE_URL` = Internal URL из шага 3
     - `JWT_SECRET` = любая длинная строка (32+ символа)
     - `FRONTEND_URL` = пока `http://localhost:5173` (потом заменишь на Vercel)
5. Дождись **Live** → открой `https://ТВОЙ-API.onrender.com/api/health` → должен быть `{"status":"ok"}`

### PostgreSQL extras (ПМ11)

В Render → PostgreSQL → **Connect** → **PSQL Command** или Shell:

```sql
\i docs/postgresql-extras.sql
```

Или скопируй содержимое `docs/postgresql-extras.sql` в SQL-консоль Render.

Скрин успешного деплоя и pg_dump — в отчёт:

```bash
pg_dump $DATABASE_URL > backup_sitenet.sql
```

---

## Шаг 3. Vercel — frontend (15 мин)

1. https://vercel.com → **Add New Project** → импорт репо
2. Root Directory: `frontend`
3. Environment Variable:
   - `VITE_API_URL` = `https://ТВОЙ-API.onrender.com/api`
4. Deploy → скопируй URL (`https://xxx.vercel.app`)

### Вернуться в Render

Обнови `FRONTEND_URL` = URL Vercel → **Manual Deploy** backend.

Проверь: открой Vercel URL → логин `demo@college.local` / `Demo123!`

---

## Шаг 4. Code Climate (10 мин) — для оценки 4–5

1. https://codeclimate.com → Sign in with GitHub
2. **Add Repository** → `pavelfrolovvvvv1234-debug/project`
3. Скопируй badge → в `README.md` замени `REPLACE_AFTER_CODECLIMATE` на свой ID
4. Закоммить и push

---

## Шаг 5. GIF демо (~15 мин) — для оценки 4–5

**ScreenToGif** или **OBS** → запись ~2 минут:

1. Вход на Vercel URL
2. Дашборд — HTTP-статусы → «Проверить все»
3. Сети → Travel Network → Матрица ссылок
4. Сайт → SEO-анализ → семантическое ядро → ПФ
5. Сохрани GIF → Google Drive / GitHub Releases → ссылка в отчёт

---

## Шаг 6. Отчёт docx (1–2 ч)

1. Открой шаблон от колледжа
2. Скопируй текст из `docs/REPORT_TEXT.md`
3. Вставь ссылки:
   - Демо: `https://xxx.vercel.app`
   - API: `https://xxx.onrender.com/api/health`
   - GitHub: https://github.com/pavelfrolovvvvv1234-debug/project
4. Вставь скрины (9 пунктов из `REPORT_TEXT.md`)
5. Укажи login/password
6. Вставь ERD из `docs/ERD.md` (скрин с mermaid.live)
7. Таблицу API из `docs/API_TABLE.md`

---

## Шаг 7. Бумаги колледжа (сам)

- [ ] Дневник практики (даты из задания)
- [ ] Индивидуальное задание (подпись)
- [ ] Характеристика от руководителя
- [ ] Аттестационный лист

---

## Локальная разработка (если нужно)

```bash
docker compose up -d
cp backend/.env.example backend/.env
npm run setup
npm run dev
```

---

## Чеклист перед защитой

| Пункт | Готово? |
|-------|---------|
| GitHub public, 15+ commits | ☐ |
| Vercel открывается | ☐ |
| Render /api/health = 200 | ☐ |
| Логин demo работает на деплое | ☐ |
| GIF записан | ☐ |
| docx заполнен | ☐ |
| Code Climate badge | ☐ |
| Дневник + бумаги | ☐ |

**Оценка 3:** деплой + GitHub + отчёт  
**Оценка 4–5:** + GIF + Code Climate + скрины + ПМ11 SQL
