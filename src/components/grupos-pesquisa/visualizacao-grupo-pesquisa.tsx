import { useLocation, useNavigate } from 'react-router-dom';

import { Button } from '../ui/button';
import {
  Building,
  Building2,
  Calendar,
  ChevronLeft,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Shapes,
  SquareArrowOutUpRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import MapaResearcher from '../homepage/categorias/researchers-home/mapa-researcher';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

import { Rows, SquaresFour, Users } from 'phosphor-react';
import { Skeleton } from '../ui/skeleton';
import { TableReseracherhome } from '../homepage/categorias/researchers-home/table-reseracher-home';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useModal } from '../hooks/use-modal-store';
import { Helmet } from 'react-helmet';
import { ResearchItem } from '../homepage/categorias/researchers-home/researcher-item';
import { apiOda, hasOdaBase } from '../../lib/api';
import {
  firstOdaValue,
  formatInstituicao,
  normalizeOdaGrupo,
} from '../../services/grupos-pesquisa';

import { InfiniteMovingResearchers } from '../ui/infinite-moving-researcher';
import { HeaderResultTypeHome } from '../homepage/categorias/header-result-type-home';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface Patrimonio {
  area: string;
  institution: string;
  first_leader: string;
  first_leader_id: string | null;
  second_leader: string | null;
  second_leader_id: string | null;
  name: string;
  id: string;
  census?: string | null;
  start_of_collection?: string | null;
  end_of_collection?: string | null;
  group_identifier?: string | null;
  year?: string | null;
  institution_name?: string | null;
  category?: string | null;
}

type Research = {
  among: number;
  articles: number;
  book: number;
  book_chapters: number;
  id: string;
  name: string;
  university: string;
  lattes_id: string;
  area: string;
  lattes_10_id: string;
  abstract: string;
  city: string;
  orcid: string;
  image: string;
  graduation: string;
  patent: string;
  software: string;
  brand: string;
  lattes_update: Date;

  h_index: string;
  relevance_score: string;
  works_count: string;
  cited_by_count: string;
  i10_index: string;
  scopus: string;
  openalex: string;

  subsidy: Bolsistas[];
  graduate_programs: GraduatePrograms[];
  departments: Departments[];
  research_groups: ResearchGroups[];

  cargo: string;
  clas: string;
  classe: string;
  rt: string;
  situacao: string;
  imageUrl?: string | null;
};

interface Bolsistas {
  aid_quantity: string;
  call_title: string;
  funding_program_name: string;
  modality_code: string;
  category_level_code: string;
  institute_name: string;
  modality_name: string;
  scholarship_quantity: string;
}

interface GraduatePrograms {
  graduate_program_id: string;
  name: string;
}

interface Departments {
  dep_des: string;
  dep_email: string;
  dep_nom: string;
  dep_id: string;
  dep_sigla: string;
  dep_site: string;
  dep_tel: string;
  img_data: string;
}

interface ResearchGroups {
  area: string;
  group_id: string;
  name: string;
}

interface LinhasPesquisa {
  area: string;
  keywords: string;
  line: string;
  major_area: string;
  objective: string;
}

