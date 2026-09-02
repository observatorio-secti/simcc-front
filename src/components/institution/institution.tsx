import { useContext, useEffect, useState } from 'react';

import { UserContext } from '../../context/context';
import { useModalHomepage } from '../hooks/use-modal-homepage';

import { areasComCores, InstitutionItem } from './institution-item';

import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

import { Alert } from '../ui/alert';
import { MagnifyingGlass, Rows, SquaresFour } from 'phosphor-react';
import { Input } from '../ui/input';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Download,
  File,
  Info,
  Landmark,
  Plus,
} from 'lucide-react';

import { Helmet } from 'react-helmet';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { HeaderResultTypeHome } from '../homepage/categorias/header-result-type-home';

import { useModal } from '../hooks/use-modal-store';

import { CardContent, CardHeader, CardTitle } from '../ui/card';

import { Keepo } from '../dashboard/builder-page/builder-page';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { VisualizacaoInstituicao } from './visualizacao-instituicao';
import { useInstitutions } from './hooks/use-institution-queries';
import { Institution as InstitutionType } from '../../services/institution';

export type Institution = InstitutionType;

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export function Institution() {
  const queryUrl = useQuery();
  const params = useParams<{
    acronym?: string;
    institution_id?: string;
  }>();

  const rawSearch =
    params.acronym ||
    params.institution_id ||
    queryUrl.get('acronym') ||
    queryUrl.get('institution_id') ||
    '';

  let type_search = rawSearch.trim();
  try {
    type_search = decodeURIComponent(type_search).trim();
  } catch {
    // fallback
  }

  const programSelecionado = type_search;

  const { data: graduatePrograms = [], isLoading: loading } = useInstitutions();

  const [search, setSearch] = useState('');
  const [isOn, setIsOn] = useState(true);
  const jsonData = graduatePrograms;

  const filteredTotal = Array.isArray(graduatePrograms)
    ? graduatePrograms.filter((item) => {
        const normalizeString = (str: any) =>
          (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const searchString = normalizeString(item.name) + ' ' + normalizeString(item.acronym);
        const normalizedSearch = normalizeString(search);

        return searchString.includes(normalizedSearch);
      })
    : [];

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
      link.download = `dados.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[250px]" />
  ));

  const [typeVisu, setTypeVisu] = useState('block');

  const normalizeArea = (area: string): string =>
    area
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z0-9 ]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um único espaço
      .trim();

  // Criamos o Map normalizando as chaves antes
  const qualisColor = new Map(
    areasComCores.map(([area, color]) => [normalizeArea(area), color]),
  );

  const getColorByArea = (area: string): string =>
    qualisColor.get(normalizeArea(area)) || 'bg-gray-500';

  const location = useLocation();

  const navigate = useNavigate();

  const handleVoltar = () => {
    const currentPath = location.pathname;
    const hasQueryParams = location.search.length > 0;

    if (hasQueryParams) {
      // Se tem query parameters, remove apenas eles
      navigate(currentPath);
    } else {
      // Se não tem query parameters, remove o último segmento do path
      const pathSegments = currentPath
        .split('/')
        .filter((segment) => segment !== '');

      if (pathSegments.length > 1) {
        pathSegments.pop();
        const previousPath = '/' + pathSegments.join('/');
        navigate(previousPath);
      } else {
        // Se estiver na raiz ou com apenas um segmento, vai para raiz
        navigate('/');
      }
    }
  };

  const [count, setCount] = useState(24);

  const db = getFirestore();

  const fetchAvatars = async () => {
    const snapshot = await getDocs(collection(db, 'construtor-pagina'));
    const avatarMap: Record<string, string> = {};

    snapshot.forEach((doc) => {
      const data = doc.data() as Partial<Keepo>;
      const avatar = data.profile_info?.avatar || '';
      avatarMap[doc.id] = avatar;
    });

    return avatarMap;
  };

  const [avatarMap, setAvatarMap] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAvatars().then(setAvatarMap);
  }, []);

  return (
    <>
      <Helmet>
        <title>Instituições | {'Simcc'}</title>
        <meta name="description" content={`Instituições | ${'Simcc'}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <>
        {programSelecionado.length == 0 ? (
          <div>
            <div className="w-full  gap-4 p-4 md:p-8 ">
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
                  Instituições
                </h1>

                <div className="hidden items-center gap-2 md:ml-auto md:flex"></div>
              </div>
            </div>

            <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[980px] flex-col items-center gap-2 pb-8  md:pb-8  ">
              <Link
                to={'/informacoes'}
                className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"
              >
                <Info size={12} />
                <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
                Saiba o que é e como utilizar a plataforma
                <ArrowRight size={12} />
              </Link>

              <h1 className="z-[2] text-center max-w-[800px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
                Confira as{' '}
                <strong className="bg-eng-blue  rounded-md px-3 pb-2 text-white font-medium">
                  {' '}
                  informações
                </strong>{' '}
                detalhadas sobre as instituições
              </h1>

              <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>
            </div>

            <main className="z-[2]  gap-4 md:gap-8 flex flex-col  pt-0 md:pt-0 w-full">
              <div>
                <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
                  <div
                    className={`w-full px-8  border-b border-b-neutral-200 dark:border-b-neutral-800`}
                  >
                    {isOn && (
                      <div className="w-full   flex justify-between items-center">
                        <div className="w-full pt-4  flex justify-between items-center">
                          <Alert className="h-14 mt-4 mb-2  p-2 flex items-center justify-between  w-full">
                            <div className="flex items-center gap-2 w-full flex-1">
                              <MagnifyingGlass
                                size={16}
                                className=" whitespace-nowrap w-10"
                              />
                              <Input
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                                type="text"
                                className="border-0 w-full "
                              />
                            </div>
                          </Alert>
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex w-full flex-wrap pt-2 pb-3 justify-between `}
                    >
                      <div></div>

                      <div className="hidden xl:flex xl:flex-nowrap gap-2">
                        <div className="md:flex md:flex-nowrap gap-2">
                          <Link to={`/api-docs`}>
                            <Button variant="ghost" className="">
                              <File size={16} className="" />
                              Dicionário de dados
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleDownloadJson()}
                            variant="ghost"
                            className=""
                          >
                            <Download size={16} className="" />
                            Baixar resultado
                          </Button>
                        </div>

                        <div></div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsOn(!isOn)}
                        >
                          {isOn ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 px-4 md:px-8">
                  <Alert
                    className={`p-0 mb-6 bg-cover bg-no-repeat bg-center `}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total de instituições
                      </CardTitle>
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {filteredTotal.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        encontrados na busca
                      </p>
                    </CardContent>
                  </Alert>

                  <Accordion defaultValue="item-1" type="single" collapsible>
                    <AccordionItem value="item-1">
                      <div className="flex mb-2 mt-4">
                        <HeaderResultTypeHome
                          title="Instituções"
                          icon={
                            <Landmark size={24} className="text-gray-400" />
                          }
                        >
                          <div className="hidden md:flex gap-3 mr-3">
                            <Button
                              onClick={() => setTypeVisu('rows')}
                              variant={
                                typeVisu === 'block' ? 'ghost' : 'outline'
                              }
                              size={'icon'}
                            >
                              <Rows size={16} className="whitespace-nowrap" />
                            </Button>
                            <Button
                              onClick={() => setTypeVisu('block')}
                              variant={
                                typeVisu === 'block' ? 'outline' : 'ghost'
                              }
                              size={'icon'}
                            >
                              <SquaresFour
                                size={16}
                                className="whitespace-nowrap"
                              />
                            </Button>
                          </div>
                        </HeaderResultTypeHome>
                        <AccordionTrigger></AccordionTrigger>
                      </div>
                      <AccordionContent>
                        {typeVisu === 'block' ? (
                          loading ? (
                            <ResponsiveMasonry
                              columnsCountBreakPoints={{
                                350: 1,
                                750: 2,
                                900: 2,
                                1200: 3,
                                1700: 4,
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
                          ) : (
                            <div>
                              <ResponsiveMasonry
                                columnsCountBreakPoints={{
                                  350: 1,
                                  750: 2,
                                  900: 2,
                                  1200: 3,
                                  1700: 4,
                                }}
                              >
                                <Masonry
                                  gutter="16px"
                                  className="pb-4 md:pb-8 z-[1]"
                                >
                                  {filteredTotal
                                    .slice(0, count) // Filtra os itens onde `visible` é `true`
                                    .map((props, index) => {
                                      return (
                                        <InstitutionItem
                                          key={index} // Adiciona uma chave para cada item
                                          {...props}
                                          url={'/instituicao'}
                                        />
                                      );
                                    })}
                                </Masonry>
                              </ResponsiveMasonry>

                              {filteredTotal.length >= count && (
                                <div className="w-full flex justify-center pb-8">
                                  <Button
                                    className="w-fit"
                                    onClick={() => setCount(count + 12)}
                                  >
                                    <Plus size={16} />
                                    Mostrar mais
                                  </Button>
                                </div>
                              )}
                            </div>
                          )
                        ) : loading ? (
                          <Skeleton className="w-full rounded-md h-[400px]" />
                        ) : (
                          <div />
                          // <DataTable columns={columnsGraduate} data={filteredTotal.filter(item => true)} />
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </main>
          </div>
        ) : (
          <VisualizacaoInstituicao identifier={programSelecionado} />
        )}
      </>
    </>
  );
}
