ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS nest-backend-builder

RUN apk add --no-cache wget

RUN wget -qO- https://get.pnpm.io/install.sh | ENV="$HOME/.shrc" SHELL="$(which sh)" sh -

ENV PATH="/root/.local/share/pnpm:$PATH"

WORKDIR /app

COPY package*.json pnpm* ./

COPY ./packages/nest-backend/package.json packages/nest-backend/
COPY ./packages/nest-backend packages/nest-backend

RUN pnpm --filter nest-backend install --frozen-lockfile

CMD ["pnpm", "dev:nest"]
