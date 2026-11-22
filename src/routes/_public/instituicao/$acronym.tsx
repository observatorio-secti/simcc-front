import { createFileRoute } from '@tanstack/react-router';
import { redirectLegacyInstitution } from '../../-redirects/institution-redirect';

/** `/instituicao/:acronym` do legado (V2): sigla → `/instituicoes/$id`. */
export const Route = createFileRoute('/_public/instituicao/$acronym')({
  beforeLoad: ({ context, location, params }) =>
    redirectLegacyInstitution({
      queryClient: context.queryClient,
      location,
      acronym: params.acronym,
    }),
});
