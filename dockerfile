# -------- Build Stage --------
FROM node:22.20.0-alpine3.20 AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

# -------- Production Stage --------
FROM node:22.20.0-alpine3.20

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]