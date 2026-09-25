import { ReactNode } from 'react';
import { Building2, GraduationCap, MapPinned, User } from 'lucide-react';
import bg_popup from '../../../../assets/bg_popup.png';
import { Alert } from '../../../ui/alert';
import { CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Skeleton } from '../../../ui/skeleton';
import { FacetsV2 } from '../../../../types/researcher-v2';
import { FACET_DEFINITIONS, getFacetLabel } from './facets/facet-registry';

interface ProfileSummaryCardsProps {
  totalResearchers: number | undefined;
  facets: FacetsV2 | null | undefined;
  /** Facets do mapa (consulta própria), usados no card de territórios. */
  mapFacets: FacetsV2 | null | undefined;
  mapLoading: boolean;
  mapError: boolean;
  terms: { term: string }[];
  loading: boolean;
}

function Counter({
  value,
  loading,
  unavailable,
}: {
  value: number | undefined;
  loading: boolean;
  unavailable?: boolean;
}) {
  if (unavailable) {
    return <div className="text-2xl font-bold text-muted-foreground">—</div>;
  }
  if (loading || value === undefined) {
    return <Skeleton className="h-7 w-20" />;
  }
  return (
    <div className="text-2xl font-bold">{value.toLocaleString('pt-BR')}</div>
  );
}

function StatCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Alert className="p-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Alert>
  );
}

export function ProfileSummaryCards({
  totalResearchers,
  facets,
  mapFacets,
  mapLoading,
  mapError,
  terms,
  loading,
}: ProfileSummaryCardsProps) {
  // Facets informativos (sem filtro) do registro vão para o resumo.
  const summaryFacets = FACET_DEFINITIONS.filter(
    (definition) =>
      definition.placement === 'summary' &&
      facets?.[definition.key]?.items.length,
  );

  return (
    <div className="flex flex-col gap-4 mt-4 md:gap-8">
      <Alert
        className="p-0 bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url(${bg_popup})` }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de pesquisadores
          </CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <Counter value={totalResearchers} loading={loading} />
          <div className="flex items-center gap-3 flex-wrap mt-1">
            <p className="text-xs text-muted-foreground">
              com o perfil relacionado a
            </p>
            {terms.map((valor, index) => (
              <div
                key={index}
                className="flex gap-2 items-center w-fit p-2 px-3 capitalize rounded-md text-xs bg-indigo-500 dark:bg-indigo-500 text-white"
              >
                {valor.term.replace(/[|;]/g, '')}
              </div>
            ))}
          </div>

          {summaryFacets.map((definition) => (
            <div key={definition.key} className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                {definition.title}
              </p>
              <div className="flex flex-wrap gap-2">
                {facets?.[definition.key]?.items.map((item) => (
                  <span
                    key={item.value}
                    className="rounded-full bg-[#719CB8]/15 px-2.5 py-0.5 text-xs text-eng-dark-blue dark:text-eng-blue"
                  >
                    {getFacetLabel(definition, item)}{' '}
                    <span className="font-semibold">
                      {item.count.toLocaleString('pt-BR')}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3 md:gap-8">
        <StatCard
          title="Instituições"
          icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
        >
          <Counter value={facets?.institution?.total} loading={loading} />
          <p className="text-xs text-muted-foreground">
            com pesquisadores no resultado
          </p>
        </StatCard>

        <StatCard
          title="Programas de pós-graduação"
          icon={<GraduationCap className="h-4 w-4 text-muted-foreground" />}
        >
          <Counter value={facets?.graduate_program?.total} loading={loading} />
          <p className="text-xs text-muted-foreground">
            com pesquisadores no resultado
          </p>
        </StatCard>

        <StatCard
          title="Territórios de identidade"
          icon={<MapPinned className="h-4 w-4 text-muted-foreground" />}
        >
          <Counter
            value={mapFacets?.identity_territory?.total}
            loading={mapLoading}
            unavailable={mapError}
          />
          <p className="text-xs text-muted-foreground">
            {mapError
              ? 'dados de território indisponíveis'
              : 'com pesquisadores no resultado'}
          </p>
        </StatCard>
      </div>
    </div>
  );
}
