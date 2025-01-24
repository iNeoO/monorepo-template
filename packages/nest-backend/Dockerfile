ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS nest-backend-dev

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package*.json pnpm* ./

COPY ./packages/nest-backend/package.json packages/nest-backend/
COPY ./packages/nest-backend packages/nest-backend

RUN pnpm --filter nest-backend install

CMD ["pnpm", "dev:nest"]
