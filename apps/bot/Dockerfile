FROM node:16.20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++
RUN apk update

WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@economica/bot --docker

FROM node:16-alpine AS installer
RUN apk add --no-cache libc6-compat git python3 make g++
RUN apk update
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY --from=builder /app/turbo.json ./turbo.json
RUN yarn install --frozen-lockfile

FROM node:16-alpine AS runner
WORKDIR /app
COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY tsconfig.json tsconfig.json
CMD yarn tsx --tsconfig apps/bot/tsconfig.json apps/bot/src/index.ts
