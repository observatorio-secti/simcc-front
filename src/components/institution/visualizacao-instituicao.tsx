import {
  Award,
  BarChartBig,
  Building,
  ChevronLeft,
  GraduationCap,
  GraduationCapIcon,
  Home,
  LoaderCircle,
  SquareLibrary,
  Undo2,
  User,
  Users,
  Users2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList } from '../ui/tabs';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserContext } from '../../context/context';
import { useModal } from '../hooks/use-modal-store';
import Highcharts from 'highcharts';
import HC_wordcloud from 'highcharts/modules/wordcloud';
import { DocentesInstitution } from './docentes-institution';
import { IndicatorsGraduate } from './indicators-graduate';
import { GruposPesquisaInstitution } from './grupos-pesquisa-institution';
import { ProgramasPosInstitution } from './programas-pos-institution';
import { BolsistasInstitution } from './bolsistas-institution';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useTheme } from 'next-themes';
import { Helmet } from 'react-helmet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ProducoesPrograma } from './producoes-programa';
import { LinhasPesquisaPrograma } from './linhas-pesquisa-programa';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { Keepo } from '../dashboard/builder-page/builder-page';
import { useParams } from 'react-router-dom';
import {
  useInstitution,
  useInstitutionBolsistas,
  useInstitutionResearchGroups,
} from './hooks/use-institution-queries';
import { Institution as InstitutionType } from '../../services/institution';

export type GraduateProgram = InstitutionType;
HC_wordcloud(Highcharts);
const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

interface VisualizacaoInstituicaoProps {
  identifier?: string;
}

export function VisualizacaoInstituicao({ identifier: propIdentifier }: VisualizacaoInstituicaoProps = {}) {

  const { urlGeral } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams<{
    acronym?: string;
    institution_id?: string;
  }>();
  const queryUrl = useQuery();

  const rawIdentifier =
    propIdentifier ||
    params.acronym ||
    params.institution_id ||
    queryUrl.get('acronym') ||
    queryUrl.get('institution_id') ||
    '';

  let effectiveIdentifier = rawIdentifier.trim();

  effectiveIdentifier = decodeURIComponent(effectiveIdentifier).trim();


  const { data: institutions, isLoading: loading } = useInstitution(effectiveIdentifier);
  const logoUrl = urlGeral.replace(/\/$/, "") + institutions?.image;
  const coverUrl = urlGeral.replace(/\/$/, "") + institutions?.cover;
  const gruposCount = institutions?.count_rg;
  const bolsistasCount = institutions?.count_foment;

  const normalizeForFilter = (str: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();


  // Mapeamento de links das instituições
  const institutionLinks: { [key: string]: string } = {
    EBMSP: 'https://www.bahiana.edu.br/',
    'Escola Bahiana de Medicina e Saúde Pública': 'https://www.bahiana.edu.br/',
    UESB: 'https://www.uesb.br/',
    'Universidade Estadual do Sudoeste da Bahia': 'https://www.uesb.br/',
    UFOB: 'https://ufob.edu.br/',
    'Universidade Federal do Oeste da Bahia': 'https://ufob.edu.br/',
    UFSB: 'https://ufsb.edu.br/',
    'Universidade Federal do Sul da Bahia': 'https://ufsb.edu.br/',
    UEFS: 'https://www.uefs.br/',
    'Universidade Estadual de Feira de Santana': 'https://www.uefs.br/',
    UESC: 'https://www.uesc.br/',
    'Universidade Estadual de Santa Cruz': 'https://www.uesc.br/',
    UFRB: 'https://ufrb.edu.br/portal/',
    'Universidade Federal do Recôncavo da Bahia': 'https://ufrb.edu.br/portal/',
    UNEB: 'https://portal.uneb.br/',
    'Universidade do Estado da Bahia': 'https://portal.uneb.br/',
  };

  const handleVoltar = () => {
    navigate('/instituicao');
  };

  const { theme } = useTheme();
  const siteTitle = institutions?.name
    ? `${institutions.name} | ${'Simcc'}`
    : `${'Simcc'} | ${'SECTI-BA'}`;
  const siteDescription = institutions?.name
    ? `${institutions.name} | Conectee`
    : `${'Simcc'} | ${'SECTI-BA'}`;
  const tabs = [
    { id: 'producoes', label: 'Produções', icon: SquareLibrary },
    { id: 'docentes', label: 'Docentes', icon: Users2 },
    {
      id: 'programas_pos',
      label: 'Programas de Pós-Graduação',
      icon: GraduationCap,
    },
    { id: 'grupos_pesquisa', label: 'Grupos de Pesquisa', icon: Users },
    { id: 'bolsistas', label: 'Bolsistas de Produtividade', icon: Award },
    { id: 'indicadores', label: 'Indicadores', icon: BarChartBig },
  ];
  const tab = queryUrl.get('pagina');
  const [value, setValue] = useState(tab || tabs[0].id);

  useEffect(() => {
    const currentParams = new URLSearchParams(location.search);
    currentParams.set('pagina', value);
    if (institutions?.id) {
      currentParams.set('institution_id', institutions.id);
    }
    navigate(
      {
        pathname: location.pathname,
        search: currentParams.toString(),
      },
      { replace: true },
    );
  }, [value, institutions?.id]);
  const [loadingMessage, setLoadingMessage] = useState(
    'Estamos procurando todas as informações no nosso banco de dados, aguarde.',
  );
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    setLoadingMessage(
      'Estamos procurando todas as informações no nosso banco de dados, aguarde.',
    );
    timeouts.push(
      setTimeout(() => {
        setLoadingMessage('Estamos quase lá, continue aguardando...');
      }, 5000),
    );
    timeouts.push(
      setTimeout(() => {
        setLoadingMessage('Só mais um pouco...');
      }, 10000),
    );
    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          'Está demorando mais que o normal... estamos tentando encontrar tudo.',
        );
      }, 15000),
    );
    timeouts.push(
      setTimeout(() => {
        setLoadingMessage(
          'Estamos empenhados em achar todos os dados, aguarde só mais um pouco',
        );
      }, 15000),
    );
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);


  const { onOpen } = useModal();

  const getInstitutionLink = () => {
    if (!institutions?.name) return null;

    if (institutionLinks[institutions.name]) {
      return institutionLinks[institutions.name];
    }

    const foundKey = Object.keys(institutionLinks).find(
      (key) =>
        institutions.name.includes(key) ||
        key.includes(institutions.name),
    );
    return foundKey ? institutionLinks[foundKey] : null;
  };

  const handleLogoClick = () => {
    const link = getInstitutionLink();
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-full flex flex-col items-center justify-center h-full">
          <div className="text-eng-blue mb-4 animate-pulse">
            <LoaderCircle size={108} className="animate-spin" />
          </div>
          <p className="font-medium text-lg max-w-[500px] text-center">
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }
  if (!institutions) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">
            (⊙_⊙)
          </p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
            Não foi possível acessar as <br /> informações desta instituição.
          </h1>
          <div className="flex gap-3 mt-8">
            <Button onClick={handleVoltar} variant={'ghost'}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Link to={'/'}>
              {' '}
              <Button>
                <Home size={16} /> Página Inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <main className="grid grid-cols-1 ">
        <Tabs defaultValue={tabs[0].id} value={value} className="">
          <div className="md:p-8 p-4 pb-0">
            <div
              style={{
                backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
              }}
              className="bg-eng-blue bg-no-repeat bg-center bg-cover border dark:border-neutral-800 w-full rounded-md h-[300px]"
            >
              <div
                className={`w-full h-full relative rounded-md bg-black/25 pb-0 md:pb-0 p-4 md:p-8 flex-col flex justify-between `}
              >
                <div
                  className="
