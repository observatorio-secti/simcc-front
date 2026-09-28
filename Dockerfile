FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_BASE_PATH=/
ARG VITE_API_URL=http://api:8000
ARG VITE_TAXONOMY_API_URL=http://api:8000
ARG VITE_URL_GERAL=http://api:8000/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_TAXONOMY_API_URL=$VITE_TAXONOMY_API_URL
ENV VITE_URL_GERAL=$VITE_URL_GERAL
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./

RUN npm install --legacy-peer-deps --force

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
