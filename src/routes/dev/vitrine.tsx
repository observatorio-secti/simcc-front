import { lazy } from 'react';
import { createFileRoute, notFound } from '@tanstack/react-router';

// Vitrine dos primitivos do kit, só para desenvolvimento (revisão visual).
//
// Fora do `npm run dev` a rota responde 404 (`beforeLoad`) e a página nem entra
// no build: `import.meta.env.DEV` vira `false` e o ramo com o `import()` é
// descartado, junto com tudo o que só a vitrine usa. Os arquivos em `-vitrine/`
// são ignorados pelo gerador de rotas (prefixo `-`).

const VitrinePage = import.meta.env.DEV
  ? lazy(() =>
      import('./-vitrine/vitrine-page').then((module) => ({
        default: module.VitrinePage,
      })),
    )
  : () => null;

export const Route = createFileRoute('/dev/vitrine')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound();
  },
  component: VitrinePage,
});
