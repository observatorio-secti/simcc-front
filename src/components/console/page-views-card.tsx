import { useState } from 'react';
import { useAnalyticsPages } from '../../hooks/use-analytics';
import type { AnalyticsSystem } from '../../services/analytics';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const PAGE_SIZE = 15;
const SYSTEM_LABELS = { simcc: 'SimCC', ictite: 'ICTite', licuri: 'Licuri' };

export function PageViewsCard() {
  const [system, setSystem] = useState<AnalyticsSystem>('simcc');
  const [page, setPage] = useState(0);
  const offset = page * PAGE_SIZE;
  const { data, isPending, isError, refetch } = useAnalyticsPages(
    system,
    PAGE_SIZE,
    offset,
  );
  const hasNextPage = data ? offset + PAGE_SIZE < data.total : false;

  return (
    <Card>
      <CardHeader className="gap-4 space-y-0 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5">
          <CardTitle>Páginas mais acessadas</CardTitle>
          <CardDescription>
            Visualizações por caminho nos últimos 30 dias.
          </CardDescription>
        </div>
        <div className="space-y-1.5 sm:w-44">
          <label htmlFor="analytics-system" className="text-sm font-medium">
            Sistema
          </label>
          <Select
            value={system}
            onValueChange={(value) => {
              setSystem(value as AnalyticsSystem);
              setPage(0);
            }}
          >
            <SelectTrigger id="analytics-system">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SYSTEM_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isPending && (
          <p role="status" className="text-sm text-muted-foreground">
            Carregando visualizações por página…
          </p>
        )}
        {isError && (
          <div className="flex flex-wrap items-center gap-3">
            <p role="alert" className="text-sm text-muted-foreground">
              Não foi possível carregar as visualizações por página.
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </div>
        )}
        {data && (
          <Table
            aria-label={'Visualizações por página · ' + SYSTEM_LABELS[system]}
          >
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Página</TableHead>
                <TableHead scope="col" className="text-right">
                  Visualizações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map(({ page_path, page_views }) => (
                <TableRow key={page_path}>
                  <TableCell className="break-all font-mono">
                    {page_path}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {page_views.toLocaleString('pt-BR')}
                  </TableCell>
                </TableRow>
              ))}
              {data.data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground">
                    Nenhuma visualização registrada para {SYSTEM_LABELS[system]}{' '}
                    no período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
        {(page > 0 || hasNextPage) && (
          <nav
            aria-label="Paginação de visualizações por página"
            className="mt-4 flex flex-wrap items-center justify-end gap-3"
          >
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasNextPage}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </nav>
        )}
      </CardContent>
    </Card>
  );
}
