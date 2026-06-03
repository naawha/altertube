# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY package.json yarn.lock ./
# .npmrc не копируется в образ — монтируется secret при сборке (GitHub Packages)
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc \
    yarn install --frozen-lockfile

FROM node:20-bookworm-slim AS builder
WORKDIR /app
RUN corepack enable && corepack prepare yarn@1.22.22 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN yarn build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
CMD ["node", "server.js"]
