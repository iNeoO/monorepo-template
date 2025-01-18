ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS next-frontend-builder

WORKDIR /app
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
COPY ./packages/next-frontend/package.json packages/next-frontend/
COPY ./packages/next-frontend packages/next-frontend

RUN yarn workspace next-frontend install
CMD ["yarn", "dev:next"]
