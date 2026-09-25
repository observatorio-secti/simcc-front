import { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MagnifyingGlass, X } from 'phosphor-react';
import { Trash } from 'lucide-react';

import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useModal } from '../hooks/use-modal-store';
import { UserContext } from '../../context/context';
import { SelectTypeSearch } from './select-type-search';

const useQuery = () => new URLSearchParams(useLocation().search);

export function Search() {
  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');

  const posGrad = location.pathname === '/pos-graduacao';
  const targetPath = posGrad ? '/pos-graduacao' : '/resultados';

  const { onOpen } = useModal();
  const {
    searchType,
    setSearchType,
    setValoresSelecionadosExport,
    itemsSelecionados,
    setItensSelecionados,
  } = useContext(UserContext);

  const [input, setInput] = useState('');

  useEffect(() => {
    if (type_search) {
      setSearchType(String(type_search));
    }
    if (terms) {
      const decoded = decodeURIComponent(terms).replace(/[()]/g, '').trim();
      setValoresSelecionadosExport(decoded);
      setItensSelecionados([{ term: decoded }]);
    }
  }, [type_search, terms]);

  const handlePesquisa = () => {
    const termoFinal = input.trim().replace(/[()]/g, '');
    if (!termoFinal) return;

    queryUrl.set('type_search', searchType);
    queryUrl.set('terms', termoFinal);

    setItensSelecionados([{ term: termoFinal }]);
    setValoresSelecionadosExport(termoFinal);
    setInput('');

    navigate({ pathname: targetPath, search: queryUrl.toString() });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePesquisa();
    }
  };

  const handleLimpar = () => {
    setItensSelecionados([]);
    setValoresSelecionadosExport('');
    queryUrl.delete('terms');
    navigate(targetPath);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = itemsSelecionados.filter((_, itemIndex) => itemIndex !== index);
    setItensSelecionados(newItems);

    if (newItems.length === 0) {
      handleLimpar();
    } else {
      const remainingTerms = newItems
        .map((item) => item.term.replace(/[()]/g, '').trim())
        .join(' ');
      setValoresSelecionadosExport(remainingTerms);
      queryUrl.set('terms', remainingTerms);
      navigate({ pathname: targetPath, search: queryUrl.toString() });
    }
  };

  return (
    <div className="bottom-0 mt-4 mb-2 w-full flex flex-col max-sm:flex max-sm:flex-row">
      <div className="w-full">
        <div className="flex gap-4 w-full">
          <Alert className="h-14 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2 w-full flex-1">
              <div className="hidden md:flex gap-2 w-fit items-center">
                <SelectTypeSearch />

                {itemsSelecionados.length > 0 && (
                  <div className="flex gap-2 mx-2 items-center">
                    {itemsSelecionados.map((valor, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs text-white border-0 ${searchType === 'article'
                            ? 'bg-blue-500 dark:bg-blue-500'
                            : searchType === 'abstract'
                              ? 'bg-yellow-500 dark:bg-yellow-500'
                              : searchType === 'speaker'
                                ? 'bg-orange-500 dark:bg-orange-500'
                                : searchType === 'book'
                                  ? 'bg-pink-500 dark:bg-pink-500'
                                  : searchType === 'patent'
                                    ? 'bg-cyan-500 dark:bg-cyan-500'
                                    : searchType === 'name'
                                      ? 'bg-red-500 dark:bg-red-500'
                                      : searchType === 'area'
                                        ? 'bg-green-500 dark:bg-green-500'
                                        : 'bg-blue-700 dark:bg-blue-700'
                          }`}
                      >
                        {valor.term}
                        <X
                          size={12}
                          onClick={() => handleRemoveItem(index)}
                          className="cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Input
                onClick={() => onOpen('search')}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                value={input}
                type="text"
                placeholder="Buscar..."
                className="border-0 w-full flex flex-1"
              />
            </div>

            <div className="w-fit flex gap-2">
              {itemsSelecionados.length > 0 && (
                <Button size="icon" variant="ghost" onClick={handleLimpar}>
                  <Trash size={16} />
                </Button>
              )}
              <Button
                onClick={handlePesquisa}
                variant="outline"
                className={`text-white border-0 ${searchType === 'article'
                    ? 'bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white'
                    : searchType === 'abstract'
                      ? 'bg-yellow-500 dark:bg-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-600 hover:text-white'
                      : searchType === 'speaker'
                        ? 'bg-orange-500 dark:bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white'
                        : searchType === 'book'
                          ? 'bg-pink-500 dark:bg-pink-500 hover:bg-pink-600 dark:hover:bg-pink-600 hover:text-white'
                          : searchType === 'patent'
                            ? 'bg-cyan-500 dark:bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-600 hover:text-white'
                            : searchType === 'name'
                              ? 'bg-red-500 dark:bg-red-500 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white'
                              : searchType === 'area'
                                ? 'bg-green-500 dark:bg-green-500 hover:bg-green-600 dark:hover:bg-green-600 hover:text-white'
                                : 'bg-blue-700 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-800 hover:text-white'
                  }`}
                size="icon"
              >
                <MagnifyingGlass size={16} />
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}