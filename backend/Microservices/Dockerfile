# Étape 1 : builder TypeScript
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

# Étape 2 : runner
FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

RUN npm install --omit=dev

EXPOSE 8000
CMD ["node", "dist/index.js"]
