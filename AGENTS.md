# AGENTS.md — SimCC Front (`simcc-front`)

Este repositório faz parte do **Ecossistema Observatório CT&I Bahia / SimCC**. Ele é versionado de forma independente e contém a aplicação web (**React 18 + TypeScript + Vite + Tailwind CSS + Radix UI**) da plataforma **SimCC**, consumindo a API pública (`simcc-back`) e a API administrativa (`simcc-admin`).

> Consulte também as skills em `.agents/skills/` (`frontend-arquitetura`, `frontend-performance`, `diretrizes-dados-frontend`), a especificação visual em [`DESIGN.md`](DESIGN.md) e, quando na raiz do workspace, `../../AGENTS.md`.

---

## 1. Princípios Arquiteturais e de Design

1. **Design System (*Simcc Intelligence*)**:
   - Todas as telas, modais, barras laterais e gráficos devem seguir os tokens de superfície, cores (`primary: #07677e`, `navy-deep: #024A60`) e tipografia (`Lexend` para títulos/display, `Inter` para leitura densa, `JetBrains Mono` para indicadores/códigos) definidos em [`DESIGN.md`](DESIGN.md).
2. **Camada de Comunicação HTTP (`src/lib/api.ts` e `src/services/`)**:
   - Existem três instâncias Axios configuradas em [`src/lib/api.ts`](src/lib/api.ts):
     - `api` (`VITE_URL_GERAL`): aponta para a API de buscas acadêmicas (`simcc-back`).
     - `apiAdmin` (`VITE_URL_ADMIN`): aponta para a API administrativa e de autenticação (`simcc-admin`).
     - `apiOda` (`VITE_URL_GERAL2`): aponta para a API secundária ODA (quando configurada).
   - Os interceptors tratam normalização de subcaminhos, injeção de `Bearer Token` (`authStorage`) e fila de *refresh token* automático em respostas `401`.
   - As buscas V2 (`productions-v2.ts`, `researchers-v2.ts`, `suggestions-v2.ts`) são consumidas via hooks do **TanStack React Query** em `src/hooks/`.
3. **Idioma e Convenções**:
   - Textos de interface, comentários, documentação e commits em **Português do Brasil (pt-BR)**.
   - Tipagem estrita em TypeScript (`src/types/`).

---

## 2. Comandos Padrão de Desenvolvimento

- **Instalar dependências**: `npm install`
- **Iniciar servidor dev**: `npm run dev`
- **Compilar TypeScript + Build Vite**: `npm run build`
- **Executar ESLint**: `npm run lint` (ou `npm run lint:fix`)
- **Formatar com Prettier**: `npm run format`

---

## 3. Padrão de Documentação e Gatilhos Obrigatórios (Definition of Done)

A documentação deste repositório é composta por:
- [`README.md`](README.md): Visão geral, stack, árvore de diretórios (`src/`), variáveis `VITE_*` e scripts de desenvolvimento/build.
- [`DESIGN.md`](DESIGN.md): Especificação completa do Design System compartilhado com `observatorio-front`.

### Tabela de Atualização Obrigatória

**Nenhuma alteração de código está pronta sem atualizar a documentação correspondente na mesma tarefa:**

| Se você alterar... | Atualize obrigatoriamente: |
| :--- | :--- |
| Variáveis `import.meta.env.VITE_*` em `src/` | Tabela **⚙️ Configuração (`.env`)** no [`README.md`](README.md) |
| Instâncias de API em `src/lib/api.ts` ou serviços em `src/services/` | Seções **🧱 Stack e Arquitetura** e **📁 Estrutura de Diretórios** no [`README.md`](README.md) |
| Estrutura de pastas em `src/` (`components/`, `hooks/`, `pages/`, `types/`) | Árvore **📁 Estrutura de Diretórios** no [`README.md`](README.md) |
| Tokens de cor, tipografia ou superfícies no Tailwind/CSS | [`DESIGN.md`](DESIGN.md) (mantendo sincronia com `observatorio-front/DESIGN.md`) |
