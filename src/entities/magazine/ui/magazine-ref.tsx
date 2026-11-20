import type { ComponentProps } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  formatIssn,
  formatJcr,
  issnPortalUrl,
  type MagazineLike,
} from '../model';
import { JcrMark } from './jcr-mark';
import { QualisMark } from './qualis-mark';

/**
 * Revista: nome (veículo, `font-semibold`) e, abaixo, Qualis, JCR e ISSN em
 * metadado. Aceita a revista do artigo (`MagazineRef`) e o item do catálogo
 * (`Magazine`).
 *
 * Revista não tem rota própria: o único link é externo, o ISSN válido aponta
 * para o portal do ISSN (e o JCR para `jcr_link`, quando a API traz).
 */
export function MagazineRef({
  magazine,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'children'> & {
  magazine: MagazineLike;
}) {
  const issn = formatIssn(magazine.issn);
  const portalUrl = issnPortalUrl(magazine.issn);

  return (
    <div
      data-slot="magazine-ref"
      className={cn('flex min-w-0 flex-col gap-1', className)}
      {...props}
    >
      <p className="text-sm font-semibold break-words">
        {magazine.name?.trim() || 'Revista sem nome'}
      </p>
      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <li>
          <QualisMark
            qualis={magazine.qualis}
            qualis_status={magazine.qualis_status}
            reference_period={magazine.reference_period}
          />
        </li>
        {formatJcr(magazine.jcr) && (
          <li>
            <JcrMark jcr={magazine.jcr} jcr_link={magazine.jcr_link} />
          </li>
        )}
        {issn && (
          <li>
            {portalUrl ? (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex items-center gap-1 rounded-xs underline-offset-2 transition-colors hover:text-foreground hover:underline',
                  focusRing,
                )}
              >
                ISSN <span className="tabular-nums">{issn}</span>
                <ExternalLink className="size-3 shrink-0" aria-hidden />
                <span className="sr-only">
                  (portal do ISSN, abre em nova aba)
                </span>
              </a>
            ) : (
              <span>
                ISSN <span className="tabular-nums">{issn}</span>
              </span>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}
