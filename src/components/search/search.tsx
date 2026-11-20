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
import {
  getSearchTypeBadgeColor,
  getSearchTypeButtonColor,
  isProfileSearch,
  resultsPathFor,
} from '../../lib/search-types';

const useQuery = () => new URLSearchParams(useLocation().search);

export function Search() {
  const queryUrl = useQuery();
  const navigate = useNavigate();
  const location = useLocation();

  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');

  const { onOpen } = useModal();
  const {
    searchType,
    setSearchType,
    setValoresSelecionadosExport,
    itemsSelecionados,
    setItensSelecionados,
  } = useContext(UserContext);

  const posGrad = location.pathname === '/pos-graduacao';
  const targetPath =
    posGrad && !isProfileSearch(searchType)
      ? '/pos-graduacao'
      : resultsPathFor(searchType);

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
                        className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs text-white border-0 ${getSearchTypeBadgeColor(
                          searchType,
                        )}`}
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
                className={`text-white border-0 ${getSearchTypeButtonColor(
                  searchType,
                )}`}
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