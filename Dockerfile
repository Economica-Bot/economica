# builder

FROM node:16.9.1-alpine AS builder

WORKDIR /src/builder

ENV NODE_ENV=production

COPY ["package*.json", "tsconfig.json", "./"]

RUN npm install --dev

COPY ["src", "./src"]

RUN npm run build

# bot

FROM node:16.9.1-alpine AS app

WORKDIR /src/app

ENV NODE_ENV=production

EXPOSE 3000

COPY ["package*.json", "tsconfig.json", "./"]

RUN npm install --production

COPY --from=builder /src/builder/dist ./dist

ENTRYPOINT ["npm", "run", "start"]
