ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS hono-backend-builder

RUN apk add --no-cache wget

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

ENV PATH="/root/.local/share/pnpm:$PATH"

WORKDIR /app

COPY package*.json pnpm* ./

COPY ./packages/hono-backend/package.json packages/hono-backend/
COPY ./packages/hono-backend packages/hono-backend

RUN pnpm --filter hono-backend install --frozen-lockfile

CMD ["pnpm", "dev:hono"]