# Étape 1 : build Vite
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.* ./
COPY src ./src
COPY public ./public

RUN npm install
RUN npm run build

# Étape 2 : Nginx pour servir le build
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
