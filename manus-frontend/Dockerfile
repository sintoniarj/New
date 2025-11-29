# Multi-stage build para frontend React - CORRIGIDO

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files (incluindo lock para npm ci)
COPY package.json package-lock.json ./

# npm ci é 3x mais rápido que npm install!
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage 2: Nginx super leve
FROM nginx:alpine

# Copiar build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
