import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import {
  ArrowRight,
  BarChartBig,
  ChevronLeft,
  GraduationCap,
  Home,
  Info,
  Search,
  SquareArrowOutUpRight,
  UserCog,
} from 'lucide-react';
import { Tabs, TabsContent } from '../ui/tabs'; // Removido TabsList e TabsTrigger que não estavam sendo usados no seu layout
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import { useQuery } from '../dashboard/builder-page/tabelas/tabela-artigos';
import { Alert } from '../ui/alert';
import bg_popup from '../../assets/bg_indicadores.png';
import { Badge } from '../ui/badge';

export function ContentIndicators() {
  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  };

  const tabs = [
    { id: 'home', label: 'Menu inicial', icon: Home },
    {
      id: 'indicadores_producao',
      label: 'Indicadores de produção',
      icon: BarChartBig,
      condition: true,
      link: 'https://app.powerbi.com/view?r=eyJrIjoiMDhmMDg2ZjQtZGExMy00ZGQ4LTlkZTgtZDdhZTYzMmQ0MWQ2IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    },
    {
      id: 'busca_informacoes',
      label: 'Busca de informações',
      icon: Search,
      condition: true,
      link: 'https://app.powerbi.com/view?r=eyJrIjoiMDJjZDg1OTQtNjZiZi00NWFkLThkMGItOTk2MWM4YTJiYTFkIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    },
    {
      id: 'programa_pos_praduacao',
      label: 'Programas de pós-graduação',
      icon: GraduationCap,
      condition: true,
      link: 'https://app.powerbi.com/view?r=eyJrIjoiNDYyMTRhYjQtZjA3MC00YjRhLTgxOGQtODM0YWZiNmNhN2JjIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    },
    {
      id: 'indicadores_producao_conectee',
      label: 'Indicadores de produção',
      icon: BarChartBig,
      condition: false,
      link: 'https://app.powerbi.com/view?r=eyJrIjoiYThjMWM5MmItMDA4NC00NjY0LTgxZTAtZDhlZTI5MTI1MmQ4IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9',
    },
    { id: 'tecnicos', label: 'Técnicos', icon: UserCog, condition: false },
  ];

  const visibleTabs = tabs.filter(
    (tab) => tab.condition === undefined || tab.condition,
  );
  const queryUrl = useQuery();

  const tab = queryUrl.get('tab');
  const [value, setValue] = useState(tab || 'home');

  const navigate = useNavigate();
  const location = useLocation();

  // Este useEffect agora gerencia a navegação interna e atualiza a URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set('tab', value);
    } else {
      params.delete('tab');
    }
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    });
  }, [value, location.pathname, navigate]);

  const currentTab = visibleTabs.find((tab) => tab.id === value);

  return (
    <main className="flex flex-1 h-full flex-col gap-4 p-4 md:p-8">
      <Helmet>
        <title>Indicadores | {'Simcc'}</title>
        <meta name="description" content={`Indicadores | ${'Simcc'}`} />
      </Helmet>

      {value === 'home' && (
        <div
          className="top-0 z-[0] left-0 absolute w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${bg_popup})` }}
        ></div>
      )}

      <div className="w-full z-[1] gap-4">
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

          {currentTab?.id !== 'home' && (
            <Button
              onClick={() => setValue('home')}
              variant="outline"
              size="icon"
              className="h-7 w-7"
            >
              <Home className="h-4 w-4" />
              <span className="sr-only">Voltar para o Menu</span>
            </Button>
          )}

          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Indicadores gerais
          </h1>
          {currentTab?.id !== 'home' && (
            <Badge variant="outline" className="ml-auto sm:ml-0">
              {currentTab?.label}
            </Badge>
          )}

          <div className="hidden items-center h-10 gap-2 md:ml-auto md:flex">
            {currentTab?.id !== 'home' && currentTab?.link && (
              <Link target="_blank" to={currentTab.link}>
                <Button size="sm" variant={'outline'}>
                  <SquareArrowOutUpRight size={12} /> Abrir em outra página
                </Button>
              </Link>
            )}

            {true && (
              <DropdownMenu>
                <DropdownMenuContent className="min-w-[250px]">
                  <Link
                    target="_blank"
                    to={`https://simcc.uesc.br/incite/industria4/`}
                  >
                    <DropdownMenuItem>Indústria 4.0</DropdownMenuItem>
                  </Link>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* MODIFICAÇÃO PRINCIPAL ABAIXO */}
      <Tabs
        defaultValue={value}
        value={value}
        className="h-full flex md:items-center z-[1]"
      >
        {/* 1. Conteúdo da aba "home" (o menu principal) */}
        <TabsContent value="home" className="w-full">
          <div className="w-full flex flex-col gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
            <Link
              to={'/informacoes'}
              className="inline-flex w-fit z-[2] items-center rounded-lg bg-neutral-100 dark:bg-neutral-700 gap-2 mb-3 px-3 py-1 text-sm font-medium"
            >
              <Info size={12} />
              <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
              Saiba o que é e como utilizar a plataforma
              <ArrowRight size={12} />
            </Link>
            <h1 className="z-[2] text-left max-w-[800px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
              Confira as{' '}
              <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
                estatísticas
              </strong>{' '}
              de produção do observatório
            </h1>
            <p className="max-w-[750px] text-left text-lg font-light text-foreground">
              Visualize os principais indicadores da por meio de dashboards em
              Power BI
            </p>

            <div className="flex gap-4 flex-wrap mt-16">
              {visibleTabs
                .filter((tab) => tab.id !== 'home') // Não mostra o card "Menu Inicial" na própria página do menu
                .map((tab) => {
                  const Icon = tab.icon;

                  // Lógica de clique foi centralizada aqui
                  const handleCardClick = () => {
                    // Se a aba tiver um link, abre em uma nova guia
                    if (tab.link) {
                      window.open(tab.link, '_blank', 'noopener,noreferrer');
                    } else {
                      // Senão, navega para a aba interna (ex: "Técnicos")
                      setValue(tab.id);
                    }
                  };

                  return (
                    <Alert
                      key={tab.id}
                      onClick={handleCardClick}
                      className="flex gap-2 flex-col items-center w-32 justify-center hover:border-eng-blue hover:text-eng-blue transition-all cursor-pointer text-sm text-center h-32"
                    >
                      <div>
                        <Icon size={24} />
                      </div>
                      {tab.label}
                    </Alert>
                  );
                })}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tecnicos" className="w-full">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold">Página de Técnicos</h2>
            <p className="text-muted-foreground mt-2">
              O conteúdo para esta seção será adicionado futuramente.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
