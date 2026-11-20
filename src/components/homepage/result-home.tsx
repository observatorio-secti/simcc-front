import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserContext } from '../../context/context';
import { resultConfigFor } from '../../lib/search-types';
import { ResultHomeLegacy } from './result-home-legacy';
import { ResultHomeV2 } from './result-home-v2/result-home-v2';

// Página /resultados. Os tipos de busca cobertos pela API v2 usam a página
// nova; nome e resumo do Lattes, que a v2 ainda não restringe por camada,
// seguem na página antiga.
export function ResultHome() {
  const [searchParams] = useSearchParams();
  const { searchType } = useContext(UserContext);
  const type = searchParams.get('type_search') || searchType;
  const config = resultConfigFor(type);

  if (!config) return <ResultHomeLegacy />;
  // `key`: trocar o tipo de busca recomeça a página (aba, rolagem, exportação).
  return <ResultHomeV2 key={type} config={config} />;
}
