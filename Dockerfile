FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps --force
RUN npm i emoji-mart

COPY . .

RUN npm run build

# Etapa para rodar o servidor Node.js
FROM node:18-alpine AS server

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["node", "server.js"]

# Etapa final com Nginx para servir o React
FROM nginx:alpine AS nginx

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
