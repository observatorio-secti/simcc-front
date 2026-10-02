import { ArrowUpRight } from 'lucide-react';
import { useProductionDetail } from '../../../hooks/use-production-search';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Skeleton } from '../../ui/skeleton';
import { plainSnippet } from './highlighted-text';
import { PlatformAuthors } from './production-card';
import { ProductionDefinition } from './production-registry';

interface ProductionDetailDialogProps {
  definition: ProductionDefinition;
  /** Item da listagem: exibido de imediato enquanto o detalhe carrega. */
  item: any | null;
  onClose: () => void;
}

export function ProductionDetailDialog({
  definition,
  item,
  onClose,
}: ProductionDetailDialogProps) {
  const { data, isLoading, isError } = useProductionDetail(
    definition.kind,
    item?.id,
  );

  const rows = data
    ? definition
        .details(data)
        .filter(
          (row) =>
            row.value !== null && row.value !== undefined && row.value !== '',
        )
    : [];

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        {item && (
          <>
            <DialogHeader>
              <DialogDescription>
                {definition.noun[0].charAt(0).toUpperCase() +
                  definition.noun[0].slice(1)}
                {item.year ? ` · ${item.year}` : ''}
              </DialogDescription>
              <DialogTitle className="text-lg leading-snug">
                {plainSnippet(item.title)}
              </DialogTitle>
            </DialogHeader>

            {item.platform_authors.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Pesquisadores da plataforma
                </p>
                <PlatformAuthors authors={item.platform_authors} />
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : isError ? (
              <p className="text-sm text-muted-foreground">
                Não foi possível carregar os detalhes. Tente novamente em
                instantes.
              </p>
            ) : (
              <dl className="flex flex-col gap-3">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="break-words text-sm">
                      {row.href ? (
                        <a
                          href={row.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-eng-blue hover:underline"
                        >
                          {row.value}
                          <ArrowUpRight size={12} className="shrink-0" />
                        </a>
                      ) : typeof row.value === 'number' ? (
                        row.value.toLocaleString('pt-BR')
                      ) : (
                        plainSnippet(String(row.value))
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
