import {
  Award,
  BarChartBig,
  Building,
  ChevronLeft,
  GraduationCap,
  LoaderCircle,
  SquareLibrary,
  Undo2,
  User,
  Users,
  Users2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList } from '../ui/tabs';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
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
import { Helmet } from 'react-helmet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ProducoesPrograma } from './producoes-programa';
import { LinhasPesquisaPrograma } from './linhas-pesquisa-programa';
import { useInstitution } from './hooks/use-institution-queries';
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
  const logoUrl = urlGeral.replace(/\/$/, '') + institutions?.image;
  const coverUrl = urlGeral.replace(/\/$/, '') + institutions?.cover;
  const gruposCount = institutions?.count_rg;
  const bolsistasCount = institutions?.count_foment;

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

  const getInstitutionLink = () => {
    if (!institutions?.name) return null;
    if (institutionLinks[institutions.name]) return institutionLinks[institutions.name];
    const foundKey = Object.keys(institutionLinks).find(
      (key) => institutions.name.includes(key) || key.includes(institutions.name),
    );
    return foundKey ? institutionLinks[foundKey] : null;
  };

  const handleLogoClick = () => {
    const link = getInstitutionLink();
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const handleVoltar = () => {
    navigate('/instituicao');
  };

  const siteTitle = institutions?.name ? `${institutions.name} | Simcc` : `Simcc | SECTI-BA`;
  const siteDescription = institutions?.name ? `${institutions.name} | Conectee` : `Simcc | SECTI-BA`;

  const tabs = [
    { id: 'producoes', label: 'Produções', icon: SquareLibrary },
    { id: 'docentes', label: 'Docentes', icon: Users2 },
    { id: 'programas_pos', label: 'Programas de Pós-Graduação', icon: GraduationCap },
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
  }, [value, institutions?.id, location.pathname, location.search, navigate]);

  const [loadingMessage, setLoadingMessage] = useState(
    'Estamos procurando todas as informações no nosso banco de dados, aguarde.',
  );

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    timeouts.push(setTimeout(() => setLoadingMessage('Estamos quase lá, continue aguardando...'), 5000));
    timeouts.push(setTimeout(() => setLoadingMessage('Só mais um pouco...'), 10000));
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const { onOpen } = useModal();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-full flex flex-col items-center justify-center h-full">
          <div className="text-eng-blue mb-4 animate-pulse">
            <LoaderCircle size={108} className="animate-spin" />
          </div>
          <p className="font-medium text-lg max-w-[500px] text-center">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (!institutions) {
    return (
      <div className="h-full bg-cover bg-center flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="w-full flex flex-col items-center justify-center">
          <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">(⊙_⊙)</p>
          <h1 className="text-center text-2xl md:text-4xl text-neutral-400 font-medium leading-tight tracking-tighter">
            Não foi possível acessar as <br /> informações desta instituição.
          </h1>
          <div className="flex gap-3 mt-8">
            <Button onClick={handleVoltar} variant={'ghost'}>
              <Undo2 size={16} /> Voltar
            </Button>
            <Link to={'/'}>
              <Button>Início</Button>
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

      <main className="grid grid-cols-1 bg-neutral-50 dark:bg-neutral-950 min-h-screen">
        <Tabs defaultValue={tabs[0].id} value={value} onValueChange={setValue} className="w-full">
          
          {/* BANNER DE CAPA DA INSTITUIÇÃO */}
          <div className="md:p-8 p-4 pb-0">
            <div
              style={{
                backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
              }}
              className="bg-eng-blue bg-no-repeat bg-center bg-cover border dark:border-neutral-800 w-full rounded-md h-[260px] relative"
            >
              <div className="w-full h-full relative rounded-md bg-black/30 p-4 md:p-8 flex flex-col justify-between">
                
                {/* Botão de voltar e pesquisadores no topo do banner */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handleVoltar}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white"
                  >
                    <ChevronLeft className="h-4 w-4" /> Visão da instituição
                  </Button>

                  {institutions.researchers?.length > 0 && (
                    <div className="hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      <div className="flex items-center">
                        {institutions.researchers.slice(0, 5).map((item, index) => (
                          <Avatar
                            key={item}
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpen('researcher-modal', { name: item });
                            }}
                            className="cursor-pointer rounded-full relative border border-white/20 h-7 w-7 hover:z-10 transition-transform hover:scale-110"
                            style={{ marginLeft: index > 0 ? '-8px' : '0px' }}
                          >
                            <AvatarImage className="rounded-full h-7 w-7" src={`${urlGeral}ResearcherData/Image?name=${item}`} />
                            <AvatarFallback className="flex items-center justify-center text-xs text-black">
                              <User size={12} />
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-white">
                        +{institutions.researchers.length} pesquisadores
                      </span>
                    </div>
                  )}
                </div>

                {/* Logo da Instituição flutuando na borda inferior do banner */}
                <div className="absolute -bottom-10 left-6 md:left-12">
                  <Avatar
                    onClick={handleLogoClick}
                    className={`rounded-xl h-20 w-20 md:h-24 md:w-24 bg-white dark:bg-white shadow-xl border-2 border-white dark:border-neutral-800 ${
                      getInstitutionLink() ? 'cursor-pointer hover:scale-105 transition-all' : ''
                    }`}
                    title={getInstitutionLink() ? `Visitar site da ${institutions.name}` : ''}
                  >
                    <AvatarImage
                      className="rounded-lg h-full w-full object-contain p-2 bg-white"
                      src={logoUrl || undefined}
                    />
                    <AvatarFallback className="flex items-center justify-center bg-white text-neutral-800">
                      <Building size={28} />
                    </AvatarFallback>
                  </Avatar>
                </div>

              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-6 w-full flex flex-col gap-6">
            
            {/* Nome da Instituição */}
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
              {institutions.name}
            </h1>

            {/* Cards de Indicadores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card Docentes */}
              <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-full bg-eng-blue/10 flex items-center justify-center text-eng-blue flex-shrink-0">
                  <Users2 size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
                    {(institutions as any).count_r != null
                      ? Number(String((institutions as any).count_r)).toLocaleString('pt-BR')
                      : '—'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 mt-1">Docentes</span>
                </div>
              </div>

              {/* Card Pós-graduações */}
              <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-full bg-eng-blue/10 flex items-center justify-center text-eng-blue flex-shrink-0">
                  <GraduationCap size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
                    {(institutions as any).count_gp != null
                      ? Number(String((institutions as any).count_gp)).toLocaleString('pt-BR')
                      : '—'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 mt-1">Pós-graduações</span>
                </div>
              </div>

              {/* Card Grupos de Pesquisa */}
              <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-full bg-eng-blue/10 flex items-center justify-center text-eng-blue flex-shrink-0">
                  <Users size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
                    {gruposCount != null ? Number(String(gruposCount)).toLocaleString('pt-BR') : '—'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 mt-1">Grupos de Pesquisa</span>
                </div>
              </div>

              {/* Card Bolsistas */}
              <div className="flex items-center gap-4 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                <div className="w-10 h-10 rounded-full bg-eng-blue/10 flex items-center justify-center text-eng-blue flex-shrink-0">
                  <Award size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white leading-none">
                    {bolsistasCount != null ? Number(String(bolsistasCount)).toLocaleString('pt-BR') : '—'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 mt-1">Bolsistas Produtividade</span>
                </div>
              </div>

            </div>

            {/* Barra de Abas Principal */}
            <ScrollArea className="w-full border-b border-gray-200 dark:border-neutral-800 mt-2">
              <TabsList className="bg-transparent h-auto p-0 flex gap-6 justify-start w-full rounded-none">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setValue(id)}
                    className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                      value === id
                        ? 'border-eng-blue text-eng-blue dark:text-white dark:border-white'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {/* Conteúdo Dinâmico das Abas */}
            <div className="mt-2">
              <TabsContent value="producoes" className="m-0">
                <ProducoesPrograma institutionId={institutions.id} institutionName={institutions.name} />
              </TabsContent>
              <TabsContent value="linhas_pesquisa" className="m-0">
                <LinhasPesquisaPrograma />
              </TabsContent>
              <TabsContent value="docentes" className="m-0">
                <DocentesInstitution institutionId={institutions.id} />
              </TabsContent>
              <TabsContent value="programas_pos" className="m-0">
                <ProgramasPosInstitution institutionId={institutions.id} institutionName={institutions.name} />
              </TabsContent>
              <TabsContent value="grupos_pesquisa" className="m-0">
                <GruposPesquisaInstitution institutionId={institutions.id} institutionName={institutions.name} />
              </TabsContent>
              <TabsContent value="bolsistas" className="m-0">
                <BolsistasInstitution institutionId={institutions.id} institutionName={institutions.name} />
              </TabsContent>
              <TabsContent value="indicadores" className="m-0">
                <IndicatorsGraduate />
              </TabsContent>
            </div>

          </div>
        </Tabs>
      </main>
    </>
  );
}