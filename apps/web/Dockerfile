FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

RUN corepack enable

RUN pnpm install

RUN pnpm --filter web build


FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app .

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start"]