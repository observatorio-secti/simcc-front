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
import { ProductionDetailDialog } from './components/production-detail-dialog';
import { ProductionListSection } from './components/production-list-section';
import { ProfileSidebar } from './components/profile-sidebar';
import { TrajectoryTab } from './components/trajectory-tab';
import { YearFilter } from './components/year-filter';
import type { ProfileTab, ResearcherProfileSearch } from './search-schema';

export interface ResearcherProfilePageProps {
  researcherId: string;
  search: ResearcherProfileSearch;
  onUpdateSearch: (patch: Partial<ResearcherProfileSearch>) => void;
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  } catch {
    toast.error(`Não foi possível copiar ${label.toLowerCase()}`);
  }
}

/**
 * Tela de perfil do pesquisador (T3, Template E de `DESIGN.md`).
 */
export function ResearcherProfilePage({
  researcherId,
  search,
  onUpdateSearch,
}: ResearcherProfilePageProps) {
  const { data: detailResponse } = useSuspenseQuery(
    researcherDetailQueryOptions(researcherId),
  );
  const researcher = detailResponse.data;

  const {
    data: termsResponse,
    isLoading: termsLoading,
    isError: termsError,
  } = useQuery(researcherTermsQueryOptions(researcherId, { limit: 25 }));

  const { data: scholarshipsResponse } = useQuery(
    researcherScholarshipsQueryOptions(researcherId),
  );

  const terms = termsResponse?.data ?? [];
  const scholarships = scholarshipsResponse?.data ?? [];
  const counts = researcher.counts;

  const orcid = normalizeOrcid(researcher.identifiers.orcid);
  const lattesId = researcher.identifiers.lattes_id?.trim() || null;

  function handleOpenProduction(kind: ProductionKind, itemId: string) {
    onUpdateSearch({ prod_kind: kind, prod_id: itemId });
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
            <TabsList className="w-full justify-start">
              <TabsTrigger value="articles">
                <FileText aria-hidden />
                <span>Artigos</span>
                {counts && counts.articles > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({formatCount(counts.articles)})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="books">
                <BookOpen aria-hidden />
                <span>Livros e capítulos</span>
                {booksCount > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({formatCount(booksCount)})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="technical">
                <Lightbulb aria-hidden />
                <span>Produção técnica</span>
                {technicalCount > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({formatCount(technicalCount)})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports">
                <FileSpreadsheet aria-hidden />
                <span>Relatórios técnicos</span>
                {counts && counts.reports > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({formatCount(counts.reports)})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="guidance">
                <GraduationCap aria-hidden />
                <span>Orientações</span>
                {counts && counts.guidance > 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums">
                    ({formatCount(counts.guidance)})
                  </span>
                )}
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

      <ProductionDetailDialog
        kind={search.prod_kind}
        id={search.prod_id}
        onClose={() =>
          onUpdateSearch({ prod_kind: undefined, prod_id: undefined })
        }
      />
    </div>
  );
}
