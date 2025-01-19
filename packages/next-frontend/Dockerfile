ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS next-frontend-builder

RUN apk add --no-cache wget

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

ENV PATH="/root/.local/share/pnpm:$PATH"

WORKDIR /app

COPY package*.json pnpm* ./

COPY ./packages/next-frontend/package.json packages/next-frontend/
COPY ./packages/next-frontend packages/next-frontend

RUN pnpm --filter next-frontend install --frozen-lockfile

CMD ["pnpm", "dev:next"]
