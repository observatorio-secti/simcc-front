import { createFileRoute } from '@tanstack/react-router';
import { redirectLegacyInstitution } from '../../-redirects/institution-redirect';

/** `/instituicao` do legado (V2), com `?acronym=` ou `?institution_id=`. */
export const Route = createFileRoute('/_public/instituicao/')({
  beforeLoad: ({ context, location }) =>
    redirectLegacyInstitution({
      queryClient: context.queryClient,
      location,
    }),
});
