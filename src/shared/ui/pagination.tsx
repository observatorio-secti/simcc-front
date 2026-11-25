import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

/** Metadados de paginação compatíveis com `Pagination` da API v2. */
export interface PaginationMeta {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

interface PaginationBaseProps {
  /** Dispara navegação/atualização da URL com a página escolhida. */
  onPageChange: (page: number) => void;
  /** Opções de itens por página (ex.: `[10, 20, 50, 100]`). */
  perPageOptions?: readonly number[];
  /** Quando informado, exibe o seletor de itens por página. */
  onPerPageChange?: (perPage: number) => void;
  disabled?: boolean;
  /** Oculta o componente quando há no máximo 1 página e sem seletor de `per_page` (padrão: `true`). */
  hideOnSinglePage?: boolean;
  /** Versão enxuta para painéis estreitos (oculta os botões numéricos e textos longos). */
  compact?: boolean;
  className?: string;
}

export type PaginationProps = PaginationBaseProps &
  (
    | {
        pagination: PaginationMeta;
        page?: never;
        totalPages?: never;
        totalItems?: never;
        perPage?: never;
        hasPrev?: never;
        hasNext?: never;
      }
    | {
        pagination?: never;
        page: number;
        totalPages: number;
        totalItems?: number;
        perPage?: number;
        hasPrev?: boolean;
        hasNext?: boolean;
      }
  );

type PageToken = number | 'ellipsis-start' | 'ellipsis-end';

const DEFAULT_PER_PAGE_OPTIONS = [10, 20, 30, 50, 100] as const;
const NUMBER_FORMAT = new Intl.NumberFormat('pt-BR');

function buildPageTokens(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): PageToken[] {
  if (totalPages <= 0) return [];
  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const clampedPage = Math.min(Math.max(1, currentPage), totalPages);
  const leftSibling = Math.max(clampedPage - siblingCount, 1);
  const rightSibling = Math.min(clampedPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < totalPages - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftCount = 3 + siblingCount * 2;
    const leftRange = Array.from(
      { length: leftCount },
      (_, index) => index + 1,
    );
    return [...leftRange, 'ellipsis-end', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightCount = 3 + siblingCount * 2;
    const start = totalPages - rightCount + 1;
    const rightRange = Array.from(
      { length: rightCount },
      (_, index) => start + index,
    );
    return [1, 'ellipsis-start', ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, index) => leftSibling + index,
  );
  return [1, 'ellipsis-start', ...middleRange, 'ellipsis-end', totalPages];
}

/**
 * Controles de paginação do kit (`nav[aria-label="Paginação"]`), aceitando
 * diretamente `pagination` da API v2 ou props explícitas.
 */
export function Pagination({
  pagination,
  page: explicitPage,
  totalPages: explicitTotalPages,
  totalItems: explicitTotalItems,
  perPage: explicitPerPage,
  hasPrev: explicitHasPrev,
  hasNext: explicitHasNext,
  onPageChange,
  perPageOptions = DEFAULT_PER_PAGE_OPTIONS,
  onPerPageChange,
  disabled = false,
  hideOnSinglePage = true,
  compact = false,
  className,
}: PaginationProps) {
  const page = pagination?.page ?? explicitPage ?? 1;
  const totalPages = pagination?.total_pages ?? explicitTotalPages ?? 1;
  const totalItems = pagination?.total_items ?? explicitTotalItems;
  const perPage = pagination?.per_page ?? explicitPerPage;
  const canPrev =
    (pagination?.has_prev ?? explicitHasPrev ?? page > 1) && page > 1;
  const canNext =
    (pagination?.has_next ?? explicitHasNext ?? page < totalPages) &&
    page < totalPages;

  if (hideOnSinglePage && totalPages <= 1 && !onPerPageChange) {
    return null;
  }

  const tokens = buildPageTokens(page, totalPages);

  let summaryText: string | null = null;
  if (totalItems !== undefined) {
    if (totalItems === 0) {
      summaryText = '0 resultados';
    } else if (perPage !== undefined && perPage > 0) {
      const start = Math.min((page - 1) * perPage + 1, totalItems);
      const end = Math.min(page * perPage, totalItems);
      summaryText = `Mostrando ${NUMBER_FORMAT.format(start)}–${NUMBER_FORMAT.format(end)} de ${NUMBER_FORMAT.format(totalItems)}`;
    } else {
      summaryText = `${NUMBER_FORMAT.format(totalItems)} resultados`;
    }
  }

  return (
    <nav
      data-slot="pagination"
      aria-label="Paginação"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground tabular-nums">
        {summaryText && <span>{summaryText}</span>}
        {onPerPageChange && (
          <Select
            value={String(perPage ?? perPageOptions[0] ?? 20)}
            onValueChange={(nextValue) => onPerPageChange(Number(nextValue))}
            disabled={disabled}
          >
            <SelectTrigger
              size="sm"
              aria-label="Itens por página"
              className="w-auto min-w-28"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {perPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {totalPages > 1 && (
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !canPrev}
            onClick={() => onPageChange(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft aria-hidden />
            {!compact && <span className="hidden sm:inline">Anterior</span>}
          </Button>

          {!compact && (
            <div className="hidden items-center gap-1 sm:flex">
              {tokens.map((token) =>
                typeof token === 'number' ? (
                  <Button
                    key={token}
                    type="button"
                    variant={token === page ? 'default' : 'outline'}
                    size="icon-sm"
                    disabled={disabled}
                    onClick={() => {
                      if (token !== page) onPageChange(token);
                    }}
                    aria-label={`Página ${token}`}
                    aria-current={token === page ? 'page' : undefined}
                    className="tabular-nums"
                  >
                    {token}
                  </Button>
                ) : (
                  <span
                    key={token}
                    aria-hidden
                    className="inline-flex size-8 items-center justify-center text-muted-foreground"
                  >
                    <MoreHorizontal className="size-4" />
                  </span>
                ),
              )}
            </div>
          )}

          <span
            className={cn(
              'px-2 text-xs text-muted-foreground tabular-nums',
              !compact && 'sm:hidden',
            )}
          >
            Página {page} de {totalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || !canNext}
            onClick={() => onPageChange(page + 1)}
            aria-label="Próxima página"
          >
            {!compact && <span className="hidden sm:inline">Próxima</span>}
            <ChevronRight aria-hidden />
          </Button>
        </div>
      )}
    </nav>
  );
}
