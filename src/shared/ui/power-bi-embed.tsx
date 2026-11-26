import { AlertTriangle, Maximize2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';
import { Card, CardContent } from './card';

export interface PowerBiEmbedProps {
  /** URL "publicar na web" (`app.powerbi.com/view?r=…`) embutida no iframe. */
  src: string;
  /** Nome do painel: vira o `title` do iframe e o texto do card. */
  title: string;
  /** Link de "Abrir em tela cheia"; o padrão é o próprio `src`. */
  href?: string;
  /** Texto do card mostrado em telas estreitas (e quando indisponível). */
  description?: string;
  /** Imagem de pré-visualização do card em telas estreitas. */
  previewSrc?: string;
  /** Painel despublicado ou quebrado: mostra só o aviso, sem iframe. */
  unavailable?: boolean;
  className?: string;
}

function OpenLink({ href }: { href: string }) {
  return (
    <Button asChild variant="outline" size="sm">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Maximize2 aria-hidden />
        Abrir em tela cheia
        <span className="sr-only"> (abre em nova aba)</span>
      </a>
    </Button>
  );
}

/**
 * Painel do Power BI embutido. Em telas a partir de `md` mostra o iframe; em
 * telas estreitas, onde o relatório fica ilegível, mostra um card com a
 * pré-visualização e o link. A troca é só por CSS.
 */
export function PowerBiEmbed({
  src,
  title,
  href = src,
  description,
  previewSrc,
  unavailable = false,
  className,
}: PowerBiEmbedProps) {
  if (unavailable) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <AlertTriangle
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            {title}: painel indisponível no momento
          </p>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      data-slot="power-bi-embed"
      className={cn('flex flex-col gap-3', className)}
    >
      <div className="hidden justify-end md:flex">
        <OpenLink href={href} />
      </div>
      <div className="hidden aspect-[16/10] w-full overflow-hidden rounded-lg border bg-card md:block">
        <iframe
          title={title}
          src={src}
          loading="lazy"
          allowFullScreen
          className="size-full border-0"
        />
      </div>

      <Card className="overflow-hidden py-0 md:hidden">
        {previewSrc && (
          <img
            src={previewSrc}
            alt={`Pré-visualização do painel ${title}`}
            loading="lazy"
            className="aspect-video w-full border-b object-cover object-top"
          />
        )}
        <CardContent className="flex flex-col items-start gap-3 py-4 text-sm">
          <p className="font-medium">{title}</p>
          <p className="text-muted-foreground">
            {description ??
              'O painel interativo é melhor visualizado em telas maiores.'}
          </p>
          <OpenLink href={href} />
        </CardContent>
      </Card>
    </div>
  );
}
