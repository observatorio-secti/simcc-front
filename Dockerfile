FROM node:22-alpine AS builder

WORKDIR /app

# As variáveis VITE_* são lidas do .env copiado com o código.
ARG VITE_BASE_PATH=/
ENV VITE_BASE_PATH=$VITE_BASE_PATH

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage de exportação: copia apenas a pasta dist para a saída
FROM scratch AS export
COPY --from=builder /app/dist /
