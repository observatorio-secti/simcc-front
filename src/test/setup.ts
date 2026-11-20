import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, vi } from 'vitest';
import { server } from './msw/server';
import { TEST_SIMCC_API_URL } from './msw/simcc';

// A CI não tem .env: a URL da API vem daqui, a mesma dos handlers. Este
// arquivo não importa `@/config/env` nem `@/api/simcc`, para que testes que
// trocam a variável antes de importá-los (ex.: src/api/simcc.test.ts) continuem
// valendo.
vi.stubEnv('VITE_SIMCC_API_URL', TEST_SIMCC_API_URL);

// No topo, e não em `beforeAll`: o `openapi-fetch` guarda `globalThis.fetch` ao
// criar o cliente, e `src/api/simcc.ts` cria o cliente ao ser importado (antes
// de qualquer `beforeAll` do arquivo de teste). Ligado aqui, o `fetch` guardado
// já é o interceptado.
server.listen({ onUnhandledRequest: 'error' });

// O jsdom não implementa `scrollTo`, que o router chama a cada navegação.
// (Há testes em ambiente `node`, sem `window`.)
if (typeof window !== 'undefined') window.scrollTo = () => {};

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
