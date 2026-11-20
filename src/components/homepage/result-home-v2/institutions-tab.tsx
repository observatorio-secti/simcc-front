import { Building2 } from 'lucide-react';
import { Alert } from '../../ui/alert';
import { CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { FacetV2 } from '../../../types/researcher-v2';
import { HeaderResultTypeHome } from '../categorias/header-result-type-home';

interface InstitutionsTabProps {
  /** Facet `institution` da busca de pesquisadores. */
  facet: FacetV2 | undefined;
  loading: boolean;
  error: boolean;
  selected: string[];
  onToggle: (institutionId: string) => void;
}

// Instituições do resultado, pela contagem de pesquisadores que a API devolve
// no facet `institution`. Clicar em uma instituição aplica o filtro.
export function InstitutionsTab({
  facet,
  loading,
  error,
  selected,
  onToggle,
}: InstitutionsTabProps) {
  const items = facet?.items ?? [];
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="flex flex-col gap-4 pt-4">
      <Alert className="p-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de instituições
          </CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-2xl font-bold text-muted-foreground">—</div>
          ) : loading || !facet ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {facet.total.toLocaleString('pt-BR')}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            com pesquisadores no resultado
          </p>
        </CardContent>
      </Alert>

      <HeaderResultTypeHome
        title="Pesquisadores por instituição"
        icon={<Building2 size={24} className="text-gray-400" />}
      />

      {error ? (
        <Alert className="p-6 text-sm">
          Não foi possível carregar as instituições. Tente novamente em
          instantes.
        </Alert>
      ) : loading || !facet ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma instituição encontrada para esta busca.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const active = selected.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => onToggle(item.value)}
                aria-pressed={active}
                className={`relative overflow-hidden rounded-md border px-4 py-3 text-left transition-colors ${
                  active
                    ? 'border-eng-blue'
                    : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600'
                }`}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-[#719CB8]/15"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
                <div className="relative flex items-center justify-between gap-4 text-sm">
                  <span>
                    {item.acronym && (
                      <span className="font-semibold">{item.acronym} · </span>
                    )}
                    {item.label}
                  </span>
                  <span className="shrink-0 font-semibold">
                    {item.count.toLocaleString('pt-BR')}
                  </span>
                </div>
              </button>
            );
          })}
          {facet.total > items.length && (
            <p className="text-xs text-muted-foreground">
              Exibindo as {items.length} instituições com mais pesquisadores, de{' '}
              {facet.total.toLocaleString('pt-BR')}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
