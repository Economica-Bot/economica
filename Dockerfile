# builder

FROM node:16.9.1-alpine AS builder

WORKDIR /src/builder

COPY ["package*.json", "tsconfig.json", "./"]

RUN yarn install

COPY ["src", "./src"]

RUN yarn build

# bot

FROM node:16.9.1-alpine AS app

WORKDIR /src/app

ENV NODE_ENV=production

EXPOSE 3000

COPY ["package*.json", "tsconfig.json", "./"]

RUN yarn install

COPY --from=builder /src/builder/dist ./dist

ENTRYPOINT ["yarn", "start"]
