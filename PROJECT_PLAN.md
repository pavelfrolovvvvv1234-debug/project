# SiteNet Manager — план проекта для сдачи практики (ПМ11 / ПМ02)

> **Официальное название для колледжа:**  
> «Веб-система управления сетью сайтов с SEO-мониторингом и планированием перелинковки»
>
> **Внутреннее название (для себя):** SEO Site Network Manager / PBN-панель

---

## 1. Зачем этот проект идеально закрывает практику

| Требование Хекслета | Как закрываем |
|---------------------|---------------|
| GitHub + коммиты | 15–25 осмысленных коммитов по фичам |
| README | Стек, запуск, деплой, login/password |
| **Рабочий деплой** | Frontend (Vercel) + Backend + PostgreSQL (Render) |
| Frontend + Backend + БД | React + Express + PostgreSQL |
| ERD | 8 таблиц со связями |
| 2–4 Use Case | 4 сценария (см. раздел 6) |
| API | REST + Swagger |
| Доказательства | Коммит + скрин на деплое на каждый Use Case |
| Демо | GIF 2 мин: логин → сайт → SEO → ссылка в сетке |
| Оценка 4 | Code Climate badge A/B |
| Оценка 5 | Auth + «сложная фича» = SEO-анализ + матрица перелинковки |

---

## 2. Что делает проект (scope MVP)

**Не делаем:** массовую генерацию спам-сайтов, автопостинг, обход Google.  
**Делаем:** профессиональную панель, как у SEO-агентства для **своей** сети проектов.

### Модули

### 2.1 Auth
- Регистрация / вход / JWT
- Роли: `admin`, `user` (admin видит всё, user — только свои сайты)

### 2.2 Управление сайтами (ядро)
- CRUD сайтов: домен, название, ниша, статус (`active` / `draft` / `down`)
- Привязка к **сети** (network) — группа связанных проектов
- Теги и категории

### 2.3 SEO-панель (сложная фича №1)
- Парсинг URL: `title`, `meta description`, `h1`, `canonical`, `robots.txt`
- Сохранение снимка SEO в БД (история проверок)
- Оценка «SEO score» (простая формула: есть title + description + h1 = 100%)

### 2.4 Мониторинг (сложная фича №2)
- Проверка HTTP-статуса (200/301/404/timeout)
- Время ответа (ms)
- Cron/job раз в N минут (или кнопка «Проверить все»)

### 2.5 Сетка / перелинковка (PBN-логика, но в отчёте — «планирование внутренних связей»)
- Таблица **links**: `from_site_id` → `to_site_id`, anchor text, тип (`dofollow` / `nofollow`)
- **Матрица перелинковки** — UI-таблица: кто на кого ссылается
- Валидация: нельзя ссылку на самого себя, дубликаты запрещены
- Экспорт CSV матрицы (для отчёта — «выгрузка данных»)

### 2.6 Шаблоны мини-сайтов (упрощённый «создатель»)
- Шаблон landing (HTML + meta) с подстановкой: `{title}`, `{description}`, `{anchor_links}`
- **Preview** в iframe / новой вкладке
- Сохранение конфига шаблона в БД — не реальный хостинг 100 доменов, а **генератор HTML** для деплоя вручную

### 2.7 Sitemap
- Генерация `sitemap.xml` по списку активных сайтов сети

---

## 3. Технологический стек

```
Frontend:  React 18 + Vite + TypeScript + Tailwind CSS + React Router
Backend:   Node.js + Express + TypeScript
ORM:       Prisma
БД:        PostgreSQL (Render / Neon free tier)
Auth:      JWT (httpOnly cookie или Bearer)
API docs:  Swagger (swagger-ui-express)
Deploy:    Vercel (frontend) + Render (backend + DB)
CI:        GitHub Actions (lint + build) — опционально, +к качеству
```

**Почему этот стек:** максимум туториалов, бесплатный деплой, Prisma = красивый ERD для отчёта.

---

## 4. Схема базы данных (ERD)

