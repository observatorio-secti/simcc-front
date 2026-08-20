import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert } from '../ui/alert';
import { TextSearch } from 'lucide-react';
import { useQuery } from '../dashboard/builder-page/tabelas/tabela-artigos';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import { CalendarBlank, Rows, SquaresFour } from 'phosphor-react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Skeleton } from '../ui/skeleton';
import { columnsLinhasPesquisa } from './columns-linhas-pesquisa';
import { DataTable } from '../homepage/categorias/researchers-home/data-table';

export interface Linhas {
  end_year: string;
  start_year: string;
  area: string;
  name: string;
  graduate_program_id: string;
}

export function LinhasPesquisaPrograma() {
  const [jsonData, setJsonData] = useState<Linhas[]>([]);
  const queryUrl = useQuery();
  const type_search = queryUrl.get('graduate_program_id');
  const { urlGeral, searchType } = useContext(UserContext);

  const [loading, isLoading] = useState(true);
  const urlLinhas = `${urlGeral}graduate_program/lines?graduate_program_id=${type_search}`;

  console.log(urlLinhas);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlLinhas, {
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
          setJsonData(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        isLoading(false);
      }
    };
    fetchData();
  }, [urlLinhas]);

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  const [typeVisu, setTypeVisu] = useState('block');

  return (
    <main className="flex flex-col gap-8 px-4 md:px-8">
      <Alert className={`p-0  bg-cover bg-no-repeat bg-center `}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de linhas de pesquisa
          </CardTitle>
          <TextSearch className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex justify-between items-end">
          <div>
            <div className="text-2xl font-bold">{jsonData.length || 0}</div>
            <p className="text-xs text-muted-foreground flex gap-2">
              no programa
            </p>
          </div>
        </CardContent>
      </Alert>

      <Accordion defaultValue="item-1" type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex ">
            <div className="flex gap-4 w-full justify-between items-center ">
              <div className="flex gap-4 items-center">
                <TextSearch size={24} className="text-gray-400" />
                <p className=" font-medium">Linhas de pesquisa</p>
              </div>

              <div className="flex gap-3 mr-3  items-center h-full">
                <Button
                  onClick={() => setTypeVisu('rows')}
                  variant={typeVisu == 'block' ? 'ghost' : 'outline'}
                  size={'icon'}
                >
                  <Rows size={16} className=" whitespace-nowrap" />
                </Button>

                <Button
                  onClick={() => setTypeVisu('block')}
                  variant={typeVisu == 'block' ? 'outline' : 'ghost'}
                  size={'icon'}
                >
                  <SquaresFour size={16} className=" whitespace-nowrap" />
                </Button>
              </div>
            </div>

            <AccordionTrigger></AccordionTrigger>
          </div>
          <AccordionContent>
            {typeVisu == 'block' ? (
              loading ? (
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
                      <div className="w-full" key={index}>
                        {item}
                      </div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : jsonData.length == 0 ? (
                <div className="items-center justify-center w-full flex text-center pt-6">
                  Sem resultados para essa pesquisa
                </div>
              ) : (
                <ResponsiveMasonry
                  columnsCountBreakPoints={{
                    350: 1,
                    750: 2,
                    900: 3,
                    1200: 4,
                  }}
                >
                  <Masonry gutter="16px">
                    {jsonData.map((props) => (
                      <div className="flex w-full">
                        <div className="rounded-r-none bg-eng-blue border rounded-md dark:bg-neutral-800 w-2 min-w-2 border-r-0"></div>
                        <Alert className="rounded-l-none">
                          <h3 className="font-semibold text-left mb-4 flex flex-1">
                            {props.name}
                          </h3>
                          <p className="text-left">{props.area}</p>

                          <div className="text-sm mt-4 text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                            <CalendarBlank size={16} /> {props.start_year} -{' '}
                            {!props.end_year ? 'Atual' : props.end_year}
                          </div>
                        </Alert>
                      </div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              )
            ) : loading ? (
              <Skeleton className="w-full rounded-md h-[400px]" />
            ) : (
              <DataTable columns={columnsLinhasPesquisa} data={jsonData} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
