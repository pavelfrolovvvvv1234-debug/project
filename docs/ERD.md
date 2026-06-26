# ERD — SiteNet Manager

Скопируй диаграмму в отчёт (Mermaid: GitHub / [mermaid.live](https://mermaid.live)).

```mermaid
erDiagram
    users ||--o{ networks : owns
    users ||--o{ sites : owns
    networks ||--o{ sites : contains
    networks ||--o{ site_links : has
    sites ||--o{ seo_snapshots : has
    sites ||--o{ uptime_checks : has
    sites ||--o{ site_keywords : has
    sites ||--o{ behavioral_snapshots : has
    sites }o--o{ tags : tagged
    site_templates ||--o{ sites : uses
    sites ||--o{ site_links : from
    sites ||--o{ site_links : to

    users {
        string id PK
        string email UK
        string password_hash
        string role
        datetime created_at
        datetime updated_at
    }

    networks {
        string id PK
        string name
        string description
        string owner_id FK
    }

    sites {
        string id PK
        string network_id FK
        string owner_id FK
        string domain
        string title
        string niche
        string status
    }

    site_keywords {
        string id PK
        string site_id FK
        string keyword
        int google_volume
        int yandex_volume
        int competition
        int difficulty
        string intent
    }

    behavioral_snapshots {
        string id PK
        string site_id FK
        float bounce_rate
        int avg_time_sec
        float pages_per_session
        int scroll_depth
        float return_rate
        int engagement_score
    }

    site_links {
        string id PK
        string network_id FK
        string from_site_id FK
        string to_site_id FK
        string anchor_text
        string link_type
    }

    seo_snapshots {
        string id PK
        string site_id FK
        int seo_score
        string page_title
    }

    uptime_checks {
        string id PK
        string site_id FK
        boolean is_up
        int status_code
    }
```

## Нормализация (3НФ)

- Пользователи отделены от сетей и сайтов
- Теги вынесены в `tags` + M:N `site_tags`
- SEO, uptime, ключи и ПФ — отдельные таблицы (история без дублирования в `sites`)
- Перелинковка — `site_links` с уникальностью пары from/to

## SQL

Полный `CREATE TABLE` — `docs/schema.sql` (PostgreSQL).

View / trigger / function — `docs/postgresql-extras.sql`.
