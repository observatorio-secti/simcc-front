import { createFileRoute, redirect } from '@tanstack/react-router';

/** `/paines-dados-externos` do legado (grafia antiga, V2) → `/paineis-dados-externos`. */
export const Route = createFileRoute('/_public/paines-dados-externos')({
  beforeLoad: () => {
    throw redirect({ to: '/paineis-dados-externos', replace: true });
  },
});
