import type { QueryClient } from '@tanstack/react-query';
import { redirect, type ParsedLocation } from '@tanstack/react-router';
import { institutionListQueryOptions } from '@/entities/institution/queries';
import {
  firstParam,
  isUuid,
  legacyInstitutionTab,
  legacyParams,
  matchByAcronymOrName,
} from './legacy-params';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    // Mantém o valor cru, como o legado.
    return value.trim();
  }
}

/**
 * `/instituicao/:acronym?` do legado (V2). O identificador vinha do path,
 * de `?acronym=` ou de `?institution_id=`. UUID vai direto para
 * `/instituicoes/$id`; sigla (ou nome) é resolvida em `/v2/institution?q=`.
 * Sem identificador, vai para a lista; sem correspondência, para a lista
 * filtrada pelo termo. `?pagina=` vira a aba do detalhe quando existe.
 */
export async function redirectLegacyInstitution({
  queryClient,
  location,
  acronym,
}: {
  queryClient: QueryClient;
  location: ParsedLocation;
  acronym?: string;
}): Promise<never> {
  const params = legacyParams(location.search);
  const raw =
    acronym?.trim() || firstParam(params, 'acronym', 'institution_id');
  const identifier = raw ? safeDecode(raw) : undefined;
  const tab = legacyInstitutionTab(firstParam(params, 'pagina'));
  const detailSearch = tab ? { tab } : {};

  if (!identifier) {
    throw redirect({ to: '/instituicoes', search: {}, replace: true });
  }
  if (isUuid(identifier)) {
    throw redirect({
      to: '/instituicoes/$id',
      params: { id: identifier },
      search: detailSearch,
      replace: true,
    });
  }

  const found = await queryClient
    .fetchQuery(institutionListQueryOptions({ q: identifier, per_page: 100 }))
    .then((response) => matchByAcronymOrName(response.data, identifier))
    .catch(() => undefined);

  if (found) {
    throw redirect({
      to: '/instituicoes/$id',
      params: { id: found.id },
      search: detailSearch,
      replace: true,
    });
  }
  throw redirect({
    to: '/instituicoes',
    search: { q: identifier },
    replace: true,
  });
}
