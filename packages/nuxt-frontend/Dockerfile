ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS nuxt-frontend-dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package*.json pnpm* ./

COPY ./packages/nuxt-frontend/package.json packages/nuxt-frontend/
COPY ./packages/nuxt-frontend packages/nuxt-frontend

RUN pnpm --filter nuxt-frontend install

CMD ["pnpm", "dev:nuxt"]
