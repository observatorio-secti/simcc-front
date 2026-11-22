import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Briefcase,
  Copy,
  FileDown,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  MoreHorizontal,
  Presentation,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ProductionKind } from '@/entities/production/model';
import { formatCount, normalizeOrcid } from '@/entities/researcher/model';
import {
  researcherDetailQueryOptions,
  researcherTermsQueryOptions,
} from '@/entities/researcher/queries';
import { ResearcherProfileHeader } from '@/entities/researcher/ui/researcher-profile-header';
import { researcherScholarshipsQueryOptions } from '@/entities/scholarship/queries';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { ArticlesTab } from './components/articles-tab';
import { GuidanceTab } from './components/guidance-tab';
import { ProductionListSection } from './components/production-list-section';
import {
  GroupedMetricYearChart,
  MultiKindYearChart,
} from './components/production-year-charts';
import { ProfileSidebar } from './components/profile-sidebar';
import { TrajectoryTab } from './components/trajectory-tab';
import { YearFilter } from './components/year-filter';
import type { ProfileTab, ResearcherProfileSearch } from './search-schema';

export interface ResearcherProfilePageProps {
  researcherId: string;
  search: ResearcherProfileSearch;
  onUpdateSearch: (patch: Partial<ResearcherProfileSearch>) => void;
  /**
   * Abre o detalhe da produção (T13). Quem monta a rota decide a navegação:
   * overlay mascarado como `/producoes/<slug>/<id>` (ADR 0010).
   */
  onOpenProduction: (kind: ProductionKind, id: string) => void;
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error(`Não foi possível copiar ${label.toLowerCase()}`);
  }
}

function renderTabCount(count: number | undefined) {
  if (!count || count <= 0) return null;
  return (
    <span className="text-xs text-muted-foreground tabular-nums group-data-[state=active]:text-white/80">
      ({formatCount(count)})
    </span>
  );
}

/**
 * Tela de perfil do pesquisador (T3, Template E de `DESIGN.md`).
 */
