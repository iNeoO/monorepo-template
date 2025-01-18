ARG NODE_VERSION=23-alpine as base
FROM node:$NODE_VERSION AS nest-backend-builder

WORKDIR /app
COPY package.json .yarnrc.yml yarn.lock ./
COPY .yarn ./.yarn
COPY ./packages/nest-backend/package.json packages/nest-backend/
COPY ./packages/nest-backend packages/nest-backend

RUN yarn workspace nest-backend install
CMD ["yarn", "dev:nest"]
