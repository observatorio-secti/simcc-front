import { useContext, useEffect, useState } from 'react';
import { useModalHomepage } from '../hooks/use-modal-homepage';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ChevronLeft, Rows } from 'lucide-react';
import { SelectTypeSearch } from '../search/select-type-search';
import { Input } from '../ui/input';
import { FileCsv, MagnifyingGlass } from 'phosphor-react';
import { UserContext } from '../../context/context';

interface Post {
  frequency: string;
  term: string;
  checked: boolean;
  area_expertise: string;
  area_specialty: string;
  type: string;
}

import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useModalResult } from '../hooks/use-modal-result';
import { Helmet } from 'react-helmet';

export function Dicionario() {
  const { isOpen, type: typeModal } = useModalHomepage();
  const isModalOpen = isOpen && typeModal === 'dicionario';

  const [words, setWords] = useState<Post[]>([]);
  const [pesquisaInput, setPesquisaInput] = useState('');
  const { searchType, urlGeral, setItensSelecionados } =
    useContext(UserContext);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const pesquisaInputFormatado = pesquisaInput.trim().replace(/\s+/g, ';');

  let urlTerms = urlGeral + `originals_words?initials=&type=ARTICLE`;

  if (searchType === 'name') {
    urlTerms =
      urlGeral + `originals_words?initials=${pesquisaInputFormatado}&type=NAME`;
  } else if (searchType === 'article') {
    urlTerms =
      urlGeral +
      `originals_words?initials=${pesquisaInputFormatado}&type=ARTICLE`;
  } else if (searchType === 'book') {
    urlTerms =
      urlGeral + `originals_words?initials=${pesquisaInputFormatado}&type=BOOK`;
  } else if (searchType === 'area') {
    urlTerms =
      urlGeral + `originals_words?initials=${pesquisaInputFormatado}&type=AREA`;
  } else if (searchType === 'speaker') {
    urlTerms =
      urlGeral +
      `originals_words?initials=${pesquisaInputFormatado}&type=SPEAKER`;
  } else if (searchType === 'patent') {
    urlTerms =
      urlGeral +
      `originals_words?initials=${pesquisaInputFormatado}&type=PATENT`;
  } else if (searchType === 'abstract') {
    urlTerms =
      urlGeral +
      `originals_words?initials=${pesquisaInputFormatado}&type=ABSTRACT`;
  }

  useEffect(() => {
    fetch(urlTerms, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
        'Content-Type': 'text/plain',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const newData = data.map((post: Post) => ({
          ...post,
          term: post.term,
        }));

        setWords(newData);
        setJsonData(newData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, [urlTerms]);

  const groupedWords = words.reduce(
    (acc, word) => {
      const firstLetter = word.term[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(word);
      return acc;
    },
    {} as { [key: string]: Post[] },
  );

  const navigate = useNavigate();

  function handlePesquisaChange(term: string) {
    setItensSelecionados([{ term }]);

    navigate(`/resultados?type_search=${searchType}&terms=${term}`);
  }

  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  };

  console.log(urlTerms);
  const { onOpen: onOpenResult } = useModalResult();

  const convertJsonToCsv = (json: any[]): string => {
    const items = json;
    const replacer = (_: string, value: any) => (value === null ? '' : value); // Handle null values
    const header = Object.keys(items[0]);
    const csv = [
      '\uFEFF' + header.join(';'), // Add BOM and CSV header
      ...items.map((item) =>
        header
          .map((fieldName) => JSON.stringify(item[fieldName], replacer))
          .join(';'),
      ), // CSV data
    ].join('\r\n');

    return csv;
  };

  const handleDownloadJson = async () => {
    try {
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=windows-1252;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `dicionario.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dicionário | {'Simcc'}</title>
        <meta name="description" content={`Dicionário | ${'Simcc'}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      {isModalOpen && (
        <main className="flex  flex-1 flex-col gap-8 p-4  md:p-8">
          <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={handleVoltar}
                variant="outline"
                size="icon"
                className="h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>

              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Dicionário de termos
              </h1>

              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button size="sm" onClick={() => handleDownloadJson()}>
                  <FileCsv size={16} />
                  Exportar termos
                </Button>
              </div>
            </div>
          </div>

          <div>
            <h1 className="max-w-[550px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block mb-3">
              Todas as{' '}
              <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
                palavras
              </strong>{' '}
              cadastradas na plataforma
            </h1>
            <p className="max-w-[750px] text-lg font-light text-foreground">
              Pesquise termos para auxiliar o seu filtro na plataforma
            </p>
            <div className="flex gap-3 mt-3">
              <div className="flex gap-3 items-center w-full max-w-[550px] rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400">
                <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
                <SelectTypeSearch />
                <Input
                  className="border-0 p-0 h-9 flex flex-1"
                  value={pesquisaInput}
                  onChange={(e) => setPesquisaInput(e.target.value)}
                />
              </div>
            </div>
          </div>

          <ResponsiveMasonry
            className="pb-4 md:pb-8"
            columnsCountBreakPoints={{
              350: 1,
              750: pesquisaInput.length != 0 ? 1 : 2,
              900: pesquisaInput.length != 0 ? 1 : 3,
              1200: pesquisaInput.length != 0 ? 1 : 3,
            }}
          >
            <Masonry gutter="16px">
              {Object.keys(groupedWords)
                .sort()
                .map((letter) => (
                  <div key={letter}>
                    <div className="flex gap-3 mb-3 items-center">
                      <Rows size={16} />
                      <h3 className="font-bold text-2xl">{letter}</h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {groupedWords[letter]
                        .filter(
                          (word) =>
                            searchType !== 'area' ||
                            word.type === 'AREA_SPECIALTY',
                        )
                        .map((word, index) => (
                          <div
                            key={index}
                            className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
                            onClick={() => {
                              handlePesquisaChange(word.term);
                              onOpenResult('researchers-home');
                            }}
                          >
                            {word.term}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </Masonry>
          </ResponsiveMasonry>
        </main>
      )}
    </>
  );
}
