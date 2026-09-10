import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { StripeLogo, Student } from 'phosphor-react';
import {
  ArrowRight,
  BookOpen,
  BookOpenText,
  Briefcase,
  Code,
  Copyright,
  Download,
  File,
  Files,
  FolderKanban,
  Info,
  Loader2,
  MoreHorizontal,
  Ticket,
  UserCog,
  Users,
  UserSearch,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList } from '../ui/tabs';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { ArticlesHome } from '../homepage/categorias/articles-home';
import { Helmet } from 'react-helmet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { BookHome } from '../homepage/categorias/book-home';
import { PatentHome } from '../homepage/categorias/patent-home';
import { SoftwareHome } from './software-home';
import { BrandHome } from './brand-home';
import { MagazineHome } from './magazine-home';
import { WorkEventHome } from './work-event-home';
import { TextoRevistaHome } from './texto-revista';
import { ResearchersHomeListagens } from './researchers-home';
import { BolsistasHome } from './bolsistas-home';
import { RelatorioTecnicoHome } from './relatorio-tecnico-home';
import { SpeakerHome } from '../homepage/categorias/speaker-home';
import { ProjetoPesquisaHome } from './projeto-pesquisa-home';
import { OrientacoesHome } from './orientacoes-home';
import { TechnicianHome } from './technician-home';
import { useListagemExport } from '../../hooks/use-listagens-queries';
import { toast } from 'sonner';

const TABS = [
  { id: 'bolsistas', label: 'Bolsistas CNPq', icon: UserSearch },
  { id: 'pesquisadores', label: 'Pesquisadores', icon: Users },
  { id: 'tecnicos', label: 'Técnicos', icon: UserCog, condition: false },
  { id: 'article', label: 'Artigos', icon: File },
  { id: 'book', label: 'Livros e capítulos', icon: BookOpen },
  { id: 'patent', label: 'Patentes', icon: Copyright },
  { id: 'software', label: 'Softwares', icon: Code },
  { id: 'brand', label: 'Marcas', icon: StripeLogo },
  { id: 'relatorio-tecnico', label: 'Relatório técnico', icon: Files },
  { id: 'orientacoes', label: 'Orientações', icon: Student },
  { id: 'speaker', label: 'Participação em eventos', icon: Ticket },
  {
    id: 'research-project',
    label: 'Projetos de pesquisa',
    icon: FolderKanban,
  },
  { id: 'texto-revista', label: 'Texto em revista', icon: BookOpenText },
  { id: 'work-event', label: 'Trabalho em evento', icon: Briefcase },
  { id: 'magazine', label: 'Revistas', icon: BookOpen },
];

