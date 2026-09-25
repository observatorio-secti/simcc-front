import { useMemo, useState } from 'react';
import { MagnifyingGlass, Trash } from 'phosphor-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../ui/accordion';
import { Alert } from '../../../../ui/alert';
import { Button } from '../../../../ui/button';
import { Checkbox } from '../../../../ui/checkbox';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { Skeleton } from '../../../../ui/skeleton';
import { cn } from '../../../../../lib/utils';
import { FacetsV2, FacetV2 } from '../../../../../types/researcher-v2';
import {
  EXPANDED_FACET_LIMIT,
  ProfileSearchState,
} from '../hooks/use-profile-search-state';
import {
  FACET_DEFINITIONS,
  FacetDefinition,
  getFacetLabel,
} from './facet-registry';

interface FacetSectionsProps {
  facets: FacetsV2 | null | undefined;
  state: ProfileSearchState;
  loading: boolean;
}

const normalize = (value: string) =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function FacetSections({ facets, state, loading }: FacetSectionsProps) {
  const definitions = FACET_DEFINITIONS.filter(
    (definition) =>
      definition.placement === 'sidebar' &&
      definition.filter.kind !== 'none' &&
      (state.hasQuery || !definition.requiresQuery),
  );

  return (
    <Accordion
      type="multiple"
      // Seções começam recolhidas; só abrem as que já têm filtro aplicado.
      defaultValue={definitions
        .filter((definition) => state.isFacetActive(definition))
        .map((definition) => definition.key)}
      className="w-full"
    >
      {definitions.map((definition) => {
        const facet = facets?.[definition.key];

        return (
          <AccordionItem key={definition.key} value={definition.key}>
            <div className="flex items-center justify-between">
              <Label>{definition.title}</Label>
              <div className="flex gap-2 items-center">
                {state.isFacetActive(definition) && (
                  <Button
                    onClick={() => state.clearFacet(definition)}
                    className="lg:h-8 lg:w-8"
                    variant={'destructive'}
                    size={'icon'}
                  >
                    <Trash size={16} />
                  </Button>
                )}
                <AccordionTrigger />
              </div>
            </div>
            <AccordionContent>
              {!facet ? (
                loading ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Skeleton key={index} className="h-6 w-full rounded-md" />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhum valor disponível.
                  </p>
                )
              ) : definition.filter.kind === 'multi' ? (
                <MultiFacet
                  definition={definition}
                  param={definition.filter.param}
                  facet={facet}
                  state={state}
                />
              ) : definition.filter.kind === 'range' ? (
                <RangeFacet
                  startParam={definition.filter.startParam}
                  endParam={definition.filter.endParam}
                  facet={facet}
                  state={state}
                />
              ) : null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

interface MultiFacetProps {
  definition: FacetDefinition;
  param: string;
  facet: FacetV2;
  state: ProfileSearchState;
}

function MultiFacet({ definition, param, facet, state }: MultiFacetProps) {
  const [search, setSearch] = useState('');
  const selected = state.getMulti(param);

  const items = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return facet.items;
    return facet.items.filter(
      (item) =>
        normalize(item.label).includes(term) ||
        normalize(item.acronym ?? '').includes(term),
    );
  }, [facet.items, search]);

  // `total` não conta valores com count 0 (que só voltam por estarem selecionados).
  const shownWithResults = facet.items.filter((item) => item.count > 0).length;
  const canExpand =
    facet.total > shownWithResults && state.facetLimit < EXPANDED_FACET_LIMIT;

  return (
    <div className="flex flex-col gap-3">
      {definition.searchable && facet.items.length > 8 && (
        <Alert className="h-10 p-2 flex items-center justify-between w-full">
          <div className="flex items-center gap-2 w-full flex-1">
            <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
            <Input
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              type="text"
              placeholder="Buscar..."
              className="border-0 w-full h-8"
            />
          </div>
        </Alert>
      )}

      <div className="flex flex-col gap-1">
        {items.map((item) => {
          const checked = item.selected || selected.includes(item.value);
          const id = `facet-${definition.key}-${item.value}`;
          return (
            <label
              key={item.value}
              htmlFor={id}
              title={item.label}
              className={cn(
                'flex items-start gap-3 rounded-md px-2 py-1.5 text-sm cursor-pointer transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
                item.count === 0 && 'opacity-60',
              )}
            >
              <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={() => state.toggleMulti(param, item.value)}
                className="mt-0.5"
              />
              <span className="flex-1 min-w-0 break-words leading-5">
                {getFacetLabel(definition, item)}
              </span>
              <span className="shrink-0 rounded-full bg-[#719CB8]/15 px-2 text-xs font-medium leading-5 text-eng-dark-blue dark:text-eng-blue">
                {item.count.toLocaleString('pt-BR')}
              </span>
            </label>
          );
        })}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground px-2">
            Nenhum resultado para “{search}”.
          </p>
        )}
      </div>

      {canExpand && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => state.setFacetLimit(EXPANDED_FACET_LIMIT)}
        >
          Ver todas ({facet.total})
        </Button>
      )}
    </div>
  );
}

