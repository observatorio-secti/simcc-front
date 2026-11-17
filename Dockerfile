FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_BASE_PATH=/
ARG VITE_URL_GERAL2=https://observatoriocti.secti.ba.gov.br/oda/v1/
ENV VITE_BASE_PATH=$VITE_BASE_PATH
ENV VITE_URL_GERAL2=$VITE_URL_GERAL2
ENV NODE_OPTIONS="--max-old-space-size=4096"

COPY package*.json ./

RUN npm install --legacy-peer-deps --force

COPY . .

RUN npm run build

# Stage de exportação: copia apenas a pasta dist para a saída
FROM scratch AS export
COPY --from=builder /app/dist /
