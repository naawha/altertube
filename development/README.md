# Docker Compose: локальная разработка

Стек: **nginx** на `:8080`, **Next** (hot reload) с внутренним API в `pages/api/v1/`.

Upstream (Piped / Invidious) — **внешние** инстансы на syllinn.me, не поднимаются локально.

| Переменная | По умолчанию |
|------------|--------------|
| `PIPED_INTERNAL_URL` | `https://api-video.syllinn.me` |
| `INVIDIOUS_INTERNAL_URL` | `https://invidious.syllinn.me` |
| `BACKEND` | `piped` |

Production-деплой этого проекта — [`../production/`](../production/).

## Архитектура API

| Маршрут | Куда |
|---------|------|
| `GET/POST /api/v1/auth/*` | Next → внешний upstream |
| `GET /api/v1/video/:id` | Next → внешний upstream |
| `GET /api/v1/comments/*` | Next → внешний upstream |
| `GET/POST /api/v1/subscriptions` | Next → внешний upstream |
| `GET/POST /api/v1/playlists` | Next → внешний upstream |
| `/vi/*` | nginx → `invidious.syllinn.me` |

## Подготовка

```bash
cd development && cp .env.example .env
```

## Запуск

```bash
chmod +x development/up.sh
./development/up.sh up -d --build
```

Откройте **http://localhost:8080**.

## Локально без Docker

```bash
export BACKEND=piped
export PIPED_INTERNAL_URL=https://api-video.syllinn.me
export INVIDIOUS_INTERNAL_URL=https://invidious.syllinn.me
export NEXT_PUBLIC_API_BASE=/api
yarn dev
```