interface RangeFacetProps {
  startParam: string;
  endParam: string;
  facet: FacetV2;
  state: ProfileSearchState;
}

function RangeFacet({ startParam, endParam, facet, state }: RangeFacetProps) {
  const { start, end } = state.getRange(startParam, endParam);

  // Histograma em ordem cronológica (a API ordena por contagem).
  const bars = useMemo(
    () =>
      facet.items
        .map((item) => ({ year: Number(item.value), count: item.count }))
        .filter((bar) => Number.isInteger(bar.year))
        .sort((a, b) => a.year - b.year),
    [facet.items],
  );
  const maxCount = Math.max(1, ...bars.map((bar) => bar.count));

  const inRange = (year: number) =>
    (start === null || year >= start) && (end === null || year <= end);
  const hasRange = start !== null || end !== null;

  // Primeiro clique escolhe um ano; o segundo estende até o ano clicado.
  const handleBarClick = (year: number) => {
    if (start !== null && end !== null && start === end && year !== start) {
      state.setRange(startParam, endParam, start, year);
    } else {
      state.setRange(startParam, endParam, year, year);
    }
  };

  const parseInput = (value: string) => {
    const year = Number(value);
    return value && Number.isInteger(year) ? year : null;
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">De</Label>
          <Input
            key={`start-${start}`}
            type="number"
            inputMode="numeric"
            placeholder="Início"
            defaultValue={start ?? ''}
            onBlur={(e) =>
              state.setRange(
                startParam,
                endParam,
                parseInput(e.target.value),
                end,
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Até</Label>
          <Input
            key={`end-${end}`}
            type="number"
            inputMode="numeric"
            placeholder="Fim"
            defaultValue={end ?? ''}
            onBlur={(e) =>
              state.setRange(
                startParam,
                endParam,
                start,
                parseInput(e.target.value),
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
          />
        </div>
      </div>

      {bars.length > 0 && (
        <div>
          <div className="flex items-end gap-px h-20" role="list">
            {bars.map((bar) => (
              <button
                key={bar.year}
                type="button"
                role="listitem"
                title={`${bar.year}: ${bar.count.toLocaleString('pt-BR')} pesquisadores`}
                onClick={() => handleBarClick(bar.year)}
                className={cn(
                  'flex-1 min-w-[3px] rounded-t-sm transition-colors',
                  hasRange && !inRange(bar.year)
                    ? 'bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                    : 'bg-eng-blue hover:bg-eng-dark-blue',
                )}
                style={{
                  height: `${Math.max(4, (bar.count / maxCount) * 100)}%`,
                }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{bars[0].year}</span>
            <span>{bars[bars.length - 1].year}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Clique em um ano para filtrar; clique em outro para formar um
            intervalo.
          </p>
        </div>
      )}
    </div>
  );
}
