import { Copy, ExternalLink, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { ACCESS_LABELS, type ExternalPanelItem } from './external-panels-data';

export interface ExternalPanelCardProps {
  panel: ExternalPanelItem;
}

/** Card de uma fonte de dados externa com abertura em nova aba e cópia de URL. */
export function ExternalPanelCard({ panel }: ExternalPanelCardProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(panel.url);
      toast.success('Link copiado para a área de transferência', {
        description: panel.title,
      });
    } catch {
      toast.error('Não foi possível copiar o link');
    }
  };

  return (
    <Card className="h-full justify-between transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
      <CardHeader className="gap-1 pb-3">
        <CardTitle className="text-base font-medium">{panel.title}</CardTitle>
        <CardDescription>{panel.source}</CardDescription>
        {panel.access !== 'public' && (
          <CardAction>
            <Tag variant="neutral">
              {panel.access === 'institutional' && <Lock aria-hidden />}
              {ACCESS_LABELS[panel.access]}
            </Tag>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {panel.description}
        </p>
      </CardContent>

      <CardFooter className="justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
        <Button asChild variant="outline" size="sm">
          <a
            href={panel.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Acessar ${panel.title} (abre em nova aba)`}
          >
            <ExternalLink aria-hidden />
            Acessar
          </a>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleCopyLink}
          aria-label={`Copiar link de ${panel.title}`}
          title="Copiar link"
        >
          <Copy aria-hidden />
        </Button>
      </CardFooter>
    </Card>
  );
}
