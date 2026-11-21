export type BreadcrumbSegment = {
  href: string;
  label: string;
};

export type RouteMatchSummary = {
  routeId: string;
  pathname: string;
  staticData?: {
    crumb?: string;
  };
};

const HOME_SEGMENT: BreadcrumbSegment = {
  href: '/',
  label: 'Página inicial',
};

/**
 * Monta os segmentos do breadcrumb apenas a partir de `staticData.crumb`,
 * garantindo início em "Página inicial" sem nunca expor o slug cru da URL.
 */
export function buildBreadcrumbs(
  matches: readonly RouteMatchSummary[],
): BreadcrumbSegment[] {
  const segments: BreadcrumbSegment[] = [];

  for (const match of matches) {
    const label = match.staticData?.crumb?.trim();
    if (!label) continue;

    const href = match.routeId === '/_public' ? '/' : match.pathname || '/';
    const previous = segments[segments.length - 1];
    if (previous && previous.href === href) continue;

    segments.push({ href, label });
  }

  if (segments.length === 0 || segments[0]?.href !== '/') {
    segments.unshift(HOME_SEGMENT);
  }

  return segments;
}