```
User
├── id (uuid, PK)
├── email (unique)
├── password_hash
├── role (admin | user)
├── created_at, updated_at
│
Network (SEO-сетка / группа проектов)
├── id (PK)
├── name
├── description
├── owner_id (FK → User)
├── created_at, updated_at
│
Site
├── id (PK)
├── network_id (FK → Network)
├── owner_id (FK → User)
├── domain (unique per owner)
├── title
├── niche (varchar) — ниша: «крипто», «travel» и т.д.
├── status (active | draft | down)
├── template_id (FK → SiteTemplate, nullable)
├── created_at, updated_at
│
SiteTemplate
├── id (PK)
├── name
├── html_body (text) — шаблон с плейсхолдерами
├── default_meta_title
├── default_meta_description
│
Tag
├── id (PK)
├── name (unique)
│
SiteTag (M:N)
├── site_id, tag_id
│
SeoSnapshot (история SEO-проверок)
├── id (PK)
├── site_id (FK → Site)
├── checked_at
├── page_title, meta_description, h1
├── canonical, robots_txt_ok (boolean)
├── seo_score (int 0–100)
│
UptimeCheck
├── id (PK)
├── site_id (FK → Site)
├── checked_at
├── status_code (int)
├── response_ms (int)
├── is_up (boolean)
│
SiteLink (перелинковка / матрица сетки)
├── id (PK)
├── network_id (FK → Network)
├── from_site_id (FK → Site)
├── to_site_id (FK → Site)
├── anchor_text
├── link_type (dofollow | nofollow)
├── created_at
└── UNIQUE(from_site_id, to_site_id)
```

### SQL для отчёта (ПМ11)
- `CREATE TABLE` скрипты (Prisma migrate → экспорт SQL)
- **View:** `v_network_link_matrix` — сводка ссылок по сети
- **Stored procedure / function:** `recalculate_network_seo_avg(network_id)` — средний SEO score сети
- **Trigger:** при INSERT в `SiteLink` — проверка `from_site_id != to_site_id`
- **Backup:** pg_dump инструкция в README + скрин в отчёте

---

## 5. API (для Swagger и отчёта)

### Auth
| Method | URL | Описание |
|--------|-----|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход → JWT |
| GET | `/api/auth/me` | Текущий пользователь |

### Networks
| Method | URL | Описание |
|--------|-----|----------|
| GET | `/api/networks` | Список сетей |
| POST | `/api/networks` | Создать сеть |
| GET | `/api/networks/:id` | Детали + сайты |
| DELETE | `/api/networks/:id` | Удалить |

### Sites
| Method | URL | Описание |
|--------|-----|----------|
| GET | `/api/sites` | Список (фильтр: network, status, search) |
| POST | `/api/sites` | Добавить сайт |
| GET | `/api/sites/:id` | Детали |
| PUT | `/api/sites/:id` | Обновить |
| DELETE | `/api/sites/:id` | Удалить |

### SEO
| Method | URL | Описание |
|--------|-----|----------|
| POST | `/api/sites/:id/seo-check` | Запустить SEO-анализ URL |
| GET | `/api/sites/:id/seo-history` | История снимков |

### Uptime
| Method | URL | Описание |
|--------|-----|----------|
| POST | `/api/sites/:id/uptime-check` | Проверить доступность |
| GET | `/api/sites/:id/uptime-history` | История |

### Links (перелинковка)
| Method | URL | Описание |
|--------|-----|----------|
| GET | `/api/networks/:id/links` | Все ссылки сети |
| GET | `/api/networks/:id/link-matrix` | Матрица N×N |
| POST | `/api/links` | Создать связь |
| DELETE | `/api/links/:id` | Удалить связь |

### Templates & Export
| Method | URL | Описание |
|--------|-----|----------|
| GET | `/api/templates` | Шаблоны |
| POST | `/api/sites/:id/preview` | HTML preview |
| GET | `/api/networks/:id/sitemap.xml` | Sitemap |
| GET | `/api/networks/:id/export-links.csv` | CSV матрицы |

---

## 6. Use Case для отчёта (4 штуки)

### UC-1: Регистрация и создание SEO-сети
**Актор:** SEO-специалист  
**Цель:** завести новую сеть проектов  
**Шаги:**
1. Регистрация / вход
2. «Создать сеть» → имя «Travel PBN Q2»
3. Система сохраняет Network в БД  
**Результат:** сеть отображается в дашборде

