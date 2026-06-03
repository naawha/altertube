# Production

## Два слоя nginx

| Слой | Файл | Что внутри |
|------|------|------------|
| **Приложение** | [`nginx/app.conf`](nginx/app.conf) | `/vi/` → Invidious, `/` → Next. Идёт в docker compose. |
| **Инфраструктура** | [`infra/syllinn.me/video.syllinn.me.conf`](infra/syllinn.me/video.syllinn.me.conf) | `video.syllinn.me`, TLS (Certbot), прокси на `:8082`. Только ваш сервер. |

```
Интернет → infra (443, cert) → 127.0.0.1:8082 → app.conf (docker) → Next / Invidious
```

## Запуск приложения

```bash
cd production && cp .env.example .env
chmod +x up.sh
./up.sh up -d --build
curl -sI http://127.0.0.1:8082/ | head -1
```

## Nginx на сервере (infra)

```bash
sudo cp production/infra/syllinn.me/video.syllinn.me.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/video.syllinn.me.conf /etc/nginx/sites-enabled/
sudo certbot --nginx -d video.syllinn.me
sudo nginx -t && sudo nginx -s reload
```

На другом домене/сервере — скопируйте `infra/syllinn.me/` в свой каталог и поправьте `server_name` и пути к сертификатам. `nginx/app.conf` менять не нужно.

## `.env`

```env
BACKEND=piped
PIPED_INTERNAL_URL=http://host.docker.internal:8090
INVIDIOUS_INTERNAL_URL=http://host.docker.internal:8091
HTTP_PORT=8082
```

Локальная разработка — [`../development/`](../development/).
