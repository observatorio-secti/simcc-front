import { Copy, MoreHorizontal, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  normalizeOrcid,
  type ResearcherDetail,
} from '@/entities/researcher/model';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error(`Não foi possível copiar ${label.toLowerCase()}`);
  }
}

export interface ResearcherProfileActionsProps {
  researcher: ResearcherDetail;
}

/**
 * Ações rápidas do perfil do pesquisador: compartilhar link e menu de cópia
 * de identificadores (ORCID / ID Lattes).
 */
export function ResearcherProfileActions({
  researcher,
}: ResearcherProfileActionsProps) {
  const orcid = normalizeOrcid(researcher.identifiers.orcid);
  const lattesId = researcher.identifiers.lattes_id?.trim() || null;

  return (
    <>
      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        aria-label="Copiar link do perfil"
        onClick={() => void copyText(window.location.href, 'Link do perfil')}
      >
        <Share2 aria-hidden />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label="Mais ações"
          >
            <MoreHorizontal aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() =>
              void copyText(window.location.href, 'Link do perfil')
            }
          >
            <Copy className="size-4" aria-hidden />
            Copiar link do perfil
          </DropdownMenuItem>
          {orcid && (
            <DropdownMenuItem onClick={() => void copyText(orcid, 'ORCID')}>
              <Copy className="size-4" aria-hidden />
              Copiar ORCID
            </DropdownMenuItem>
          )}
          {lattesId && (
            <DropdownMenuItem
              onClick={() => void copyText(lattesId, 'ID Lattes')}
            >
              <Copy className="size-4" aria-hidden />
              Copiar ID Lattes
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
