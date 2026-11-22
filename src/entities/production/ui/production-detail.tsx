import type { ReactNode } from 'react';
import { Calendar, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader } from '@/shared/ui/card';
import { focusRing } from '@/shared/ui/focus-ring';
import type {
  ProductionDetail as ProductionDetailModel,
  ProductionKind,
} from '../model';
import { getProductionDefinition } from '../registry';
import { ArticleMetricsMeta } from './article-metrics-meta';
import { ProductionAuthors } from './production-authors';

export interface ProductionDetailProps<
  K extends ProductionKind = ProductionKind,
> {
  kind: K;
  item: ProductionDetailModel<K>;
  /**
   * `stacked` (padrão): seções em uma coluna, para diálogos e vitrine.
   * `profile`: template E de `DESIGN.md`, com cabeçalho em largura total e
   * coluna lateral de 320px (ficha técnica, pesquisadores, financiamentos) a
   * partir de `lg`. Usado pela página e pelo overlay da produção (T13).
   */
  layout?: 'stacked' | 'profile';
  /** Nível do título da produção (`h1` na página completa). */
  titleAs?: 'h1' | 'h2';
  /** Ações do cabeçalho (copiar link…), à direita do tipo e do ano. */
  actions?: ReactNode;
  className?: string;
}

function capitalizeSentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function DetailSection({
  title,
  children,
  contentClassName,
}: {
  title: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-base font-medium">{title}</h3>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}

function DetailRowValue({
  value,
  href,
}: {
  value: string | number;
  href?: string;
}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'inline-flex items-center gap-1 rounded-xs font-medium break-all text-eng-blue hover:text-eng-dark-blue hover:underline',
          focusRing,
        )}
      >
        {value}
        <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
      </a>
    );
  }
  if (typeof value === 'number') {
    return (
      <span className="tabular-nums">{value.toLocaleString('pt-BR')}</span>
    );
  }
  return <span className="wrap-break-word">{value}</span>;
}

/**
 * Dossiê completo de uma produção científica ou técnica, derivado de
 * `PRODUCTION_REGISTRY` e dos tipos do OpenAPI v2.
 */
