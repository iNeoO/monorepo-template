ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS next-frontend-dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package*.json pnpm* ./

COPY ./packages/next-frontend/package.json packages/next-frontend/
COPY ./packages/next-frontend packages/next-frontend

RUN pnpm --filter next-frontend install

CMD ["pnpm", "dev:next"]
