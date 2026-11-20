import { cn } from '@/shared/lib/cn';
import {
  AREA_COLORS,
  CHART_NEUTRAL_BG,
  FALLBACK_COLOR,
  GENDER_COLORS,
  ORIENTATION_COLORS,
  PRODUCTION_COLORS,
  QUALIS_COLORS,
  SCHOLARSHIP_COLORS,
  SEARCH_TYPE_COLORS,
  STATUS_COLORS,
  type DictionaryColor,
} from '@/shared/lib/design-tokens';
import { Badge, Dot } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { Showcase } from './showcase';

const DICTIONARIES: ReadonlyArray<{
  title: string;
  helper: string;
  colors: Record<string, DictionaryColor>;
  uppercase?: boolean;
}> = [
  {
    title: 'Tipo de busca',
    helper: 'searchTypeColor',
    colors: SEARCH_TYPE_COLORS,
  },
  {
    title: 'Grande área',
    helper: 'areaColor',
    colors: AREA_COLORS,
    uppercase: true,
  },
  { title: 'Qualis', helper: 'qualisColor', colors: QUALIS_COLORS },
  {
    title: 'Tipo de produção',
    helper: 'productionColor / eventNatureColor',
    colors: PRODUCTION_COLORS,
  },
  {
    title: 'Orientação',
    helper: 'orientationColor',
    colors: ORIENTATION_COLORS,
  },
  { title: 'Status', helper: 'statusColor', colors: STATUS_COLORS },
  { title: 'Bolsa', helper: 'scholarshipColor', colors: SCHOLARSHIP_COLORS },
  { title: 'Gênero', helper: 'genderColor', colors: GENDER_COLORS },
];

export function DictionariesShowcase() {
  return (
    <Showcase
      id="dicionarios"
      title="Dicionários de cor"
      description="Tudo vem de src/shared/lib/design-tokens.ts. Cores claras (marcadas) aparecem só como dot ou borda, nunca como fundo de texto branco."
      bare
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {DICTIONARIES.map((dictionary) => (
          <Card key={dictionary.title} className="gap-3 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="text-sm font-medium">{dictionary.title}</h3>
              <code className="text-xs text-muted-foreground">
                {dictionary.helper}()
              </code>
            </div>
            <ul className="flex flex-col gap-2">
              {Object.entries(dictionary.colors).map(([key, color]) => (
                <li
                  key={key}
                  className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1"
                >
                  {color.light ? (
                    <span className="inline-flex h-7 items-center gap-2 text-xs font-medium">
                      <Dot className={color.bg} />
                      {color.label}
                      <span className="text-[10px] text-muted-foreground">
                        (clara)
                      </span>
                    </span>
                  ) : (
                    <Badge
                      className={cn(
                        color.bg,
                        dictionary.uppercase && 'uppercase',
                      )}
                    >
                      {color.label}
                    </Badge>
                  )}
                  <code className="text-xs break-all text-muted-foreground">
                    {color.bg}
                  </code>
                </li>
              ))}
            </ul>
          </Card>
        ))}

        <Card className="gap-3 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h3 className="text-sm font-medium">Escala neutra de gráficos</h3>
            <code className="text-xs text-muted-foreground">
              chartNeutralBg()
            </code>
          </div>
          <div className="flex h-8 overflow-hidden rounded-md">
            {CHART_NEUTRAL_BG.map((bg) => (
              <span key={bg} className={cn('flex-1', bg)} title={bg} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Para séries sem semântica, na ordem de 1 a 6.
          </p>
        </Card>

        <Card className="gap-3 p-4">
          <h3 className="text-sm font-medium">Borda do card de produção</h3>
          <div className="flex flex-col gap-2">
            {(['A1', 'B2', 'SQ'] as const).map((key) => (
              <div
                key={key}
                className={cn(
                  'rounded-md border border-l-[6px] px-3 py-2 text-xs',
                  QUALIS_COLORS[key].borderLeft,
                )}
              >
                {QUALIS_COLORS[key].borderLeft}
              </div>
            ))}
            <div
              className={cn(
                'rounded-md border border-l-[6px] px-3 py-2 text-xs',
                PRODUCTION_COLORS.patente.borderLeft,
              )}
            >
              {PRODUCTION_COLORS.patente.borderLeft}
            </div>
            <div
              className={cn(
                'rounded-md border border-l-[6px] px-3 py-2 text-xs',
                FALLBACK_COLOR.borderLeft,
              )}
            >
              {FALLBACK_COLOR.borderLeft} (sem cor no kit)
            </div>
          </div>
        </Card>
      </div>
    </Showcase>
  );
}