flex flex-col items-center gap-4 justify-between
md:flex-row
"
                >
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVoltar}
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 text-eng-blue hover:text-eng-blue"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Voltar</span>
                    </Button>
                    <div
                      className="
flex flex-col gap-4
md:flex-col
lg:flex-row
"
                    >
                      <h1 className="flex-1 shrink-0 text-white whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Visão da instituição
                      </h1>
                      {institutions.researchers?.length > 0 && (
                        <div className=" hidden justify-between items-center md:flex">
                          <div className="flex items-center">
                            {institutions.researchers
                              .slice(0, 5)
                              .map((item, index) => (
                                <Avatar
                                  key={item}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    onOpen('researcher-modal', { name: item });
                                  }}
                                  className="cursor-pointer rounded-full relative border dark:border-neutral-800 h-8 w-8 hover:z-10 transition-transform hover:scale-110"
                                  style={{
                                    marginLeft: index > 0 ? '-10px' : '0px',
                                  }}
                                >
                                  <AvatarImage
                                    className="rounded-md h-8 w-8"
                                    src={`${urlGeral}ResearcherData/Image?name=${item}`}
                                  />
                                  <AvatarFallback className="flex items-center justify-center">
                                    <User size={16} />
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                            {institutions.researchers.length > 5 && (
                              <div
                                className="h-8 w-8 flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-neutral-800 rounded-full border dark:border-neutral-700 text-xs font-medium"
                                style={{ marginLeft: '-10px' }}
                              >
                                +{institutions.researchers.length - 5}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end items-end flex-1 w-full ">
                  <div className="flex justify-between w-full gap-8">
                    <div className="absolute">
                      <Avatar
                        onClick={handleLogoClick}
                        style={{ backgroundColor: 'white' }}
                        className={`rounded-lg h-24 w-24 relative -top-12 xl:top-0 bg-white dark:bg-white ${getInstitutionLink() ? 'cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out ring-2 ring-transparent hover:ring-white/50' : ''}`}
                        title={
                          getInstitutionLink()
                            ? `Visitar site da ${institutions.name}`
                            : ''
                        }
                      >
                        <AvatarImage
                          style={{ backgroundColor: 'white' }}
                          className={'rounded-md h-24 w-24 object-contain bg-white dark:bg-white p-1'}
                          src={logoUrl || undefined}
                        />
                        <AvatarFallback
                          style={{ backgroundColor: 'white' }}
                          className="flex items-center justify-center bg-white dark:bg-white"
                        >
                          <Building size={24} />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="  w-24 min-w-24"></div>
                    <div className="relative  grid-cols-1 hidden xl:grid">
                      <ScrollArea className="relative overflow-x-auto">
                        <TabsList className="p-0 justify-start flex gap-2 h-auto bg-transparent dark:bg-transparent">
                          {tabs.map(({ id, label, icon: Icon }) => (
                            <div
                              key={id}
                              className={`pb-2 border-b-2 text-black dark:text-white transition-all ${value === id
                                ? 'border-b-white dark:border-b-neutral-800'
                                : 'border-b-transparent'
                                }`}
                              onClick={() => setValue(id)}
                            >
                              <Button
                                variant="ghost"
                                className={`m-0 text-white hover:text-eng-blue dark:hover:text-eng-blue ${value === id ? 'bg-white dark:bg-neutral-800 text-eng-blue' : ''}`}
                              >
                                <Icon size={16} />
                                {label}
                              </Button>
                            </div>
                          ))}
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                      <div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:gap-8  z-[2] pt-8 md:p-0">
            <div className="flex justify-between  md:px-8 items-center ">
              <div className="flex flex-col  gap-6 mt-8 px-8">
                <div>
                  <h1 className="text-2xl mb-2 max-w-[800px] font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                    {institutions.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 md:gap-6 mt-4">
                    {[
                      {
                        label: 'Docentes',
                        value: (institutions as any).count_r,
                        icon: Users,
                      },
                      {
                        label: 'Pós-graduações',
                        value: (institutions as any).count_gp,
                        icon: GraduationCap,
                      },
                      {
                        label: 'Grupos de Pesquisa',
                        value: gruposCount,
                        icon: Users,
                      },
                      {
                        label: 'Bolsistas Produtividade',
                        value: bolsistasCount,
                        icon: Award,
                      },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-2">
                        <Icon size={16} className="text-muted-foreground shrink-0" aria-hidden />
                        <span className="text-sm text-muted-foreground">{label}:</span>
                        <span className="text-xl md:text-2xl font-bold tracking-tight leading-none">
                          {value != null ? Number(String(value)).toLocaleString('pt-BR') : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:hidden">
              <div className="px-8 md:px-8 xl:hidden">
                <div className="relative grid grid-cols-1 xl:hidden">
                  <ScrollArea className="relative w-full overflow-x-auto">
                    <div className="flex w-full gap-2">
                      <TabsList className="p-0 justify-start flex gap-2 h-auto bg-transparent dark:bg-transparent border pt-2 px-2 dark:bg-neutral-800 w-full">
                        {tabs.map(({ id, label, icon: Icon }) => (
                          <div
                            key={id}
                            className={`pb-2 border-b-2 text-black dark:text-white transition-all ${value === id
                              ? 'border-b-[#719CB8]'
                              : 'border-b-transparent'
                              }`}
                            onClick={() => setValue(id)}
                          >
                            <Button variant="ghost" className="m-0">
                              <Icon size={16} />
                              {label}
                            </Button>
                          </div>
                        ))}
                      </TabsList>
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                  <div></div>
                </div>
              </div>
            </div>
            <TabsContent value="visao_geral" className="m-0"></TabsContent>
            <TabsContent value="producoes" className="m-0">
              <ProducoesPrograma />
            </TabsContent>
            <TabsContent value="linhas_pesquisa" className="m-0">
              <LinhasPesquisaPrograma />
            </TabsContent>
            <TabsContent value="docentes" className="m-0">
              <DocentesInstitution institutionId={institutions.id} />
            </TabsContent>
            <TabsContent value="programas_pos" className="m-0">
              <ProgramasPosInstitution
                institutionId={institutions.id}
                institutionName={institutions.name}
              />
            </TabsContent>
            <TabsContent value="grupos_pesquisa" className="m-0">
              <GruposPesquisaInstitution
                institutionId={institutions.id}
                institutionName={institutions.name}
              />
            </TabsContent>
            <TabsContent value="bolsistas" className="m-0">
              <BolsistasInstitution
                institutionId={institutions.id}
                institutionName={institutions.name}
              />
            </TabsContent>
            <TabsContent value="indicadores" className="m-0">
              <IndicatorsGraduate />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </>
  );
}