export function TodosPesquisadores() {
  const location = useLocation();

  const [isOn] = useState(true);
  const [value, setValue] = useState('bolsistas');

  // Consulta otimizada com React Query e Axios com cache de 5 minutos por aba
  const {
    data: jsonData = [],
    isLoading: isLoadingExport,
    isFetching: isFetchingExport,
  } = useListagemExport(value);

  // Sincroniza o parâmetro 'tab' da URL com a aba ativa
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');

    if (tabFromUrl) {
      const isValidTab = TABS.some((tab) => {
        const isConditionMet =
          tab.condition === undefined ? true : !!tab.condition;
        return tab.id === tabFromUrl && isConditionMet;
      });

      if (isValidTab) {
        setValue(tabFromUrl);
      }
    }
  }, [location.search]);

  const convertJsonToCsv = (json: any[]): string => {
    if (!json || json.length === 0) return '';
    const replacer = (_: string, val: any) =>
      val === null || val === undefined ? '' : val;
    const header = Object.keys(json[0]);
    const csv = [
      '\uFEFF' + header.join(';'),
      ...json.map((item) =>
        header
          .map((fieldName) => JSON.stringify(item[fieldName] ?? '', replacer))
          .join(';'),
      ),
    ].join('\r\n');
    return csv;
  };

  const handleDownloadJson = () => {
    try {
      if (!jsonData || jsonData.length === 0) {
        toast.warning('Não há dados disponíveis para exportação no momento.');
        return;
      }
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=windows-1252;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `listagem-${value}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Download iniciado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      toast.error('Ocorreu um erro ao exportar os dados.');
    }
  };

  const isExportLoading = isLoadingExport || isFetchingExport;

  return (
    <main className="w-full grid grid-cols-1">
      <Helmet>
        <title>Listagens | {'Simcc'}</title>
        <meta name="description" content={`Listagens | ${'Simcc'}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <Link
          to={'/informacoes'}
          className="inline-flex z-[2] items-center rounded-lg bg-neutral-100 dark:bg-neutral-700 gap-2 mb-3 px-3 py-1 text-sm font-medium"
        >
          <Info size={12} />
          <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
          Saiba como utilizar a plataforma
          <ArrowRight size={12} />
        </Link>
        <h1 className="z-[2] text-center max-w-[800px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1] md:block mb-4">
          Todas as{' '}
          <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
            listagens
          </strong>{' '}
          que a plataforma pode filtrar para você.
        </h1>
        <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>
      </div>
      <main className="h-full w-full flex flex-col">
        <Tabs defaultValue="articles" value={value} className="">
          <div>
            <div
              className={`w-full ${isOn ? 'px-8' : 'px-4'} border-b border-b-neutral-200 dark:border-b-neutral-800`}
            >
              {isOn && (
                <div className="w-full pt-4 flex justify-between items-center"></div>
              )}
              <div className="flex pt-2 gap-8 justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative grid grid-cols-1">
                    <ScrollArea className="relative overflow-x-auto">
                      <TabsList className="p-0 flex h-auto bg-transparent dark:bg-transparent">
                        {TABS.map(
                          ({ id, label, icon: Icon, condition = true }) =>
                            condition && (
                              <div
                                key={id}
                                className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                                  value === id
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
                            ),
                        )}
                      </TabsList>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>
                <div className="hidden xl:flex xl:flex-nowrap gap-2">
                  <div className="md:flex md:flex-nowrap gap-2">
                    <Button
                      onClick={handleDownloadJson}
                      variant="ghost"
                      disabled={isExportLoading}
                      className=""
                    >
                      {isExportLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} className="" />
                      )}
                      Baixar resultado
                    </Button>
                  </div>
                </div>
                <div className="block xl:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="h-8 w-8 p-0 xl:block">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Mais opções</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="p-0">
                        <Button
                          onClick={handleDownloadJson}
                          variant="ghost"
                          disabled={isExportLoading}
                          className=""
                        >
                          {isExportLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} className="" />
                          )}
                          Baixar resultado
                        </Button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
          <ScrollArea className="h-full">
            <div className="px-8">
              <TabsContent value="pesquisadores">
                <ResearchersHomeListagens />
              </TabsContent>
              <TabsContent value="bolsistas">
                <BolsistasHome />
              </TabsContent>
              <TabsContent value="article">
                <ArticlesHome />
              </TabsContent>
              <TabsContent value="research-project">
                <ProjetoPesquisaHome />
              </TabsContent>
              <TabsContent value="book">
                <BookHome />
              </TabsContent>
              <TabsContent value="tecnicos">
                <TechnicianHome />
              </TabsContent>
              <TabsContent value="relatorio-tecnico">
                <RelatorioTecnicoHome />
              </TabsContent>
              <TabsContent value="speaker">
                <SpeakerHome />
              </TabsContent>
              <TabsContent value="orientacoes">
                <OrientacoesHome />
              </TabsContent>
              <TabsContent value="patent">
                <PatentHome />
              </TabsContent>
              <TabsContent value="software">
                <SoftwareHome />
              </TabsContent>
              <TabsContent value="brand">
                <BrandHome />
              </TabsContent>
              <TabsContent value="magazine">
                <MagazineHome />
              </TabsContent>
              <TabsContent value="work-event">
                <WorkEventHome />
              </TabsContent>
              <TabsContent value="texto-revista">
                <TextoRevistaHome />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </main>
    </main>
  );
}
