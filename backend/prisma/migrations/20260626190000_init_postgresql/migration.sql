-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "networks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "networks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "html_body" TEXT NOT NULL,
    "default_meta_title" TEXT NOT NULL,
    "default_meta_description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "template_id" TEXT,
    "domain" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "niche" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_tags" (
    "site_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "site_tags_pkey" PRIMARY KEY ("site_id","tag_id")
);

-- CreateTable
CREATE TABLE "seo_snapshots" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "page_title" TEXT,
    "meta_description" TEXT,
    "h1" TEXT,
    "canonical" TEXT,
    "robots_txt_ok" BOOLEAN NOT NULL DEFAULT false,
    "seo_score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "seo_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uptime_checks" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_code" INTEGER,
    "response_ms" INTEGER,
    "is_up" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "uptime_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_links" (
    "id" TEXT NOT NULL,
    "network_id" TEXT NOT NULL,
    "from_site_id" TEXT NOT NULL,
    "to_site_id" TEXT NOT NULL,
    "anchor_text" TEXT NOT NULL,
    "link_type" TEXT NOT NULL DEFAULT 'dofollow',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_keywords" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "google_volume" INTEGER NOT NULL DEFAULT 0,
    "yandex_volume" INTEGER NOT NULL DEFAULT 0,
    "competition" INTEGER NOT NULL DEFAULT 50,
    "difficulty" INTEGER NOT NULL DEFAULT 50,
    "intent" TEXT NOT NULL DEFAULT 'informational',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavioral_snapshots" (
    "id" TEXT NOT NULL,
    "site_id" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bounce_rate" DOUBLE PRECISION NOT NULL,
    "avg_time_sec" INTEGER NOT NULL,
    "pages_per_session" DOUBLE PRECISION NOT NULL,
    "scroll_depth" INTEGER NOT NULL,
    "return_rate" DOUBLE PRECISION NOT NULL,
    "engagement_score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "behavioral_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "networks_owner_id_idx" ON "networks"("owner_id");

-- CreateIndex
CREATE INDEX "sites_network_id_idx" ON "sites"("network_id");

-- CreateIndex
CREATE INDEX "sites_owner_id_idx" ON "sites"("owner_id");

-- CreateIndex
CREATE INDEX "sites_status_idx" ON "sites"("status");

-- CreateIndex
CREATE UNIQUE INDEX "sites_owner_id_domain_key" ON "sites"("owner_id", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "seo_snapshots_site_id_idx" ON "seo_snapshots"("site_id");

-- CreateIndex
CREATE INDEX "uptime_checks_site_id_idx" ON "uptime_checks"("site_id");

-- CreateIndex
CREATE INDEX "site_links_network_id_idx" ON "site_links"("network_id");

-- CreateIndex
CREATE UNIQUE INDEX "site_links_from_site_id_to_site_id_key" ON "site_links"("from_site_id", "to_site_id");

-- CreateIndex
CREATE INDEX "site_keywords_site_id_idx" ON "site_keywords"("site_id");

-- CreateIndex
CREATE UNIQUE INDEX "site_keywords_site_id_keyword_key" ON "site_keywords"("site_id", "keyword");

-- CreateIndex
CREATE INDEX "behavioral_snapshots_site_id_idx" ON "behavioral_snapshots"("site_id");

-- AddForeignKey
ALTER TABLE "networks" ADD CONSTRAINT "networks_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "site_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_tags" ADD CONSTRAINT "site_tags_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_tags" ADD CONSTRAINT "site_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_snapshots" ADD CONSTRAINT "seo_snapshots_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uptime_checks" ADD CONSTRAINT "uptime_checks_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_links" ADD CONSTRAINT "site_links_network_id_fkey" FOREIGN KEY ("network_id") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_links" ADD CONSTRAINT "site_links_from_site_id_fkey" FOREIGN KEY ("from_site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_links" ADD CONSTRAINT "site_links_to_site_id_fkey" FOREIGN KEY ("to_site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_keywords" ADD CONSTRAINT "site_keywords_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavioral_snapshots" ADD CONSTRAINT "behavioral_snapshots_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
