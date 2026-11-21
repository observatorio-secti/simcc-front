import { setupServer } from 'msw/node';
import { simccHandlers } from './handlers';

export const server = setupServer(...simccHandlers);
