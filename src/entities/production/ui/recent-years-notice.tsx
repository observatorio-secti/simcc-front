import { Calendar } from 'lucide-react';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import { Card, CardContent } from '@/shared/ui/card';

export interface RecentYearsNoticeProps {
  yearStart?: number;
  yearEnd?: number;
}

/**
 * Cartão amigável exibido acima da listagem de artigos quando o recorte padrão
 * (`anoCorrente - 10`) está ativo, convidando a explorar anos anteriores.
 */
export function RecentYearsNotice({
  yearStart,
  yearEnd,
}: RecentYearsNoticeProps) {
  const defaultYearStart = getDefaultYearStart();
  if (yearStart !== defaultYearStart || yearEnd !== undefined) {
    return null;
  }

  return (
    <Card
      role="note"
      className="border-eng-blue/35 bg-brand-soft/60 dark:border-eng-blue/30 dark:bg-eng-blue/15"
    >
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-white text-eng-blue dark:bg-eng-blue/20">
          <Calendar className="size-4" aria-hidden />
        </div>
        <div className="space-y-0.5 text-sm">
          <p className="font-medium text-foreground">
            Você está vendo os artigos mais recentes (a partir de {yearStart})
          </p>
          <p className="text-muted-foreground">
            Quer conhecer mais dessa trajetória? Experimente voltar o ano
            inicial no filtro de período para descobrir publicações de anos
            anteriores.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