### UC-2: Добавление сайта в сеть
**Шаги:**
1. Выбрать сеть → «Добавить сайт»
2. Ввести domain, title, нишу, теги
3. Сохранить  
**Результат:** сайт в списке, запись в `Site` + `SiteTag`

### UC-3: SEO-анализ сайта
**Шаги:**
1. Открыть карточку сайта
2. «Проверить SEO» → backend парсит URL
3. Показать title, description, h1, score  
**Результат:** запись в `SeoSnapshot`, график истории

### UC-4: Построение матрицы перелинковки
**Шаги:**
1. Вкладка «Сетка» у сети
2. Добавить связь: Site A → Site B, anchor «лучшие отели»
3. Матрица обновляется  
**Результат:** запись в `SiteLink`, визуальная таблица, экспорт CSV

---

## 7. UI — экраны (7 страниц)

1. **Login / Register**
2. **Dashboard** — карточки: сетей, сайтов, средний SEO score, сайты down
3. **Networks** — список сетей + создать
4. **Network Detail** — вкладки: Сайты | Сетка | Sitemap | Экспорт
5. **Site Detail** — SEO, uptime, история, редактирование
6. **Link Matrix** — таблица N×N (кто на кого ссылается)
7. **Template Preview** — превью сгенерированного landing

---

## 8. Структура репозитория

```
site-network-manager/
├── README.md
├── .github/
│   └── workflows/ci.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── seoParser.ts      # cheerio + fetch
│   │   │   └── uptimeChecker.ts
│   │   └── middleware/auth.ts
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   ├── package.json
│   └── vite.config.ts
└── docs/
    ├── ERD.png
    ├── use-cases.png
    └── architecture.png
```

---

## 9. README — шаблон (скопируй когда будет готово)

```markdown
# SiteNet Manager

Веб-система управления сетью сайтов с SEO-мониторингом и планированием перелинковки.

## Стек
- Frontend: React, Vite, TypeScript, Tailwind
- Backend: Node.js, Express, Prisma
- DB: PostgreSQL

## Демо
- 🌐 Приложение: https://YOUR-FRONTEND.vercel.app
- 📚 API Swagger: https://YOUR-BACKEND.onrender.com/api/docs

## Тестовый доступ
- login: demo@college.local
- password: Demo123!

## Локальный запуск
1. `cd backend && cp .env.example .env && npm i && npx prisma migrate dev && npm run dev`
2. `cd frontend && npm i && npm run dev`

## Code Climate
[![Maintainability](https://api.codeclimate.com/v1/badges/XXX/maintainability)](...)
```

---

## 10. План коммитов (привязка к отчёту)

| # | Коммит | Use Case |
|---|--------|----------|
| 1 | `init: monorepo structure` | — |
| 2 | `feat(db): prisma schema users networks sites` | UC-1 |
| 3 | `feat(auth): register login jwt` | UC-1 |
| 4 | `feat(api): networks CRUD` | UC-1 |
| 5 | `feat(ui): login register dashboard` | UC-1 |
| 6 | `feat(api): sites CRUD` | UC-2 |
| 7 | `feat(ui): site list and create form` | UC-2 |
| 8 | `feat(seo): parser service cheerio` | UC-3 |
| 9 | `feat(api): seo-check endpoint` | UC-3 |
| 10 | `feat(ui): seo panel and history chart` | UC-3 |
| 11 | `feat(db): site_links table` | UC-4 |
| 12 | `feat(api): links and link-matrix` | UC-4 |
| 13 | `feat(ui): link matrix table` | UC-4 |
| 14 | `feat: uptime checker` | бонус |
| 15 | `feat: sitemap.xml export` | бонус |
| 16 | `feat: site template preview` | бонус |
| 17 | `docs: swagger openapi` | отчёт |
| 18 | `deploy: render + vercel config` | отчёт |
| 19 | `docs: readme badges codeclimate` | оценка 4 |
| 20 | `chore: seed demo data` | демо |

---

## 11. План по дням (14 дней → сдача)

