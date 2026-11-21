import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { server } from './msw/server';

// A CI não tem `.env`: garante uma base válida antes de qualquer teste importar
// `env` / `simcc`, preservando sobrescritas locais via `vi.stubEnv`.
function ensureTestEnv() {
  if (!import.meta.env.VITE_SIMCC_API_URL) {
    vi.stubEnv('VITE_SIMCC_API_URL', 'http://localhost:8088/');
  }
}

// `openapi-fetch` captura `globalThis.fetch` no momento de `createClient(...)`
// (executado ao importar `src/api/simcc.ts`). Precisamos ativar o MSW antes
// que os arquivos de teste importem `simcc` ou `queries.ts`.
let serverListening = false;

function startMswServer() {
  if (serverListening) return;
  server.listen({ onUnhandledRequest: 'error' });
  serverListening = true;
}

function stopMswServer() {
  if (!serverListening) return;
  server.close();
  serverListening = false;
}

ensureTestEnv();
startMswServer();

// O jsdom não implementa `window.scrollTo` e o TanStack Router o chama ao
// concluir transições de rota.
if (typeof window !== 'undefined') {
  window.scrollTo = vi.fn();
}

beforeAll(() => startMswServer());
beforeEach(() => ensureTestEnv());

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => stopMswServer());
