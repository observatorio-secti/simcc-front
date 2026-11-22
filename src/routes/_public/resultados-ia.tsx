import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * `/resultados-ia` do legado (MarIA, V2). A rota nova `/maria` é da T10 e
 * ainda não está na `develop`: por ora, vai para a home. Quando a T10 entrar,
 * o destino passa a ser `/maria`. Os parâmetros são descartados.
 */
export const Route = createFileRoute('/_public/resultados-ia')({
  beforeLoad: () => {
    throw redirect({ to: '/', replace: true });
  },
});