### День 1–2: Фундамент
- [ ] Создать GitHub repo (публичный)
- [ ] Init backend + frontend + Prisma schema
- [ ] PostgreSQL на Render/Neon
- [ ] Auth (register/login)
- [ ] **Коммиты 1–5**

### День 3–4: Сайты и сети
- [ ] Networks + Sites CRUD API
- [ ] UI: dashboard, списки, формы
- [ ] Seed: demo user + 3 сети + 10 сайтов
- [ ] **Коммиты 6–7**

### День 5–6: SEO-модуль
- [ ] `seoParser.ts` — fetch URL + cheerio
- [ ] SeoSnapshot сохранение
- [ ] UI карточка SEO + история
- [ ] **Коммиты 8–10**

### День 7–8: Перелинковка (PBN-ядро)
- [ ] SiteLink API + matrix endpoint
- [ ] UI матрица
- [ ] CSV export
- [ ] SQL view + trigger в миграции
- [ ] **Коммиты 11–13**

### День 9–10: Бонусы + деплой
- [ ] Uptime checker
- [ ] Sitemap.xml
- [ ] Template preview
- [ ] Deploy backend → Render, frontend → Vercel
- [ ] Проверить: всё открывается, нет 500
- [ ] **Коммиты 14–18**

### День 11–12: Полировка под оценку 4–5
- [ ] Code Climate подключить
- [ ] Swagger `/api/docs`
- [ ] README финальный + login/password
- [ ] Записать GIF (asciineca или ScreenToGif)
- [ ] **Коммиты 19–20**

### День 13–14: Отчёт и бумаги
- [ ] Заполнить `Шаблон_отчета_по_практике.docx`
- [ ] ERD скрин из Prisma Studio / dbdiagram.io
- [ ] Use Case диаграмма (draw.io)
- [ ] Таблица API из Swagger
- [ ] Скрины: деплой + 4 сценария + коммиты GitHub
- [ ] Дневник практики по датам
- [ ] Сдать пакет куратору

---

## 12. Чеклист сдачи (распечатай)

```
[ ] GitHub публичный, 15+ коммитов
[ ] README: описание, стек, запуск, деплой, login/password
[ ] Деплой работает без 400/500
[ ] ERD в отчёте (8 таблиц)
[ ] 4 Use Case с диаграммами
[ ] Таблица API (минимум 12 endpoints)
[ ] На каждый Use Case: ссылка на коммит + скрин на деплое
[ ] GIF/видео демо ~2 мин
[ ] Code Climate badge A или B (для 4+)
[ ] Auth с тестовым аккаунтом в отчёте (для 5)
[ ] SQL: view + function + trigger (для ПМ11)
[ ] Дневник + характеристика + аттестационный лист
```

---

## 13. Формулировки для отчёта (копируй)

**Тема:**  
«Разработка веб-системы управления сетью сайтов с функциями SEO-анализа и планирования внутренней перелинковки»

**Цель:**  
Автоматизировать учёт веб-проектов в рамках SEO-кампаний, мониторинг технического состояния сайтов и планирование ссылочной структуры между ресурсами одной предметной сети.

**Задачи (ПМ11):**
1. Анализ предметной области SEO-управления
2. Разработка логической и физической модели БД
3. Нормализация данных (3НФ)
4. Реализация хранимых процедур и триггеров
5. Разработка механизма резервного копирования БД
6. Тестирование и развёртывание системы

**Что НЕ писать в отчёте:** PBN, накрутка, обход Google, спам.

---

## 14. Демо-данные для защиты

```
Пользователь: demo@college.local / Demo123!

Сеть 1: "Travel Network" — 4 сайта
Сеть 2: "Tech Blog Network" — 3 сайта

Ссылки:
  travel-a.com → travel-b.com (anchor: "отели в Европе")
  travel-b.com → travel-c.com (anchor: "авиабилеты")
  tech-1.com → tech-2.com (anchor: "обзор гаджетов")

SEO checks: 2–3 уже в истории
Uptime: 1 сайт специально down для демо алертов
```

---

## 15. Следующий шаг

Скажи **«погнали код»** — и начнём с Дня 1:
1. Scaffold репозитория
2. Prisma schema
3. Auth API
4. Первый деплой

Стек по умолчанию: **React + Node + Prisma + PostgreSQL**.
