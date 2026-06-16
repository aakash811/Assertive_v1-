# ---------- Builder ----------

FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN corepack enable

RUN pnpm install

RUN pnpm --filter api build


# ---------- Runtime ----------

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 4321

CMD ["pnpm", "--filter", "api", "dev"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
CMD wget --no-verbose --tries=1 \
--spider http://localhost:4321/api/health || exit 1