export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "SiteNet Manager API",
    version: "1.0.0",
    description:
      "API для управления сетью сайтов, SEO-анализа и планирования перелинковки (практика ПМ11)",
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
    "/networks": {
      get: { tags: ["Networks"], summary: "Список сетей", responses: { "200": { description: "OK" } } },
      post: { tags: ["Networks"], summary: "Создать сеть", responses: { "201": { description: "Created" } } },
    },
    "/networks/{id}": {
      get: { tags: ["Networks"], summary: "Детали сети", responses: { "200": { description: "OK" } } },
      put: { tags: ["Networks"], summary: "Обновить сеть", responses: { "200": { description: "OK" } } },
      delete: { tags: ["Networks"], summary: "Удалить сеть", responses: { "204": { description: "No Content" } } },
    },
    "/sites": {
      get: { tags: ["Sites"], summary: "Список сайтов", responses: { "200": { description: "OK" } } },
      post: { tags: ["Sites"], summary: "Добавить сайт", responses: { "201": { description: "Created" } } },
    },
    "/sites/{id}/seo-check": {
      post: { tags: ["SEO"], summary: "SEO-анализ URL", responses: { "200": { description: "OK" } } },
    },
    "/sites/{id}/uptime-check": {
      post: { tags: ["Uptime"], summary: "Проверка доступности", responses: { "200": { description: "OK" } } },
    },
    "/links/network/{networkId}/matrix": {
      get: { tags: ["Links"], summary: "Матрица перелинковки", responses: { "200": { description: "OK" } } },
    },
    "/links": {
      post: { tags: ["Links"], summary: "Создать связь", responses: { "201": { description: "Created" } } },
    },
  },
} as const;
