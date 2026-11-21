import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
  BarChart3,
  CalendarRange,
  Clock,
  Layers,
  Search,
  TrendingUp,
  X,
} from 'lucide-react';
import bgIndicadores from '@kit/assets/backgrounds/indicadores.png';
import {
  PRODUCTION_KINDS,
  type ProductionKind,
} from '@/entities/production/model';
import { PRODUCTION_REGISTRY } from '@/entities/production/registry';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { PillAnchor } from '@/shared/ui/pill-link';
import { SectionHeader } from '@/shared/ui/section-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { StatCard } from '@/shared/ui/stat-card';
import {
  AREA_FILTER_OPTIONS,
  PENDING_LEGACY_INDICATORS,
  computeSeriesSummary,
} from './metrics';
import { ProductionSeriesChart } from './production-series-chart';
import { productionMetricQueryOptions } from './queries';
import {
  DEFAULT_INDICATOR_KIND,
  toProductionMetricQuery,
  type IndicatorsSearch,
} from './search-schema';

const ALL_AREAS_VALUE = '__all__';
const OBSERVATORIO_URL = 'https://observatoriocti.secti.ba.gov.br/';

interface IndicatorsPageProps {
  search: IndicatorsSearch;
}

/**
 * Tela pública de Indicadores (`/indicadores`), seguindo o Template B
 * (Landing de seção) e consumindo `/v2/metrics/production/{kind}`.
 */
