import { Plus } from 'phosphor-react';
import { Loader2 } from 'lucide-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Button } from '../../../ui/button';
import { ResearchItem } from './researcher-item';

export interface ResearchersBlocoProps {
  researcher: any[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  isFetchingNextPage?: boolean;
}

export function ResearchersBloco({
  researcher,
  onLoadMore,
  hasMore = false,
  isFetchingNextPage = false,
}: ResearchersBlocoProps) {
  return (
    <div className="pb-16">
      <ResponsiveMasonry
        columnsCountBreakPoints={{
          350: 2,
          750: 3,
          900: 4,
          1200: 6,
          1500: 6,
          1700: 7,
        }}
      >
        <Masonry gutter="16px">
          {researcher.map((item: any, index: number) => {
            const departmentValue =
              typeof item.departments === 'string'
                ? item.departments
                : Array.isArray(item.departments) && item.departments.length > 0
                  ? item.departments.map((d: any) => d.dep_sigla || d.dep_nom || d).join(', ')
                  : item.departament || '';

            return (
              <ResearchItem
                key={item.id || index}
                among={item.among}
                articles={item.articles}
                book={item.book}
                book_chapters={item.book_chapters}
                id={item.id}
                name={item.name}
                university={item.university}
                lattes_id={item.lattes_id}
                area={item.area}
                lattes_10_id={item.lattes_10_id}
                city={item.city}
                graduation={item.graduation}
                patent={item.patent}
                speaker={item.speaker || ''}
                h_index={item.h_index}
                relevance_score={item.relevance_score}
                works_count={item.works_count}
                cited_by_count={item.cited_by_count}
                i10_index={item.i10_index}
                scopus={item.scopus}
                openalex={item.openalex}
                departament={item.departament || departmentValue}
                departments={departmentValue}
                subsidy={item.subsidy}
                status={item.status}
                graduate_programs={item.graduate_programs}
              />
            );
          })}
        </Masonry>
      </ResponsiveMasonry>

      {hasMore && (
        <div className="w-full flex justify-center mt-8">
          <Button
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Carregando mais...
              </>
            ) : (
              <>
                <Plus size={16} />
                Mostrar mais
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
