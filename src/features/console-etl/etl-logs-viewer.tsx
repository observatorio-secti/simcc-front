import { useMemo, useState, type FormEvent } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '@/api/admin';
import { unwrap } from '@/api/simcc';
import {
  etlLogLevel,
  formatEtlLogLineText,
  formatShortRunId,
  parseEtlLogLine,
  type EtlRunDetailSearch,
} from '@/entities/etl/model';
import { etlKeys } from '@/entities/etl/queries';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { SectionError } from '@/shared/ui/section-error';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

const LOGS_PAGE_SIZE = 100;
const LOGS_POLL_MS = 4_000;

export interface EtlLogsViewerProps {
  runId: string;
  isActive: boolean;
  level: EtlRunDetailSearch['level'];
  q?: string;
  onFilterChange: (patch: Partial<EtlRunDetailSearch>) => void;
}

function formatLogTime(timestamp?: string): string {
  if (!timestamp) return '';
  const time = Date.parse(timestamp);
  if (Number.isNaN(time)) return timestamp;
  return new Date(time).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/** Visualizador de logs paginados via `GET /etl/runs/{run_id}/logs`. */
export function EtlLogsViewer({
  runId,
  isActive,
  level,
  q,
  onFilterChange,
}: EtlLogsViewerProps) {
  const [searchInput, setSearchInput] = useState(q ?? '');
  const [prevQ, setPrevQ] = useState(q);
  if (prevQ !== q) {
    setPrevQ(q);
    setSearchInput(q ?? '');
  }

  const [copied, setCopied] = useState(false);

  const query = useInfiniteQuery({
    queryKey: [...etlKeys.logs(runId), 'infinite'] as const,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      unwrap(
        adminApi().GET('/etl/runs/{run_id}/logs', {
          params: {
            path: { run_id: runId },
            query: { offset: pageParam, limit: LOGS_PAGE_SIZE },
          },
          signal,
        }),
      ),
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.lines.length > 0 && lastPage.next_offset > lastPageParam) {
        return lastPage.next_offset;
      }
      return undefined;
    },
    refetchInterval: isActive ? LOGS_POLL_MS : false,
    enabled: runId.length > 0,
  });

  const allLines = useMemo(() => {
    if (!query.data) return [];
    return query.data.pages.flatMap((page) =>
      page.lines.map((raw) => parseEtlLogLine(raw)),
    );
  }, [query.data]);

  const filteredLines = useMemo(() => {
    const queryText = q?.toLowerCase();
    return allLines.filter((line) => {
      if (level !== 'all' && etlLogLevel(line) !== level) {
        return false;
      }
      if (queryText) {
        const haystack = `${line.routine ?? ''} ${line.event ?? ''} ${
          line.message ?? ''
        } ${JSON.stringify(line.raw)}`.toLowerCase();
        if (!haystack.includes(queryText)) return false;
      }
      return true;
    });
  }, [allLines, level, q]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onFilterChange({ q: searchInput.trim() || undefined });
  }

  function handleClearSearch() {
    setSearchInput('');
    if (q) onFilterChange({ q: undefined });
  }

  async function handleCopy() {
    try {
      const text = filteredLines.map(formatEtlLogLineText).join('\n');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Logs copiados para a área de transferência.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar os logs.');
    }
  }

  function handleDownloadJsonl() {
    const content = filteredLines
      .map((line) => JSON.stringify(line.raw))
      .join('\n');
    const blob = new Blob([content], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `etl-${formatShortRunId(runId).slice(1)}-logs.jsonl`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">
            Logs da execução ({filteredLines.length}
            {allLines.length !== filteredLines.length
              ? ` de ${allLines.length}`
              : ''}
            )
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
            >
              <RefreshCw
                className={cn(query.isFetching && 'animate-spin')}
                aria-hidden
              />
              Atualizar
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
              disabled={filteredLines.length === 0}
            >
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied ? 'Copiado' : 'Copiar logs'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadJsonl}
              disabled={filteredLines.length === 0}
            >
              <Download aria-hidden />
              Baixar .jsonl
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={level}
            onValueChange={(value) =>
              onFilterChange({
                level: value as EtlRunDetailSearch['level'],
              })
            }
          >
            <SelectTrigger
              aria-label="Filtrar nível de log"
              className="w-40 bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              <SelectItem value="error">Apenas erros</SelectItem>
              <SelectItem value="warning">Apenas avisos</SelectItem>
            </SelectContent>
          </Select>

          <form
            role="search"
            aria-label="Buscar nos logs"
            onSubmit={handleSearchSubmit}
            className="flex min-w-60 flex-1 items-center gap-2"
          >
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Filtrar por texto ou rotina"
                aria-label="Filtrar logs por texto ou rotina"
                className="pl-8"
              />
            </div>
            {searchInput && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleClearSearch}
                aria-label="Limpar filtro de logs"
              >
                <X className="size-4" aria-hidden />
              </Button>
            )}
            <Button type="submit" size="sm" variant="secondary">
              Filtrar
            </Button>
          </form>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {query.isPending ? (
          <LoadingBlock
            title="Carregando logs..."
            caption="Consultando a API de admin"
          />
        ) : query.isError ? (
          <SectionError
            title="Não foi possível carregar os logs"
            error={query.error}
            onRetry={() => void query.refetch()}
          />
        ) : filteredLines.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={
              allLines.length === 0
                ? 'Nenhum log disponível'
                : 'Nenhum log corresponde aos filtros'
            }
            description={
              allLines.length === 0
                ? 'Os registros de log aparecem aqui conforme a execução avança.'
                : 'Ajuste o nível ou o termo de busca para ver mais registros.'
            }
            className="py-8"
          />
        ) : (
          <div
            role="log"
            aria-label="Linhas de log da execução"
            className="max-h-96 overflow-y-auto rounded-md border bg-muted/30 p-3 font-mono text-xs"
          >
            <div className="flex flex-col gap-1.5">
              {filteredLines.map((line, index) => {
                const lvl = etlLogLevel(line);
                const body =
                  line.message ?? line.event ?? JSON.stringify(line.raw);
                return (
                  <div
                    key={`${line.timestamp ?? 'line'}-${index}`}
                    className={cn(
                      'flex flex-wrap items-baseline gap-2 rounded-sm px-2 py-1',
                      lvl === 'error' && 'bg-destructive/10 text-destructive',
                      lvl === 'warning' && 'bg-amber-500/10 text-foreground',
                    )}
                  >
                    {line.timestamp && (
                      <span className="shrink-0 text-muted-foreground tabular-nums">
                        {formatLogTime(line.timestamp)}
                      </span>
                    )}
                    <Badge
                      variant={lvl === 'error' ? 'solid' : 'outline'}
                      size="sm"
                      className={cn(
                        'shrink-0 uppercase',
                        lvl === 'error' && 'bg-destructive text-white',
                      )}
                    >
                      {line.level ?? 'INFO'}
                    </Badge>
                    {line.routine && (
                      <span className="shrink-0 font-semibold text-foreground">
                        [{line.routine}]
                      </span>
                    )}
                    <span className="min-w-0 break-all">{body}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {query.hasNextPage && (
          <div className="flex justify-center pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void query.fetchNextPage()}
              disabled={query.isFetchingNextPage}
            >
              {query.isFetchingNextPage && (
                <Loader2 className="animate-spin" aria-hidden />
              )}
              Carregar mais logs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