export function IndicatorsPage({ search }: IndicatorsPageProps) {
  const navigate = useNavigate({ from: '/indicadores' });
  const activeKind = search.kind ?? DEFAULT_INDICATOR_KIND;
  const activeDef = PRODUCTION_REGISTRY[activeKind];

  const [queryInput, setQueryInput] = useState(search.q ?? '');
  const [yearStartInput, setYearStartInput] = useState(
    search.year_start !== undefined ? String(search.year_start) : '',
  );
  const [yearEndInput, setYearEndInput] = useState(
    search.year_end !== undefined ? String(search.year_end) : '',
  );

  const metricQuery = toProductionMetricQuery(search);
  const { data, isLoading, isError, error, refetch } = useQuery(
    productionMetricQueryOptions(activeKind, metricQuery),
  );

  const summary = computeSeriesSummary(data?.data ?? []);
  const hasActiveFilters = Boolean(
    search.q ||
    search.year_start !== undefined ||
    search.year_end !== undefined ||
    search.area,
  );

  const updateSearch = (patch: Partial<IndicatorsSearch>) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    });
  };

  const handleSelectKind = (kind: ProductionKind) => {
    updateSearch({
      kind: kind === DEFAULT_INDICATOR_KIND ? undefined : kind,
    });
  };

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedStart = yearStartInput.trim()
      ? Number(yearStartInput.trim())
      : undefined;
    const parsedEnd = yearEndInput.trim()
      ? Number(yearEndInput.trim())
      : undefined;

    updateSearch({
      q: queryInput.trim() || undefined,
      year_start:
        parsedStart !== undefined && Number.isInteger(parsedStart)
          ? parsedStart
          : undefined,
      year_end:
        parsedEnd !== undefined && Number.isInteger(parsedEnd)
          ? parsedEnd
          : undefined,
    });
  };

  const handleAreaChange = (value: string) => {
    updateSearch({
      area: value === ALL_AREAS_VALUE ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    setQueryInput('');
    setYearStartInput('');
    setYearEndInput('');
    void navigate({
      search: (prev) => ({
        kind: prev.kind,
      }),
    });
  };

  const periodRangeLabel =
    summary.minYear !== null && summary.maxYear !== null
      ? summary.minYear === summary.maxYear
        ? String(summary.minYear)
        : `${summary.minYear} – ${summary.maxYear}`
      : '—';

  const dataAsOfLabel = data?.meta?.data_as_of
    ? `base em ${data.meta.data_as_of}`
    : undefined;

  return (
    <div className="flex flex-col gap-8">
      {/* Template B: Hero à esquerda com sc-mark + fundo ilustrado à direita */}
      <section className="relative isolate flex flex-col gap-4 py-6 md:py-10">
        <img
          src={bgIndicadores}
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 -z-10 h-full w-full object-cover object-right-top opacity-15 select-none lg:w-[62%] lg:opacity-100 dark:opacity-10"
        />

        <PillAnchor
          href={OBSERVATORIO_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Conheça o Observatório de CT&amp;I da Bahia
        </PillAnchor>

        <h1 className="max-w-[800px] text-3xl leading-tight font-bold tracking-tighter md:text-5xl lg:leading-[1.1]">
          Confira as{' '}
          <strong className="rounded-md bg-eng-blue px-3 pb-1.5 font-medium text-white">
            estatísticas
          </strong>{' '}
          de produção do observatório
        </h1>

        <p className="max-w-[750px] text-lg font-light text-foreground">
          Acompanhe a evolução anual das produções científicas, tecnológicas e
          acadêmicas registradas na plataforma.
        </p>

        {/* Atalhos em card por tipo de produção (/v2/metrics/production/{kind}) */}
        <div
          role="group"
          aria-label="Tipos de produção"
          className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5"
        >
          {PRODUCTION_KINDS.map((kind) => {
            const def = PRODUCTION_REGISTRY[kind];
            const Icon = def.icon;
            const isSelected = kind === activeKind;
            return (
              <button
                key={kind}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelectKind(kind)}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-lg border bg-card p-3.5 text-left transition-colors',
                  isSelected
                    ? 'border-eng-blue bg-brand-soft/50 text-foreground dark:bg-neutral-900'
                    : 'border-border hover:border-eng-blue/60 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60',
                )}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <Icon
                    className={cn(
                      'size-5 shrink-0',
                      isSelected ? 'text-eng-blue' : 'text-muted-foreground',
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn('size-2.5 rounded-full', def.color.bg)}
                    aria-hidden
                  />
                </div>
                <span className="text-sm leading-snug font-medium">
                  {def.title}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Filtros da série (estado na URL) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Layers className="size-4 text-muted-foreground" aria-hidden />
            <span>Filtros da série — {activeDef.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleFilterSubmit}
            className="grid gap-3 md:grid-cols-12 md:items-end"
          >
            <div className="flex flex-col gap-1.5 md:col-span-4">
              <label
                htmlFor="indicators-q"
                className="text-xs font-medium text-muted-foreground"
              >
                Termo nos títulos ou palavras-chave
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  id="indicators-q"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ex.: inteligência artificial"
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="indicators-year-start"
                className="text-xs font-medium text-muted-foreground"
              >
                Ano inicial
              </label>
              <Input
                id="indicators-year-start"
                type="number"
                inputMode="numeric"
                min={1900}
                max={2100}
                value={yearStartInput}
                onChange={(e) => setYearStartInput(e.target.value)}
                placeholder="Ex.: 2018"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="indicators-year-end"
                className="text-xs font-medium text-muted-foreground"
              >
                Ano final
              </label>
              <Input
                id="indicators-year-end"
                type="number"
                inputMode="numeric"
                min={1900}
                max={2100}
                value={yearEndInput}
                onChange={(e) => setYearEndInput(e.target.value)}
                placeholder="Ex.: 2024"
              />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label
                htmlFor="indicators-area"
                className="text-xs font-medium text-muted-foreground"
              >
                Grande área
              </label>
              <Select
                value={search.area ?? ALL_AREAS_VALUE}
                onValueChange={handleAreaChange}
              >
                <SelectTrigger id="indicators-area" aria-label="Grande área">
                  <SelectValue placeholder="Todas as áreas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_AREAS_VALUE}>
                    Todas as áreas
                  </SelectItem>
                  {AREA_FILTER_OPTIONS.map((option) => (
                    <SelectItem key={option.key} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:col-span-2 md:justify-end">
              <Button type="submit" size="sm" className="flex-1 md:flex-none">
                Aplicar
              </Button>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <X className="size-4" aria-hidden />
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 3 KPIs do recorte */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title={`Total de ${activeDef.noun[1]}`}
          value={summary.total}
          caption={`${activeDef.noun[1]} contabilizados na série`}
          icon={BarChart3}
          loading={isLoading}
        />
        <StatCard
          title="Ano de pico"
          value={summary.peakYear ?? '—'}
          caption={
            summary.peakYear !== null
              ? `${summary.peakValue.toLocaleString('pt-BR')} ${activeDef.noun[1]} no ano`
              : 'sem registros no período'
          }
          icon={TrendingUp}
          loading={isLoading}
        />
        <StatCard
          title="Período coberto"
          value={periodRangeLabel}
          caption={
            summary.yearsCount > 0
              ? dataAsOfLabel
                ? `${summary.yearsCount} anos na série · ${dataAsOfLabel}`
                : `${summary.yearsCount} anos na série`
              : 'nenhum ano com registros'
          }
          icon={CalendarRange}
          loading={isLoading}
        />
      </div>

      {/* Série anual (gráfico + tabela) */}
      <ProductionSeriesChart
        kind={activeKind}
        summary={summary}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error?.message}
        hasActiveFilters={hasActiveFilters}
        onRetry={() => {
          void refetch();
        }}
        onClearFilters={handleClearFilters}
      />

      {/* Indicadores do legado aguardando novas rotas /v2/metrics/* */}
      <section
        aria-labelledby="pending-indicators-heading"
        className="flex flex-col gap-3"
      >
        <SectionHeader
          id="pending-indicators-heading"
          title="Indicadores aguardando novas rotas na API v2"
          icon={Clock}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {PENDING_LEGACY_INDICATORS.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
                <CardTitle className="text-base font-medium">
                  {item.title}
                </CardTitle>
                <Badge variant="outline" className="shrink-0 font-normal">
                  Aguardando backend
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>{item.description}</p>
                <p className="text-xs">
                  Rota pendente:{' '}
                  <code className="rounded-xs bg-muted px-1.5 py-0.5 text-foreground">
                    {item.missingRoute}
                  </code>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
