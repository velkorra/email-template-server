FROM node:23-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:23-alpine

RUN apk --no-cache add dumb-init

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist/src ./dist

USER node
ENTRYPOINT ["dumb-init", "--"]

EXPOSE 5000

ENV NODE_ENV production

CMD ["node", "dist/app.js"]