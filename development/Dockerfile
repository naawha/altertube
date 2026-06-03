# Next dev: Debian (glibc), не Alpine — у lightningcss/Tailwind v4 стабильнее optional native .node.
# Исходники с хоста; node_modules — через сервис install_modules в docker-compose.
# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
EXPOSE 3000
CMD ["yarn", "dev:docker"]
