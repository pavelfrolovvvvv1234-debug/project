# ERD

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
    }

    networks {
        string id PK
        string name
        string owner_id FK
    }

    sites {
        string id PK
        string network_id FK
        string domain
        string title
        string status
    }

    site_keywords {
        string id PK
        string site_id FK
        string keyword
        int competition
        int difficulty
    }

    behavioral_snapshots {
        string id PK
        string site_id FK
        float bounce_rate
        int engagement_score
    }

    site_links {
        string id PK
        string from_site_id FK
        string to_site_id FK
        string anchor_text
    }
```

SQL: `schema.sql`, view/trigger/function: `postgresql-extras.sql`.
