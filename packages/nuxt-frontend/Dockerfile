ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS nuxt-frontend-builder

RUN apk add --no-cache wget

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

ENV PATH="/root/.local/share/pnpm:$PATH"

WORKDIR /app

COPY package*.json pnpm* ./

COPY ./packages/nuxt-frontend/package.json packages/nuxt-frontend/
COPY ./packages/nuxt-frontend packages/nuxt-frontend

RUN pnpm --filter nuxt-frontend install --frozen-lockfile

CMD ["pnpm", "dev:nuxt"]
