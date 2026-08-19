import { Hash, User } from 'lucide-react';
import bg_popup from '../../../../../assets/bg_popup.png';
import { Alert } from '../../../../ui/alert';
import { CardContent, CardHeader, CardTitle } from '../../../../ui/card';

interface ItemSelecionado {
  term: string;
}

interface ResearchersSummaryCardsProps {
  totalResearchers: number;
  totalAmong: number;
  searchType?: string;
  itemsSelecionados?: ItemSelecionado[];
}

export function ResearchersSummaryCards({
  totalResearchers,
  totalAmong,
  searchType,
  itemsSelecionados = [],
}: ResearchersSummaryCardsProps) {
  const isAbstractOrNameOrArea =
    searchType === 'abstract' || searchType === 'name' || searchType === 'area';

  return (
    <div className="grid gap-4 mt-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {!isAbstractOrNameOrArea && (
        <Alert
          className="p-0 bg-cover bg-no-repeat bg-center lg:col-span-3"
          style={{ backgroundImage: `url(${bg_popup})` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de ocorrências
            </CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmong.toLocaleString()}
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground">pela pesquisa</p>

              <div className="flex gap-2 flex-wrap">
                {itemsSelecionados.map((valor, index) => {
                  return (
                    <div key={index} className="flex gap-2 items-center">
                      <div
                        className={`flex gap-2 items-center w-fit p-2 px-3 capitalize rounded-md text-xs ${
                          searchType === 'article' && 'bg-blue-500 dark:bg-blue-500'
                        } ${
                          searchType === 'abstract' &&
                          'bg-yellow-500 dark:bg-yellow-500'
                        } ${
                          searchType === 'speaker' &&
                          'bg-orange-500 dark:bg-orange-500'
                        } ${
                          searchType === 'book' && 'bg-pink-500 dark:bg-pink-500'
                        } ${
                          searchType === 'patent' && 'bg-cyan-500 dark:bg-cyan-500'
                        } ${
                          searchType === 'name' && 'bg-red-500 dark:bg-red-500'
                        } ${
                          searchType === 'area' && 'bg-green-500 dark:bg-green-500'
                        } ${
                          searchType === '' && 'bg-blue-700 dark:bg-blue-700'
                        } text-white border-0`}
                      >
                        {valor.term.replace(/[|;]/g, '')}
                      </div>
                      {index < itemsSelecionados.length - 1 && (
                        <div className="rounded-full flex items-center justify-center whitespace-nowrap h-8 w-8 bg-neutral-100 dark:bg-neutral-800 transition-all text-xs outline-none">
                          {itemsSelecionados[index].term.endsWith(';')
                            ? 'e'
                            : 'ou'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Alert>
      )}

      <Alert
        className={`p-0 bg-cover bg-no-repeat bg-center ${
          isAbstractOrNameOrArea ? 'col-span-4' : ''
        }`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de pesquisadores
          </CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalResearchers}</div>
          <p className="text-xs text-muted-foreground">encontrados na busca</p>
        </CardContent>
      </Alert>
    </div>
  );
}
