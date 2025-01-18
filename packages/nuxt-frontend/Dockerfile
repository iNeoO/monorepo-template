ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS nuxt-frontend-builder

WORKDIR /app
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
COPY ./packages/nuxt-frontend/package.json packages/nuxt-frontend/
COPY ./packages/nuxt-frontend packages/nuxt-frontend

RUN yarn workspace nuxt-frontend install
CMD ["yarn", "dev:nuxt"]
