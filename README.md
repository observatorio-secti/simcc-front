# SimCC Front · Aplicação Web (`simcc-front`)

Interface web (SPA) do **SimCC (Sistema de Mapeamento de Competências Científicas da Bahia)**, integrante do **Ecossistema Observatório CT&I Bahia**.

Permite a busca avançada e facetada (V2) de pesquisadores, produções bibliográficas, patentes, softwares, programas de pós-graduação (CAPES), grupos de pesquisa, indicadores institucionais, baremas de avaliação, área administrativa e integração com a assistente de IA **Maria**.

> 🎨 **Design System**: Os padrões visuais, tokens de superfície, paleta de cores (*Simcc Intelligence*) e hierarquia tipográfica (`Lexend` / `Inter` / `JetBrains Mono`) estão documentados em [`DESIGN.md`](DESIGN.md).

---

## 🧱 Stack e Arquitetura

- **React 18** + **TypeScript 5** + **Vite 6** + **React Router DOM 6**
- **Tailwind CSS 3** + **Radix UI** (`@radix-ui/*`) + `class-variance-authority` para componentes acessíveis
- **TanStack React Query 5** + **Zustand** + **React Context** (`auth-context`) para gerenciamento de estado servidor e cliente
- **Axios** ([`src/lib/api.ts`](src/lib/api.ts)) com 3 clientes dedicados (`api`, `apiAdmin`, `apiOda`), injeção automática de JWT e fila concorrente de *refresh token*
- **Highcharts**, **Recharts**, **Leaflet / Mapbox GL** para gráficos científicos e mapas georreferenciados

---

## 📁 Estrutura de Diretórios

```text
simcc-front/
├── public/                        # Ativos públicos estáticos
├── src/
│   ├── assets/                    # Logos das universidades baianas (UESC, UFBA, UFRB, UNEB, etc.) e backgrounds
│   ├── components/
│   │   ├── console/               # Painel administrativo e gerenciamento
│   │   ├── docs-api/              # Visualização integrada de documentação da API
│   │   ├── graduate-program/      # Telas e painéis de Programas de Pós-Graduação
│   │   ├── graficos/              # Componentes de visualização (Highcharts / Recharts)
│   │   ├── grupos-pesquisa/       # Diretório e detalhes de Grupos de Pesquisa CNPq
│   │   ├── homepage/              # Busca principal, filtros e resultados V2
│   │   ├── incites/               # Indicadores bibliométricos InCites / Web of Science
│   │   ├── indicators/            # Dashboards de indicadores estaduais e institucionais
│   │   ├── indice-pesquisador/    # Cálculo e exibição de IndProd
│   │   ├── institution/           # Perfis de ICTs e universidades
│   │   ├── maria/                 # Interface de chat integrada com a agente de IA Maria
│   │   ├── modals/                # Modais de perfil de pesquisador, barema e exportação PDF/XLSX
│   │   ├── researcher/            # Página e dossiê completo do pesquisador
│   │   ├── search/                # Barra de busca inteligente, sugestões V2 e facetas
│   │   └── ui/                    # Componentes base Radix UI / Shadcn
│   ├── context/                   # Contextos globais e de autenticação (auth-context.tsx)
│   ├── hooks/                     # Hooks React Query (use-researcher-search, use-production-search, use-academic, etc.)
│   ├── layout/                    # Layouts base (default-layout, search-layout, docs-layout)
│   ├── lib/                       # Instâncias Axios (api.ts), storage de auth e utilitários
│   ├── pages/                     # Páginas de rota (About, AuthCallback, Tv)
│   ├── services/                  # Clientes de domínio (researchers-v2.ts, productions-v2.ts, suggestions-v2.ts, auth.ts, academic.ts)
│   ├── types/                     # Contratos TypeScript (researcher-v2.ts, production-v2.ts, academic.ts, auth.ts)
│   ├── App.tsx                    # Configuração de rotas e provedores
│   └── main.tsx                   # Ponto de entrada da aplicação
├── DESIGN.md                      # Especificação do Design System
├── Dockerfile                     # Build containerizado
├── compose.yaml                   # Configuração Docker Compose
└── package.json
```

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 20+ e `npm`

### 1. Instalação
```bash
npm install
```

### 2. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
A aplicação ficará disponível em `http://localhost:5173`.

### 3. Build de Produção
```bash
npm run build
```

---

## ⚙️ Configuração (`.env`)

Principais variáveis de ambiente lidas via `import.meta.env`:

| Variável | Descrição | Exemplo (Dev Local) |
| :--- | :--- | :--- |
| `VITE_URL_GERAL` | URL base da API pública de consultas acadêmicas (`simcc-back`) | `http://localhost:8000/` |
| `VITE_URL_ADMIN` | URL base da API administrativa e de autenticação (`simcc-admin`) | `http://localhost:8009/` |
| `VITE_URL_GERAL2` | URL base da API secundária ODA (opcional) | `""` |
| `VITE_GA4_PROPERTY_ID` | ID da propriedade Google Analytics 4 (opcional) | `""` |
| `VITE_URL_SITE` | URL canônica do site (opcional) | `http://localhost:5173` |

---

## 🧪 Qualidade e Scripts (`package.json`)

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite |
| `npm run build` | Executa a checagem de tipos (`tsc`) e gera o bundle de produção (`vite build`) |
| `npm run lint` | Executa o ESLint em arquivos `.js`, `.jsx`, `.ts`, `.tsx` (`--max-warnings 0`) |
| `npm run lint:fix` | Corrige problemas automáticos de lint |
| `npm run format` | Formata o código com Prettier |
| `npm run preview` | Pré-visualiza o build de produção localmente |
