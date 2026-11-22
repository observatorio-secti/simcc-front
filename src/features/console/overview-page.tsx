import type { ReactNode } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  ArrowRight,
  Building2,
  Layers,
  RefreshCw,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { academicCountQueryOptions } from '@/entities/academic/queries';
import { adminCountQueryOptions } from '@/entities/admin/queries';
import {
  etlRunDurationMs,
  etlRunScopeLabel,
  formatDuration,
  isEtlRunActive,
  type EtlRun,
} from '@/entities/etl/model';
import { latestEtlRunQueryOptions } from '@/entities/etl/queries';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatCard } from '@/shared/ui/stat-card';
import { formatDateTime } from './format';
import { RunStatusBadge } from './run-status-badge';
import { SectionError } from './section-error';

/** Enquanto o último run está ativo, a visão geral consulta de novo. */
const ACTIVE_RUN_POLL_MS = 10_000;

function RunFact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{children}</dd>
    </div>
  );
}

function LatestRunDetails({ run }: { run: EtlRun }) {
  const active = isEtlRunActive(run.status);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <RunStatusBadge status={run.status} />
        {active && run.current_routine && (
          <span className="text-xs text-muted-foreground">
            Rotina atual: {run.current_routine}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <RunFact label="Início">{formatDateTime(run.started_at)}</RunFact>
        <RunFact label={active ? 'Em execução há' : 'Duração'}>
          {formatDuration(etlRunDurationMs(run))}
        </RunFact>
        <RunFact label="Escopo">{etlRunScopeLabel(run)}</RunFact>
        <RunFact label="Disparado por">
          <span title={run.triggered_by}>{run.triggered_by || '—'}</span>
        </RunFact>
      </dl>
      {run.error_message && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm break-words">
          {run.error_message}
        </p>
      )}
    </div>
  );
}

function LatestRunCard() {
  const query = useQuery({
    ...latestEtlRunQueryOptions(),
    refetchInterval: (q) =>
      isEtlRunActive(q.state.data?.data[0]?.status)
        ? ACTIVE_RUN_POLL_MS
        : false,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <CardTitle className="text-base">Última sincronização</CardTitle>
        <RefreshCw
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </CardHeader>
      <CardContent aria-busy={query.isPending || undefined}>
        {query.isPending ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-10 w-full" />
            <span className="sr-only">Carregando</span>
          </div>
        ) : query.isError ? (
          <SectionError
            title="Não foi possível consultar a sincronização"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : query.data ? (
          <LatestRunDetails run={query.data} />
        ) : (
          <EmptyState
            icon={RefreshCw}
            title="Nenhuma sincronização registrada"
            description="Quando o ETL rodar pela primeira vez, o resultado aparece aqui."
            className="py-6"
          />
        )}
      </CardContent>
    </Card>
  );
}

function CountCard({
  title,
  caption,
  icon,
  query,
  action,
}: {
  title: string;
  caption: string;
  icon: LucideIcon;
  query: UseQueryResult<number>;
  action?: ReactNode;
}) {
  return (
    <StatCard
      title={title}
      icon={icon}
      loading={query.isPending}
      value={query.data}
      caption={query.isError ? 'Não foi possível carregar' : caption}
    >
      {query.isError && (
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto px-0"
          onClick={() => void query.refetch()}
        >
          Tentar novamente
        </Button>
      )}
      {!query.isError && action}
    </StatCard>
  );
}

/** Visão geral do console (`/console`): último run do ETL e totais do cadastro. */
export function ConsoleOverviewPage() {
  const institutions = useQuery(academicCountQueryOptions.institutions());
  const researchers = useQuery(academicCountQueryOptions.researchers());
  const collections = useQuery(academicCountQueryOptions.collections());
  const admins = useQuery(adminCountQueryOptions());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Visão geral</h1>
        <p className="text-sm text-muted-foreground">
          Situação do cadastro acadêmico e da última sincronização com o Lattes.
        </p>
      </div>

      <LatestRunCard />

      <section aria-labelledby="console-totals" className="flex flex-col gap-3">
        <h2 id="console-totals" className="text-base font-medium">
          Cadastro
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CountCard
            title="Instituições"
            caption="cadastradas no console"
            icon={Building2}
            query={institutions}
          />
          <CountCard
            title="Pesquisadores"
            caption="cadastrados no console"
            icon={Users}
            query={researchers}
          />
          <CountCard
            title="Coleções"
            caption="agrupamentos de pesquisadores"
            icon={Layers}
            query={collections}
          />
          <CountCard
            title="Administradores"
            caption="com acesso ao console"
            icon={ShieldCheck}
            query={admins}
            action={
              <Button
                asChild
                variant="link"
                size="sm"
                className="mt-1 h-auto px-0"
              >
                <Link to="/console/admins">
                  Gerenciar
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}
