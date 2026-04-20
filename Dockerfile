# ── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias primero (capa cacheada mientras package.json no cambie)
COPY package.json ./
RUN npm install --ignore-scripts

# Copiar el resto del código fuente
COPY . .

# Compilar con la configuración docker (imagesPath correcto para raíz /)
RUN npx ng build --configuration docker

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Eliminar configuración por defecto de nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copiar los artefactos del build
COPY --from=builder /app/dist/pokedex-angular /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