export function ProductionDetail<K extends ProductionKind>({
  kind,
  item,
  layout = 'stacked',
  titleAs: TitleTag = 'h2',
  actions,
  className,
}: ProductionDetailProps<K>) {
  const definition = getProductionDefinition(kind);
  const Icon = definition.icon;
  const accent = definition.itemColor(item);
  const title = definition.itemTitle(item);
  const subtitle = definition.subtitle(item);
  const year = definition.yearLabel(item);
  const externalLinks = definition.externalLinks(item);
  const detail: ProductionDetailModel = item;
  const articleMetrics = definition.articleMetrics?.(item);
  const articleExtras = definition.articleExtras?.(item);
  const projectExtras = definition.projectExtras?.(item);
  const hasKeywordTags = Boolean(articleExtras?.keywords?.length);
  const rows = definition
    .details(item)
    .filter(
      (row): row is { label: string; value: string | number; href?: string } =>
        row.value !== null &&
        row.value !== undefined &&
        row.value !== '' &&
        !(hasKeywordTags && row.label === 'Palavras-chave'),
    );

  const authors = detail.platform_authors ?? [];
  const isProfile = layout === 'profile';

  const header = (
    <Card className={cn('border-l-[6px] p-6', accent.borderLeft)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <Badge variant="outline">
              <Dot className={accent.bg} />
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {capitalizeSentence(definition.noun[0])}
            </Badge>

            {year && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Calendar className="h-3 w-3 shrink-0" aria-hidden />
                {year}
              </span>
            )}

            {articleMetrics && <ArticleMetricsMeta {...articleMetrics} />}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {subtitle && (
          <p className="text-sm font-semibold wrap-break-word text-muted-foreground">
            {subtitle}
          </p>
        )}

        <TitleTag className="text-lg leading-snug font-semibold wrap-break-word uppercase">
          {title}
        </TitleTag>

        {externalLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {externalLinks.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-md border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary',
                  focusRing,
                )}
              >
                {link.label}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
            ))}
          </div>
        )}
      </div>
    </Card>
  );

  const abstractSection = articleExtras?.abstract && (
    <DetailSection
      title="Resumo"
      contentClassName="text-sm leading-relaxed wrap-break-word"
    >
      {articleExtras.abstract}
    </DetailSection>
  );

  const descriptionSection = projectExtras?.description && (
    <DetailSection
      title="Descrição"
      contentClassName="text-sm leading-relaxed wrap-break-word"
    >
      {projectExtras.description}
    </DetailSection>
  );

  const keywordsSection = articleExtras?.keywords &&
    articleExtras.keywords.length > 0 && (
      <DetailSection
        title="Palavras-chave"
        contentClassName="flex flex-wrap gap-1.5"
      >
        {articleExtras.keywords.map((keyword) => (
          <Tag key={keyword} variant="neutral">
            {keyword}
          </Tag>
        ))}
      </DetailSection>
    );

  const authorsSection = authors.length > 0 && (
    <DetailSection title="Pesquisadores da plataforma">
      <ProductionAuthors authors={authors} />
    </DetailSection>
  );

  const rowsSection = rows.length > 0 && (
    <DetailSection title="Ficha técnica">
      <dl
        className={cn(
          'grid gap-4',
          isProfile ? 'sm:grid-cols-2 lg:grid-cols-1' : 'sm:grid-cols-2',
        )}
      >
        {rows.map((row) => (
          <div key={row.label} className="flex min-w-0 flex-col gap-1">
            <dt className="text-xs font-medium text-muted-foreground">
              {row.label}
            </dt>
            <dd className="text-sm">
              <DetailRowValue value={row.value} href={row.href} />
            </dd>
          </div>
        ))}
      </dl>
    </DetailSection>
  );

  const fomentSection = projectExtras?.foment &&
    projectExtras.foment.length > 0 && (
      <DetailSection title="Financiamentos">
        <ul className="flex flex-col gap-2 text-sm">
          {projectExtras.foment.map((foment, index) => (
            <li
              key={`${foment.agency_code ?? foment.agency_name ?? 'foment'}-${index}`}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="font-medium">
                {foment.agency_name ?? foment.agency_code ?? 'Agência'}
              </span>
              {foment.nature && <Tag variant="neutral">{foment.nature}</Tag>}
            </li>
          ))}
        </ul>
      </DetailSection>
    );

  const componentsSection = projectExtras?.components &&
    projectExtras.components.length > 0 && (
      <DetailSection title="Integrantes">
        <ul className="flex flex-wrap gap-2">
          {projectExtras.components.map((member, index) => (
            <li key={`${member.lattes_id ?? member.name ?? 'm'}-${index}`}>
              <Tag variant={member.coordinator ? 'brand' : 'neutral'}>
                {member.name ?? member.citations ?? 'Integrante'}
                {member.coordinator && <b>Coordenador</b>}
              </Tag>
            </li>
          ))}
        </ul>
      </DetailSection>
    );

  const productionsSection = projectExtras?.productions &&
    projectExtras.productions.length > 0 && (
      <DetailSection title="Produções vinculadas">
        <ul className="flex flex-col gap-2 text-sm">
          {projectExtras.productions.map((prod, index) => (
            <li
              key={`${prod.title ?? 'prod'}-${index}`}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2 last:border-b-0 last:pb-0"
            >
              <span className="wrap-break-word">
                {prod.title ?? 'Produção sem título'}
              </span>
              {prod.type && (
                <Badge variant="outline" size="sm">
                  {prod.type}
                </Badge>
              )}
            </li>
          ))}
        </ul>
      </DetailSection>
    );

  if (isProfile) {
    const hasMain = [
      abstractSection,
      descriptionSection,
      keywordsSection,
      componentsSection,
      productionsSection,
    ].some(Boolean);
    return (
      <div
        data-slot="production-detail"
        data-kind={kind}
        data-layout={layout}
        className={cn('flex flex-col gap-6', className)}
      >
        {header}
        <div
          className={cn(
            'grid grid-cols-1 items-start gap-6',
            hasMain && 'lg:grid-cols-[minmax(0,1fr)_320px]',
          )}
        >
          {hasMain && (
            <div className="flex min-w-0 flex-col gap-4">
              {abstractSection}
              {descriptionSection}
              {keywordsSection}
              {componentsSection}
              {productionsSection}
            </div>
          )}
          <aside className="flex min-w-0 flex-col gap-4">
            {authorsSection}
            {rowsSection}
            {fomentSection}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="production-detail"
      data-kind={kind}
      data-layout={layout}
      className={cn('flex flex-col gap-4', className)}
    >
      {header}
      {abstractSection}
      {descriptionSection}
      {keywordsSection}
      {authorsSection}
      {rowsSection}
      {fomentSection}
      {componentsSection}
      {productionsSection}
    </div>
  );
}
