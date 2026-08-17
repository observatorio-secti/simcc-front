import { Rows, SquaresFour } from 'phosphor-react';
import { HeaderResultTypeHome } from '../../../homepage/categorias/header-result-type-home';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../ui/accordion';
import { Button } from '../../../ui/button';
import { Switch } from '../../../ui/switch';
import { Base } from '../base';
import { Keepo } from '../builder-page';
import { useQuery } from '../tabelas/tabela-artigos';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { ArticleBlock } from '../../../homepage/categorias/articles-home/articles-block';
import { Skeleton } from '../../../ui/skeleton';
import { TableReseracherArticleshome } from '../../../homepage/categorias/articles-home/table-articles';
import { useContext, useEffect, useState } from 'react';
import { Publicacao } from '../../../homepage/categorias/articles-home';
import { UserContext } from '../../../../context/context';
import { FilterArticle } from '../../../homepage/categorias/articles-home/filters-articles';
import { File } from 'lucide-react';

interface Props {
  keepoData: Keepo;
  setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  deleteItem: (index: number) => void;
  index: number;
  contentItem: any;
}

type Filter = {
  year: number[];
  qualis: string[];
};

export function ArtigosSection(props: Props) {
  const queryUrl = useQuery();

  const graduate_program_id = queryUrl.get('graduate_program_id');
  const group_id = queryUrl.get('group_id');
  const dep_id = queryUrl.get('dep_id');

  const [loading, isLoading] = useState(false);
  const [distinct, setDistinct] = useState(false);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [typeVisu, setTypeVisu] = useState('block');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  const { urlGeral } = useContext(UserContext);

  const [filters, setFilters] = useState<Filter[]>([]);

  const handleResearcherUpdate = (newResearcherData: Filter[]) => {
    setFilters(newResearcherData);
  };

  const yearString = filters.length > 0 ? filters[0].year.join(';') : '';
  const qualisString = filters.length > 0 ? filters[0].qualis.join(';') : '';

  const url = `${urlGeral}bibliographic_production_article?terms=&year=${yearString}&qualis=${qualisString}&university=&distinct=${distinct ? '1' : '0'}&graduate_program_id=${graduate_program_id || ''}&dep_id=${dep_id || ''}&page=${page}&length=12`;

  useEffect(() => {
    setPage(1);
    setPublicacoes([]);
    setHasMore(true);
  }, [yearString, qualisString, distinct, graduate_program_id, dep_id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (page === 1) isLoading(true);
        const response = await fetch(url, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });
        const data = await response.json();

        if (data) {
          if (page === 1) {
            setPublicacoes(data);
          } else {
            setPublicacoes((prev) => [...prev, ...data]);
          }

          if (data.length < 12) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        }
      } catch (err) {
        console.log(err);
      } finally {
        isLoading(false);
      }
    };

    if (urlGeral) {
      fetchData();
    }
  }, [url, page, urlGeral]);

  return (
    <Base
      setKeepoData={props.setKeepoData}
      moveItem={props.moveItem}
      deleteItem={props.deleteItem}
      index={props.index}
      keepoData={props.keepoData}
    >
      <FilterArticle onFilterUpdate={handleResearcherUpdate} />

      <Accordion defaultValue="item-1" type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex mb-2">
            <HeaderResultTypeHome
              title="Artigos"
              icon={<File size={24} className="text-gray-400" />}
            >
              <div className="gap-2 flex items-center text-xs text-gray-500 dark:text-gray-300">
                <p>Artigos:</p>
                Iguais
                <Switch
                  checked={distinct}
                  onCheckedChange={(value) => setDistinct(value)}
                />
                Distintos
              </div>

              <div className="hidden md:flex gap-2 mr-2">
                <Button
                  onClick={() => setTypeVisu('rows')}
                  variant="outline"
                  className={`bg-transparent border-0 ${typeVisu == 'rows' && 'bg-white dark:bg-neutral-800 border'}`}
                  size={'icon'}
                >
                  <Rows size={16} className=" whitespace-nowrap" />
                </Button>
                <Button
                  onClick={() => setTypeVisu('block')}
                  variant="outline"
                  className={`bg-transparent border-0 ${typeVisu == 'block' && 'bg-white dark:bg-neutral-800 border'} `}
                  size={'icon'}
                >
                  <SquaresFour size={16} className=" whitespace-nowrap" />
                </Button>
              </div>
            </HeaderResultTypeHome>
            <AccordionTrigger></AccordionTrigger>
          </div>

          <AccordionContent>
            {typeVisu == 'block' ? (
              loading && page === 1 ? (
                <ResponsiveMasonry
                  columnsCountBreakPoints={{
                    350: 1,
                    750: 2,
                    900: 3,
                    1200: 4,
                  }}
                >
                  <Masonry gutter="16px">
                    {items.map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                <ArticleBlock
                  articles={publicacoes}
                  distinct={distinct}
                  hasMore={hasMore}
                  onLoadMore={() => setPage((prev) => prev + 1)}
                />
              )
            ) : loading && page === 1 ? (
              <Skeleton className="w-full rounded-md h-[400px]" />
            ) : (
              <TableReseracherArticleshome articles={publicacoes} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Base>
  );
}
