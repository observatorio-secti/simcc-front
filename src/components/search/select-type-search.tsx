import { useContext } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { UserContext } from '../../context/context';
import { useModalResult } from '../hooks/use-modal-result';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  isProfileSearch,
  LEGACY_RESULTS_PATH,
  PROFILE_RESULTS_PATH,
  resultsPathFor,
} from '../../lib/search-types';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export function SelectTypeSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const posGrad = location.pathname == '/pos-graduacao';

  const resultados =
    location.pathname == LEGACY_RESULTS_PATH ||
    location.pathname == PROFILE_RESULTS_PATH;

  const { onOpen } = useModalResult();
  const queryUrl = useQuery();
  const { searchType, setSearchType } = useContext(UserContext);
  const type_search = '';

  return (
    <div className="min-w-max">
      <Select
        defaultValue={searchType}
        value={searchType}
        onValueChange={(value) => {
          setSearchType(value);
          if (!isProfileSearch(value)) onOpen('researchers-home');

          if (resultados) {
            // A busca por perfil tem página própria; os demais tipos seguem em /resultados.
            queryUrl.set('type_search', value);
            navigate({
              pathname: resultsPathFor(value),
              search: queryUrl.toString(),
            });
          }
        }}
      >
        <SelectTrigger className="w-full whitespace-nowrap">
          <div className="hidden md:block">
            <SelectValue placeholder="Escolha o tipo de pesquisa" />
          </div>
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectItem value="profile">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-indigo-500 flex rounded-sm h-4 w-4"></div>{' '}
              Perfil completo
            </div>
          </SelectItem>
          <SelectItem value="article">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-blue-500 flex rounded-sm h-4 w-4"></div>{' '}
              Artigos
            </div>
          </SelectItem>
          <SelectItem value="book">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-pink-500 flex rounded-sm h-4 w-4"></div> Livros
              e capítulos
            </div>
          </SelectItem>
          <SelectItem value="patent">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-cyan-500 flex rounded-sm h-4 w-4"></div>{' '}
              Patentes
            </div>
          </SelectItem>
          <SelectItem value="name">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-red-500 flex rounded-sm h-4 w-4"></div> Nome
            </div>
          </SelectItem>
          <SelectItem value="area">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-green-500 flex rounded-sm h-4 w-4"></div> Áreas
            </div>
          </SelectItem>
          <SelectItem value="abstract">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-yellow-500 flex rounded-sm h-4 w-4"></div>{' '}
              Resumo do lattes
            </div>
          </SelectItem>
          <SelectItem value="speaker">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-orange-500 flex rounded-sm h-4 w-4"></div>{' '}
              Participação em eventos
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
