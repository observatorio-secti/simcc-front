import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * `/resultados-ia` do legado (MarIA, V2) vai para `/maria` (T10), a tela de
 * nova conversa. Os parâmetros são descartados: a conversa do legado não tem
 * equivalente.
 */
export const Route = createFileRoute('/_public/resultados-ia')({
  beforeLoad: () => {
    throw redirect({ to: '/maria', replace: true });
  },
});
