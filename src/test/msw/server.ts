import { setupServer } from 'msw/node';
import { simccHandlers } from './simcc';

/** Servidor MSW dos testes, ligado em `src/test/setup.ts`. */
export const server = setupServer(...simccHandlers);