export function VisualizacaoGrupo() {
  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  };

  const queryUrl = useQuery();
  const type_search = queryUrl.get('group_id');
  const { urlGeral, urlGeral2 } = useContext(UserContext);

  const [graduatePrograms, setGraduatePrograms] = useState<Patrimonio[]>([]);
  const [linhasPesquisa, setLinhasPesquisa] = useState<LinhasPesquisa[]>([]);
  const [usedOdaDetail, setUsedOdaDetail] = useState(false);
  const [odaRaw, setOdaRaw] = useState<any>(null);
  const isOdaActive = usedOdaDetail && odaRaw != null;

  const urlGraduateProgram = `${urlGeral}research_group?group_id=${type_search}`;

  useEffect(() => {
    if (!type_search) return;
    let cancelled = false;
    const fetchData = async () => {
      if (hasOdaBase()) {
        try {
          const { data, status } = await apiOda.get(
            `grupos-pesquisa/${type_search}`,
          );
          if (status === 200 && data && (data as any).id) {
            const raw: any = data;
            setGraduatePrograms([normalizeOdaGrupo(raw)]);
            setOdaRaw(raw);
            const linhas = Array.isArray(raw.linhasPesquisa)
              ? raw.linhasPesquisa.map((l: any) => ({
                  line: l.titulo || '',
                  area: '',
                  keywords: '',
                  major_area: '',
                  objective: l.objetivo || '',
                }))
              : [];
            setLinhasPesquisa(linhas);
            setUsedOdaDetail(true);
            return;
          }
          throw new Error('ODA empty detail');
        } catch {
          setUsedOdaDetail(false);
          setOdaRaw(null);
        }
      }
      try {
        const response = await fetch(urlGraduateProgram, {
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
        if (!cancelled && data) {
          setGraduatePrograms(Array.isArray(data) ? data : [data]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [urlGraduateProgram, type_search]);

  const urlLinhasPequisa = `${urlGeral}research_group_lines?group_id=${type_search}`;

  useEffect(() => {
    if (!type_search || usedOdaDetail) return;
    const fetchData = async () => {
      try {
        const response = await fetch(urlLinhasPequisa, {
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
          setLinhasPesquisa(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlLinhasPequisa, type_search, usedOdaDetail]);

  //
  const [researcher, setResearcher] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeVisu, setTypeVisu] = useState('block');

  // Estado separado para todos os pesquisadores do grupo (para o carrossel)
  const [allResearchers, setAllResearchers] = useState<Research[]>([]);
  const [loadingAllResearchers, setLoadingAllResearchers] = useState(false);

  // Buscar todos os pesquisadores do grupo para o carrossel (ODA primeiro, fallback legado)
  useEffect(() => {
    const fetchAllResearchers = async () => {
      if (!type_search) return;

      setLoadingAllResearchers(true);

      if (hasOdaBase()) {
        try {
          const all: Research[] = [];
          let page = 1;
          let totalPages = Infinity;
          while (page <= totalPages && page <= 20) {
            const { data, status } = await apiOda.get(
              `grupos-pesquisa/${type_search}/pesquisadores`,
              { params: { page, size: 100 } },
            );
            if (status !== 200) throw new Error(`ODA status ${status}`);
            const raw: any = data;
            const arr = Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.data)
                ? raw.data
                : [];
            if (page === 1 && arr.length === 0) throw new Error('ODA empty');
            const odaBase = (
              apiOda.defaults.baseURL || ''
            ).replace(/\/$/, '');
            all.push(
              ...arr.map((m: any) => {
                const img = m.imageUrl
                  ? m.imageUrl.startsWith('http')
                    ? m.imageUrl
                    : `${odaBase}${m.imageUrl.startsWith('/') ? '' : '/'}${m.imageUrl}`
                  : null;
                return {
                  id: m.id || '',
                  name: m.nome || '',
                  graduation: m.formacaoAcademica || '',
                  lattes_id: m.lattesId || '',
                  orcid: m.orcidId || '',
                  imageUrl: img,
                } as Research;
              }),
            );
            const tp = raw?.meta?.totalPages;
            if (tp != null) {
              totalPages = tp;
              if (page >= totalPages) break;
            } else if (arr.length < 100) break;
            page += 1;
          }
          if (all.length > 0) {
            setAllResearchers(all);
            return;
          }
          throw new Error('ODA empty');
        } catch {
          // cai para o legado abaixo
        }
      }

      try {
        const response = await fetch(
          `${urlGeral}researcher?group_id=${type_search}`,
          {
            mode: 'cors',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'text/plain',
            },
          },
        );

        const data = await response.json();
        setAllResearchers(Array.isArray(data) ? data : data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingAllResearchers(false);
      }
    };

    fetchAllResearchers();
  }, [type_search, urlGeral, urlGeral2]);

  // Filtrar pesquisadores do carrossel para excluir os líderes
  const filteredResearchers = allResearchers.filter((researcher) => {
    if (graduatePrograms.length === 0) return true;

    const { first_leader, second_leader } = graduatePrograms[0];
    return (
      researcher.name !== first_leader && researcher.name !== second_leader
    );
  });

  useEffect(() => {
    const fetchResearchers = async () => {
      if (graduatePrograms.length === 0) return;

      const { first_leader, second_leader } = graduatePrograms[0];
      setLoading(true);

      try {
        // Fetch data for first_leader (mantido na API legada)
        const firstResponse = await fetch(
          `${urlGeral}researcherName?name=${encodeURIComponent(first_leader)}`,
          {
            mode: 'cors',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'text/plain',
            },
          },
        );

        const firstData = await firstResponse.json();

        // Fetch data for second_leader if exists (trata null/"" / "nan")
        let secondData = [];
        if (
          second_leader &&
          second_leader.trim() !== '' &&
          second_leader.toLowerCase() !== 'nan' &&
          second_leader.toLowerCase() !== 'null'
        ) {
          const secondResponse = await fetch(
            `${urlGeral}researcherName?name=${encodeURIComponent(second_leader)}`,
            {
              mode: 'cors',
              headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '3600',
                'Content-Type': 'text/plain',
              },
            },
          );

          secondData = await secondResponse.json();
        }

        // Combine results
        setResearcher([...firstData, ...secondData]);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchers();
  }, [graduatePrograms]);

  const items = Array.from({ length: 2 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  const qualisColor: { [key: string]: string } = {
    ASTRONOMIA: 'bg-red-200',
    FÍSICA: 'bg-blue-200',
    GEOCIÊNCIAS: 'bg-green-200',
    MATEMÁTICA: 'bg-yellow-200',
    OCEANOGRAFIA: 'bg-teal-200',
    'PROBABILIDADE E ESTATÍSTICA': 'bg-purple-200',
    QUÍMICA: 'bg-orange-200',
    AGRONOMIA: 'bg-red-800',
    'CIÊNCIA E TECNOLOGIA DE ALIMENTOS': 'bg-blue-800',
    'ENGENHARIA AGRÍCOLA': 'bg-green-800',
    'MEDICINA VETERINÁRIA': 'bg-yellow-800',
    'RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL': 'bg-teal-800',
    'RECURSOS PESQUEIROS E ENGENHARIA DE PESCA': 'bg-purple-800',
    ZOOTECNIA: 'bg-orange-800',
    BIOFÍSICA: 'bg-red-600',
    'BIOLOGIA GERAL': 'bg-blue-600',
    BIOQUÍMICA: 'bg-green-600',
    BIOTECNOLOGIA: 'bg-yellow-600',
    BOTÂNICA: 'bg-teal-600',
    ECOLOGIA: 'bg-purple-600',
    FARMACOLOGIA: 'bg-orange-600',
    FISIOLOGIA: 'bg-red-400',
    GENÉTICA: 'bg-blue-400',
    IMUNOLOGIA: 'bg-green-400',
    MICROBIOLOGIA: 'bg-yellow-400',
    MORFOLOGIA: 'bg-teal-400',
    PARASITOLOGIA: 'bg-purple-400',
    ZOOLOGIA: 'bg-orange-400',
    'EDUCAÇÃO FÍSICA': 'bg-red-300',
    ENFERMAGEM: 'bg-blue-300',
    FARMÁCIA: 'bg-green-300',
    'FISIOTERAPIA E TERAPIA OCUPACIONAL': 'bg-yellow-300',
    FONOAUDIOLOGIA: 'bg-teal-300',
    MEDICINA: 'bg-purple-300',
    NUTRIÇÃO: 'bg-orange-300',
    ODONTOLOGIA: 'bg-red-100',
    'SAÚDE COLETIVA': 'bg-blue-100',
    ANTROPOLOGIA: 'bg-green-100',
    ARQUEOLOGIA: 'bg-yellow-100',
    'CIÊNCIA POLÍTICA': 'bg-teal-100',
    EDUCAÇÃO: 'bg-purple-100',
    FILOSOFIA: 'bg-orange-100',
    GEOGRAFIA: 'bg-red-900',
    HISTÓRIA: 'bg-blue-900',
    PSICOLOGIA: 'bg-green-900',
    SOCIOLOGIA: 'bg-yellow-900',
    TEOLOGIA: 'bg-teal-900',
    'CIÊNCIA DA COMPUTAÇÃO': 'bg-purple-900',
    'DESENHO INDUSTRIAL': 'bg-orange-900',
    'ENGENHARIA AEROESPACIAL': 'bg-red-500',
    'ENGENHARIA BIOMÉDICA': 'bg-blue-500',
    'ENGENHARIA CIVIL': 'bg-green-500',
    'ENGENHARIA DE ENERGIA': 'bg-yellow-500',
    'ENGENHARIA DE MATERIAIS E METALÚRGICA': 'bg-teal-500',
    'ENGENHARIA DE MINAS': 'bg-purple-500',
    'ENGENHARIA DE PRODUÇÃO': 'bg-orange-500',
    'ENGENHARIA DE TRANSPORTES': 'bg-red-700',
    'ENGENHARIA ELÉTRICA': 'bg-blue-700',
    'ENGENHARIA MECÂNICA': 'bg-green-700',
    'ENGENHARIA NAVAL E OCEÂNICA': 'bg-yellow-700',
    'ENGENHARIA NUCLEAR': 'bg-teal-700',
    'ENGENHARIA QUÍMICA': 'bg-purple-700',
    'ENGENHARIA SANITÁRIA': 'bg-orange-700',
    ARTES: 'bg-red-50',
    LETRAS: 'bg-blue-50',
    LINGÜÍSTICA: 'bg-green-50',
    BIOÉTICA: 'bg-yellow-50',
    'CIÊNCIAS AMBIENTAIS': 'bg-teal-50',
    DEFESA: 'bg-purple-50',
    'DIVULGAÇÃO CIENTÍFICA': 'bg-orange-50',
    MICROELETRÔNICA: 'bg-red-700',
    'ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO': 'bg-blue-700',
    'SEGURANÇA CONTRA INCÊNDIO': 'bg-green-700',
    ADMINISTRAÇÃO: 'bg-yellow-700',
    'ARQUITETURA E URBANISMO': 'bg-teal-700',
    'CIÊNCIA DA INFORMAÇÃO': 'bg-purple-700',
    COMUNICAÇÃO: 'bg-orange-700',
    DEMOGRAFIA: 'bg-red-100',
    DIREITO: 'bg-blue-100',
    ECONOMIA: 'bg-green-100',
    'ECONOMIA DOMÉSTICA': 'bg-yellow-100',
    MUSEOLOGIA: 'bg-teal-100',
    'PLANEJAMENTO URBANO E REGIONAL': 'bg-purple-100',
    'SERVIÇO SOCIAL': 'bg-orange-100',
    TURISMO: 'bg-red-200',
  };

  const normalizeArea = (area: string): string => {
    return area.toUpperCase(); // Converte para maiúsculas
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const [count, setCount] = useState(12);
  const { onOpen } = useModal();

  return (
    <main className="flex flex-1 flex-col gap-4 md:gap-8 ">
      <Helmet>
        <title>
          {graduatePrograms[0]?.name
            ? `${graduatePrograms[0].name} | ${'Simcc'}`
            : `${'Simcc'} | ${'SECTI-BA'}`}
        </title>
        <meta
          name="description"
          content={
            graduatePrograms[0]?.name
              ? `${graduatePrograms[0].name} | Conectee`
              : `${'Simcc'} | ${'SECTI-BA'}`
          }
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="w-full  gap-4 md:p-8 p-4 pb-0 md:pb-0">
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
            Grupo de pesquisa
          </h1>

          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            {(() => {
              const dgpId = graduatePrograms[0]?.group_identifier;
              const dgpUrl = dgpId ? `https://dgp.cnpq.br/dgp/espelhogrupo/${dgpId}` : null;
              return (
                <Button
                  size="sm"
                  disabled={!dgpUrl}
                  onClick={() => dgpUrl && window.open(dgpUrl, '_blank')}
                  title={dgpUrl ? `Abrir DGP: ${dgpId}` : 'Identificador DGP não disponível para este grupo'}
                >
                  <SquareArrowOutUpRight size={16} />
                  Visitar página do grupo no DGP CNPq
                </Button>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="md:p-8 p-4 py-0 md:py-0 ">
        <h1 className=" max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]  md:block mb-3 ">
          {graduatePrograms.map((props) => (
            <>{props.name}</>
          ))}
        </h1>

        {graduatePrograms.map((props) => (
          <div className="flex flex-wrap gap-4 items-center">
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <Shapes size={12} />
              {props.area}
            </div>
            <div
              className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center capitalize"
              title={props.institution_name || undefined}
            >
              <Building size={12} />
              {props.institution}
            </div>
            {props.category && (
              <Badge variant="secondary" className="text-xs">
                {props.category}
              </Badge>
            )}
            {isOdaActive && odaRaw?.situacao && (
              <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                <div
                  className={`rounded-md h-4 w-4 ${String(odaRaw.situacao).toUpperCase() === 'ATIVO' ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <span className="capitalize">
                  {String(odaRaw.situacao).replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
            )}
            {props.year && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="outline-none">
                    <div className="py-2 px-4 border border-neutral-200 bg-white dark:bg-black dark:border-neutral-800 rounded-md text-xs flex gap-2 items-center">
                      <Calendar size={12} /> Criado em {props.year}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ano de formação do grupo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {props.census && (
              <Badge variant="outline" className="text-xs">
                Censo {props.census}
              </Badge>
            )}
            {(props.start_of_collection || props.end_of_collection) && (
              <span className="text-xs text-muted-foreground">
                Período coleta: {props.start_of_collection ? formatDate(props.start_of_collection) : '—'} até{' '}
                {props.end_of_collection ? formatDate(props.end_of_collection) : '—'}
              </span>
            )}
          </div>
        ))}
      </div>

      {isOdaActive &&
        (() => {
          const hasRepercussao =
            odaRaw?.repercussao &&
            String(odaRaw.repercussao).trim().length > 30;
          const parceiras = (
            Array.isArray(odaRaw?.instituicoes) ? odaRaw.instituicoes : []
          ).filter((inst: any) => inst.tipoRelacao !== 'SEDE');
          if (!hasRepercussao && parceiras.length === 0) return null;
          return (
            <div className="px-4 md:px-8 grid gap-4 md:grid-cols-2">
              {hasRepercussao && (
                <Alert className="p-0 md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-sm font-medium">
                        Repercussão
                      </CardTitle>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText size={20} className="text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {String(odaRaw.repercussao)}
                    </p>
                  </CardContent>
                </Alert>
              )}

              {parceiras.length > 0 && (
                <Alert className="p-0 md:col-span-2">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-sm font-medium">
                        Instituições parceiras
                      </CardTitle>
                      <CardDescription>
                        Parcerias do grupo por sede
                      </CardDescription>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <Building2
                        size={20}
                        className="text-muted-foreground"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {parceiras.map((inst: any) => (
                      <Badge
                        key={
                          inst.id || `${inst.sigla}-${inst.nome}`
                        }
                        variant="outline"
                        className="text-xs"
                        title={
                          [
                            inst.unidade?.nome &&
                              `Unidade: ${inst.unidade.nome}`,
                            inst.estado?.nome &&
                              `Estado: ${inst.estado.nome}`,
                          ]
                            .filter(Boolean)
                            .join(' • ') || undefined
                        }
                      >
                        {formatInstituicao(inst.sigla, inst.nome)}
                      </Badge>
                    ))}
                  </CardContent>
                </Alert>
              )}
            </div>
          );
        })()}

      <div className="px-4 md:px-8">
        <div>
          <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
              <div className="flex mb-2">
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-2xl font-medium">Líderes</h3>
                  <div className="flex gap-3 mr-3">
                    <Button
                      className="hidden md:flex"
                      onClick={() => setTypeVisu('rows')}
                      variant={typeVisu === 'block' ? 'ghost' : 'outline'}
                      size={'icon'}
                    >
                      <Rows size={16} className="whitespace-nowrap" />
                    </Button>
                    <Button
                      onClick={() => setTypeVisu('block')}
                      variant={typeVisu === 'block' ? 'outline' : 'ghost'}
                      size={'icon'}
                    >
                      <SquaresFour size={16} className="whitespace-nowrap" />
                    </Button>
                  </div>
                </div>
                <AccordionTrigger />
              </div>
              <AccordionContent>
                {typeVisu === 'block' ? (
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
                          <div key={index}>{item}</div>
                        ))}
                      </Masonry>
                    </ResponsiveMasonry>
                  ) : (
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
                        {researcher.slice(0, count).map((item: any) => (
                          <ResearchItem
                            key={item.id}
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
                            speaker={item.speaker}
                            h_index={item.h_index}
                            relevance_score={item.relevance_score}
                            works_count={item.works_count}
                            cited_by_count={item.cited_by_count}
                            i10_index={item.i10_index}
                            scopus={item.scopus}
                            openalex={item.openalex}
                            departament={item.departament}
                            departments={item.departaments}
                            subsidy={item.subsidy}
                            status={item.status}
                            graduate_programs={item.graduate_programs}
                          />
                        ))}
                      </Masonry>
                    </ResponsiveMasonry>
                  )
                ) : loading ? (
                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableReseracherhome researcher={researcher} />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-6">
          <div className="py-4">
            <HeaderResultTypeHome
              title="Pesquisadores"
              icon={<Users size={24} className="text-gray-400" />}
            />
          </div>

          <InfiniteMovingResearchers
            items={filteredResearchers}
            direction="right"
            speed="normal"
            pauseOnHover={true}
            className="custom-class"
          />
        </div>

        {isOdaActive &&
          (() => {
            const email = firstOdaValue(odaRaw?.email);
            const telefone = firstOdaValue(odaRaw?.telefone);
            const website = firstOdaValue(odaRaw?.website);
            if (!email && !telefone && !website) return null;
            const siteHref =
              website &&
              (/^https?:\/\//i.test(website)
                ? website
                : `https://${website}`);
            return (
              <Alert className="p-0 mt-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-medium">
                      Contato
                    </CardTitle>
                    <CardDescription>
                      E-mail • telefone • site
                    </CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <Mail size={20} className="text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      className="flex gap-2 items-center font-normal hover:underline break-all"
                    >
                      <Mail
                        size={16}
                        className="text-muted-foreground shrink-0"
                      />
                      {email}
                    </a>
                  )}
                  {telefone && (
                    <span className="flex gap-2 items-center font-normal">
                      <Phone
                        size={16}
                        className="text-muted-foreground shrink-0"
                      />
                      {telefone}
                    </span>
                  )}
                  {website && siteHref && (
                    <a
                      href={siteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-2 items-center font-normal hover:underline break-all"
                      title={website}
                    >
                      <Globe
                        size={16}
                        className="text-muted-foreground shrink-0"
                      />
                      {website}
                    </a>
                  )}
                </CardContent>
              </Alert>
            );
          })()}

        {isOdaActive &&
          (() => {
            const logradouro = firstOdaValue(odaRaw?.logradouro);
            const numero = firstOdaValue(odaRaw?.numero);
            const bairro = firstOdaValue(odaRaw?.bairro);
            const cidade = firstOdaValue(odaRaw?.cidade);
            const uf = firstOdaValue(odaRaw?.uf);
            const cep = firstOdaValue(odaRaw?.cep);
            const lat = firstOdaValue(odaRaw?.latitude);
            const lng = firstOdaValue(odaRaw?.longitude);
            const hasAddress =
              logradouro || bairro || cidade || uf || cep;
            const hasCoords =
              lat != null &&
              lng != null &&
              Number(lat) !== 0 &&
              Number(lng) !== 0 &&
              !Number.isNaN(Number(lat)) &&
              !Number.isNaN(Number(lng));
            if (!hasAddress && !hasCoords) return null;
            const addressLine = [
              logradouro && numero
                ? `${logradouro}, ${numero}`
                : logradouro || null,
              bairro,
              cidade && uf ? `${cidade} - ${uf}` : cidade || uf,
              cep && `CEP ${cep}`,
            ]
              .filter(Boolean)
              .join(' • ');
            return (
              <Alert className="p-0 overflow-hidden mt-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-medium">
                      Endereço
                    </CardTitle>
                    <CardDescription>
                      Localização da sede
                    </CardDescription>
                  </div>
                  <div className="p-2 rounded-lg bg-muted">
                    <MapPin size={20} className="text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {addressLine && (
                    <p className="text-sm text-muted-foreground">
                      {addressLine}
                    </p>
                  )}
                  {hasCoords ? (
                    <div className="rounded-md overflow-hidden border">
                      <MapaResearcher
                        heightClass="h-[300px] w-full"
                        cityData={[
                          {
                            nome:
                              (cidade as string) ||
                              graduatePrograms[0]?.name ||
                              'Sede',
                            latitude: Number(lat),
                            longitude: Number(lng),
                            pesquisadores: 1,
                            professores: [
                              graduatePrograms[0]?.name || 'Grupo',
                            ],
                          },
                        ]}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Localização no mapa indisponível para este grupo.
                    </p>
                  )}
                </CardContent>
              </Alert>
            );
          })()}
      </div>

      {linhasPesquisa.length != 0 && (
        <div className="px-4 md:px-8">
          <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
              <div className="flex mb-2">
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-2xl font-medium">Linhas de pesquisa</h3>
                </div>
                <AccordionTrigger />
              </div>
              <AccordionContent>
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 1, 900: 1, 1200: 1 }}
                >
                  <Masonry gutter="16px">
                    {linhasPesquisa.slice(0, count).map((props) => (
                      <div
                        className="flex w-full"
                        key={`${props.line}-${props.area}`}
                      >
                        <div
                          className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[120px] border-neutral-200 border-r-0 ${qualisColor[normalizeArea(props.area || '')]} min-h-full relative`}
                        />
                        <Alert className="rounded-l-none">
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-2 justify-between">
                            {props.area}
                            {props.major_area && (
                              <span className="text-xs text-muted-foreground">• {props.major_area}</span>
                            )}
                          </p>
                          <h5 className="font-semibold mb-2">{props.line}</h5>
                          {props.objective && (
                            <p className="text-sm text-muted-foreground mb-3">{props.objective}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-4">
                            {(props.keywords || '')
                              .split(';')
                              .map((item) => item.trim())
                              .filter(Boolean)
                              .map((item, index) => (
                                <Badge key={String(index)} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                          </div>
                        </Alert>
                      </div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>

                {linhasPesquisa.length > count && (
                  <div className="w-full flex justify-center mt-8">
                    <Button onClick={() => setCount(count + 12)}>
                      <Plus size={16} />
                      Mostrar mais
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </main>
  );
}
