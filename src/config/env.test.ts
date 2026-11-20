import { describe, expect, it, vi } from 'vitest';

// `env` é calculado ao importar o módulo; o teste usa só `parseEnv`.
vi.stubEnv('VITE_SIMCC_API_URL', 'http://localhost:8000/');
const { parseEnv } = await import('./env');

describe('parseEnv', () => {
  it('exige a URL da API do Simcc', () => {
    expect(() => parseEnv({})).toThrow(/VITE_SIMCC_API_URL/);
  });

  it('acrescenta a barra final nas URLs', () => {
    const env = parseEnv({
      VITE_SIMCC_API_URL: 'https://exemplo.br/simcc/api',
      VITE_IDP_URL: 'https://exemplo.br/idp',
    });
    expect(env.simccApiUrl).toBe('https://exemplo.br/simcc/api/');
    expect(env.idpUrl).toBe('https://exemplo.br/idp/');
  });

  it('trata valor vazio como ausente', () => {
    const env = parseEnv({
      VITE_SIMCC_API_URL: 'http://localhost:8000/',
      VITE_ODA_API_URL: '',
    });
    expect(env.odaApiUrl).toBeUndefined();
  });

  it('recusa URL inválida', () => {
    expect(() => parseEnv({ VITE_SIMCC_API_URL: 'nao-e-url' })).toThrow();
  });
});