export function ResearcherProfilePage({
  researcherId,
  search,
  onUpdateSearch,
  onOpenProduction,
}: ResearcherProfilePageProps) {
  const { data: detailResponse } = useSuspenseQuery(
    researcherDetailQueryOptions(researcherId),
  );
  const researcher = detailResponse.data;

  const {
    data: termsResponse,
    isLoading: termsLoading,
    isError: termsError,
  } = useQuery(researcherTermsQueryOptions(researcherId, { limit: 18 }));

  const { data: scholarshipsResponse } = useQuery(
    researcherScholarshipsQueryOptions(researcherId),
  );

  const terms = termsResponse?.data ?? [];
  const scholarships = scholarshipsResponse?.data ?? [];
  const counts = researcher.counts;

  const orcid = normalizeOrcid(researcher.identifiers.orcid);
  const lattesId = researcher.identifiers.lattes_id?.trim() || null;

  function handleOpenProduction(kind: ProductionKind, itemId: string) {
    onOpenProduction(kind, itemId);
  }

  function handleTabChange(nextTab: string) {
    onUpdateSearch({
      tab: nextTab as ProfileTab,
      page: 1,
    });
  }

  const booksCount = (counts?.books ?? 0) + (counts?.book_chapters ?? 0);
  const technicalCount =
    (counts?.patents ?? 0) + (counts?.software ?? 0) + (counts?.brands ?? 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <ResearcherProfileHeader
        researcher={researcher}
        highlightQuery={search.q}
        searchType={search.search_type}
        actions={
          <>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Copiar link do perfil"
              onClick={() =>
                void copyText(window.location.href, 'Link do perfil')
              }
            >
              <Share2 aria-hidden />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              aria-label="Imprimir perfil"
              onClick={() => window.print()}
            >
              <FileDown aria-hidden />
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
                  <DropdownMenuItem
                    onClick={() => void copyText(orcid, 'ORCID')}
                  >
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
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Tabs value={search.tab} onValueChange={handleTabChange}>
            <TabsList variant="pills">
              <TabsTrigger value="articles">
                <FileText aria-hidden />
                <span>Artigos</span>
                {renderTabCount(counts?.articles)}
              </TabsTrigger>
              <TabsTrigger value="books">
                <BookOpen aria-hidden />
                <span>Livros e capítulos</span>
                {renderTabCount(booksCount)}
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Lightbulb aria-hidden />
                <span>Produção técnica</span>
                {renderTabCount(technicalCount)}
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileSpreadsheet aria-hidden />
                <span>Relatórios técnicos</span>
                {renderTabCount(counts?.reports)}
              </TabsTrigger>
              <TabsTrigger value="guidance">
                <GraduationCap aria-hidden />
                <span>Orientações</span>
                {renderTabCount(counts?.guidance)}
              </TabsTrigger>
              <TabsTrigger value="events">
                <Presentation aria-hidden />
                <span>Eventos</span>
              </TabsTrigger>
              <TabsTrigger value="projects">
                <FolderKanban aria-hidden />
                <span>Projetos</span>
              </TabsTrigger>
              <TabsTrigger value="trajectory">
                <Briefcase aria-hidden />
                <span>Trajetória</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-4">
              <ArticlesTab
                researcherId={researcherId}
                search={search}
                onUpdateSearch={onUpdateSearch}
                onOpenItem={(item) => handleOpenProduction('article', item.id)}
              />
            </TabsContent>

            <TabsContent value="books" className="mt-4 flex flex-col gap-6">
              <YearFilter
                yearStart={search.year_start}
                yearEnd={search.year_end}
                onChange={({ yearStart, yearEnd }) =>
                  onUpdateSearch({
                    year_start: yearStart,
                    year_end: yearEnd,
                    page: 1,
                  })
                }
              />
              <MultiKindYearChart
                title="Gráfico de livros e capítulos por ano"
                researcherId={researcherId}
                yearStart={search.year_start}
                yearEnd={search.year_end}
                kinds={[
                  { kind: 'book', label: 'Livros' },
                  { kind: 'book_chapter', label: 'Capítulos de livros' },
                ]}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="book"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                view={search.view}
                collapsible
                onViewChange={(view) => onUpdateSearch({ view })}
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="book_chapter"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                view={search.view}
                collapsible
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
            </TabsContent>

            <TabsContent value="technical" className="mt-4 flex flex-col gap-6">
              <YearFilter
                yearStart={search.year_start}
                yearEnd={search.year_end}
                onChange={({ yearStart, yearEnd }) =>
                  onUpdateSearch({
                    year_start: yearStart,
                    year_end: yearEnd,
                    page: 1,
                  })
                }
              />
              <MultiKindYearChart
                title="Gráfico de produção técnica por ano"
                researcherId={researcherId}
                yearStart={search.year_start}
                yearEnd={search.year_end}
                kinds={[
                  { kind: 'patent', label: 'Patentes' },
                  { kind: 'software', label: 'Softwares' },
                  { kind: 'brand', label: 'Marcas' },
                ]}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="patent"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                view={search.view}
                collapsible
                onViewChange={(view) => onUpdateSearch({ view })}
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="software"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                view={search.view}
                collapsible
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="brand"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                view={search.view}
                collapsible
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
            </TabsContent>

            <TabsContent value="reports" className="mt-4 flex flex-col gap-6">
              <YearFilter
                yearStart={search.year_start}
                yearEnd={search.year_end}
                onChange={({ yearStart, yearEnd }) =>
                  onUpdateSearch({
                    year_start: yearStart,
                    year_end: yearEnd,
                    page: 1,
                  })
                }
              />
              <GroupedMetricYearChart
                title="Gráfico de relatórios técnicos por ano"
                researcherId={researcherId}
                kind="report"
                groupBy="none"
                yearStart={search.year_start}
                yearEnd={search.year_end}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="report"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                page={search.page}
                view={search.view}
                onPageChange={(page) => onUpdateSearch({ page })}
                onViewChange={(view) => onUpdateSearch({ view })}
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
            </TabsContent>

            <TabsContent value="guidance" className="mt-4 flex flex-col gap-6">
              <YearFilter
                yearStart={search.year_start}
                yearEnd={search.year_end}
                onChange={({ yearStart, yearEnd }) =>
                  onUpdateSearch({
                    year_start: yearStart,
                    year_end: yearEnd,
                    page: 1,
                  })
                }
              />
              <GuidanceTab
                researcherId={researcherId}
                yearStart={search.year_start}
                yearEnd={search.year_end}
                page={search.page}
                view={search.view}
                onPageChange={(page) => onUpdateSearch({ page })}
                onViewChange={(view) => onUpdateSearch({ view })}
                onOpenItem={(item) => handleOpenProduction('guidance', item.id)}
              />
            </TabsContent>

            <TabsContent value="events" className="mt-4 flex flex-col gap-6">
              <YearFilter
                yearStart={search.year_start}
                yearEnd={search.year_end}
                onChange={({ yearStart, yearEnd }) =>
                  onUpdateSearch({
                    year_start: yearStart,
                    year_end: yearEnd,
                    page: 1,
                  })
                }
              />
              <GroupedMetricYearChart
                title="Gráfico de participação em eventos por ano"
                researcherId={researcherId}
                kind="event"
                groupBy="nature"
                yearStart={search.year_start}
                yearEnd={search.year_end}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="event"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                page={search.page}
                view={search.view}
                onPageChange={(page) => onUpdateSearch({ page })}
                onViewChange={(view) => onUpdateSearch({ view })}
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
            </TabsContent>

            <TabsContent value="projects" className="mt-4 flex flex-col gap-6">
              <YearFilter
                yearStart={search.year_start}
                yearEnd={search.year_end}
                onChange={({ yearStart, yearEnd }) =>
                  onUpdateSearch({
                    year_start: yearStart,
                    year_end: yearEnd,
                    page: 1,
                  })
                }
              />
              <GroupedMetricYearChart
                title="Gráfico de projetos por ano de início"
                researcherId={researcherId}
                kind="research_project"
                groupBy="status"
                yearStart={search.year_start}
                yearEnd={search.year_end}
              />
              <ProductionListSection
                researcherId={researcherId}
                kind="research_project"
                yearStart={search.year_start}
                yearEnd={search.year_end}
                page={search.page}
                view={search.view}
                onPageChange={(page) => onUpdateSearch({ page })}
                onViewChange={(view) => onUpdateSearch({ view })}
                onOpenItem={(kind, item) => handleOpenProduction(kind, item.id)}
              />
            </TabsContent>

            <TabsContent value="trajectory" className="mt-4">
              <TrajectoryTab researcher={researcher} />
            </TabsContent>
          </Tabs>
        </div>

        <ProfileSidebar
          researcher={researcher}
          scholarships={scholarships}
          terms={terms}
          termsLoading={termsLoading}
          termsError={termsError}
        />
      </div>
    </div>
  );
}
