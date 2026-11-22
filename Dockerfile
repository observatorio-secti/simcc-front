# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Build: gera o dist/ com o Vite.
#
# As variáveis VITE_* vão para o JavaScript público (nunca coloque segredo).
# Cada uma pode vir de um --build-arg ou do .env copiado com o código; o
# build-arg vence. Os ARGs sem valor padrão não entram no ambiente quando não
# são passados, então não apagam o que estiver no .env.
# ---------------------------------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_BASE_PATH=/simcc/
ARG VITE_SIMCC_API_URL
ARG VITE_ODA_API_URL
ARG VITE_ADMIN_API_URL
ARG VITE_IDP_URL
ARG VITE_MARIA_API_URL
ARG VITE_GA_MEASUREMENT_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Exportação: só o dist/, para
#   docker build --target export --output type=local,dest=./dist .
# (é o que o deploy-obs.yaml usa: o servidor serve a pasta dist/).
# ---------------------------------------------------------------------------
FROM scratch AS export
COPY --from=builder /app/dist /

# ---------------------------------------------------------------------------
# Runtime (estágio padrão): nginx servindo o app sob o basepath, com fallback
# de SPA e cache longo para os assets com hash. É o que o compose.yaml sobe.
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

ARG VITE_BASE_PATH=/simcc/
# Lido pelo envsubst do entrypoint do nginx, que gera a configuração a partir
# de /etc/nginx/templates/.
ENV BASE_PATH=${VITE_BASE_PATH}

# Tira a página de boas-vindas do nginx: fora do basepath, só 404.
RUN rm -rf /usr/share/nginx/html/*
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html${VITE_BASE_PATH}

EXPOSE 80
