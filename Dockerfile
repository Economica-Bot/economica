# installer

FROM node:16.9.1-alpine as installer
WORKDIR /src/installer

COPY ["package.json", "yarn.lock", "tsconfig.json", "./"]

RUN apk update && apk add --no-cache git
RUN yarn install

# builder

FROM node:16.9.1-alpine AS builder
WORKDIR /src/builder

COPY ["package.json", "./"]
COPY ["src", "./src"]

# Copy dependencies that were installed before
COPY --from=installer /src/installer/node_modules node_modules

RUN yarn build

# bot

FROM node:16.9.1-alpine AS app
WORKDIR /src/app

ENV NODE_ENV=production

EXPOSE 3000

COPY ["package*.json", "tsconfig.json", "./"]
COPY --from=installer /src/installer/node_modules ./node_modules
COPY --from=builder /src/builder/dist ./dist

ENTRYPOINT ["yarn", "start"]
