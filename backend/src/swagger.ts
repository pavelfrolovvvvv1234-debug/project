export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "SiteNet Manager API",
    version: "1.0.0",
    description: "API SiteNet Manager",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Регистрация",
        security: [],
        responses: { "201": { description: "Created" } },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Вход",
        security: [],
        responses: { "200": { description: "OK" } },
      },
    },
    "/auth/me": {
      get: { tags: ["Auth"], summary: "Текущий пользователь", responses: { "200": { description: "OK" } } },
    },
    "/dashboard": {
      get: { tags: ["Dashboard"], summary: "Статистика", responses: { "200": { description: "OK" } } },
    },
    "/dashboard/check-all": {
      post: { tags: ["Dashboard"], summary: "Проверить все сайты", responses: { "200": { description: "OK" } } },
    },
    "/networks": {
      get: { tags: ["Networks"], summary: "Список сетей", responses: { "200": { description: "OK" } } },
      post: { tags: ["Networks"], summary: "Создать сеть", responses: { "201": { description: "Created" } } },
    },
    "/networks/{id}": {
      get: { tags: ["Networks"], summary: "Детали сети", responses: { "200": { description: "OK" } } },
      put: { tags: ["Networks"], summary: "Обновить сеть", responses: { "200": { description: "OK" } } },
      delete: { tags: ["Networks"], summary: "Удалить сеть", responses: { "204": { description: "No Content" } } },
    },
    "/networks/{id}/sitemap.xml": {
      get: { tags: ["Networks"], summary: "Sitemap сети", responses: { "200": { description: "XML" } } },
    },
    "/networks/{id}/export-links.csv": {
      get: { tags: ["Networks"], summary: "Экспорт ссылок CSV", responses: { "200": { description: "CSV" } } },
    },
    "/sites": {
      get: { tags: ["Sites"], summary: "Список сайтов", responses: { "200": { description: "OK" } } },
      post: { tags: ["Sites"], summary: "Добавить сайт", responses: { "201": { description: "Created" } } },
    },
    "/sites/{id}": {
      get: { tags: ["Sites"], summary: "Сайт по id", responses: { "200": { description: "OK" } } },
      put: { tags: ["Sites"], summary: "Обновить сайт", responses: { "200": { description: "OK" } } },
      delete: { tags: ["Sites"], summary: "Удалить сайт", responses: { "204": { description: "No Content" } } },
    },
    "/sites/{id}/seo-check": {
      post: { tags: ["Sites"], summary: "Проверка страницы", responses: { "200": { description: "OK" } } },
    },
    "/sites/{id}/seo-history": {
      get: { tags: ["Sites"], summary: "История SEO", responses: { "200": { description: "OK" } } },
    },
    "/sites/{id}/uptime-check": {
      post: { tags: ["Uptime"], summary: "Проверка доступности", responses: { "200": { description: "OK" } } },
    },
    "/sites/{id}/uptime-history": {
      get: { tags: ["Uptime"], summary: "История uptime", responses: { "200": { description: "OK" } } },
    },
    "/sites/{id}/behavioral-check": {
      post: { tags: ["Sites"], summary: "Поведенческие метрики", responses: { "200": { description: "OK" } } },
    },
    "/sites/{id}/behavioral-history": {
      get: { tags: ["Sites"], summary: "История поведенческих метрик", responses: { "200": { description: "OK" } } },
    },
    "/sites/{id}/preview": {
      post: { tags: ["Sites"], summary: "Превью шаблона", responses: { "200": { description: "HTML" } } },
    },
    "/links/network/{networkId}/matrix": {
      get: { tags: ["Links"], summary: "Матрица перелинковки", responses: { "200": { description: "OK" } } },
    },
    "/links": {
      post: { tags: ["Links"], summary: "Создать связь", responses: { "201": { description: "Created" } } },
    },
    "/links/{id}": {
      delete: { tags: ["Links"], summary: "Удалить связь", responses: { "204": { description: "No Content" } } },
    },
    "/keywords/site/{siteId}": {
      get: { tags: ["Keywords"], summary: "Ключи сайта", responses: { "200": { description: "OK" } } },
    },
    "/keywords/network/{networkId}": {
      get: { tags: ["Keywords"], summary: "Ключи сети", responses: { "200": { description: "OK" } } },
    },
    "/templates": {
      get: { tags: ["Templates"], summary: "Список шаблонов", responses: { "200": { description: "OK" } } },
    },
  },
} as const;
