ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS hono-backend-builder

WORKDIR /app
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
COPY ./packages/hono-backend/package.json packages/hono-backend/
COPY ./packages/hono-backend packages/hono-backend

RUN yarn workspace hono-backend install
CMD ["yarn", "dev:hono"]