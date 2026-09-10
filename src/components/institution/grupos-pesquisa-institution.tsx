import {
  Blocks,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Shapes,
  SlidersHorizontal,
  Trash,
  Users,
  X,
} from 'lucide-react';
import { ChartBar, MagnifyingGlass, Rows, SquaresFour } from 'phosphor-react';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useEffect, useMemo, useState } from 'react';
import {
  useInstitutionResearchGroups,
  useInstitutionResearchGroupMetrics,
} from './hooks/use-institution-queries';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib';
import { Alert } from '../ui/alert';
import { Input } from '../ui/input';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { HeaderResultTypeHome } from '../homepage/categorias/header-result-type-home';
import { DataTable } from '../popup/columns/popup-data-table';
import { columns } from '../componentsModal/columns-grupo-pesquisa';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';
import { GraficoAreaGrupos } from '../grupos-pesquisa/grafico-area';

export interface Patrimonio {
  area: string;
  institution: string;
  first_leader: string;
  first_leader_id: string;
  second_leader: string;
  second_leader_id: string;
  name: string;
  id: string;
}

export const qualisColor: { [key: string]: string } = {
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

interface GruposPesquisaInstitutionProps {
  institutionId: string;
  institutionName?: string;
}

export function GruposPesquisaInstitution({
  institutionId,
  institutionName,
}: GruposPesquisaInstitutionProps) {
  const normalizeArea = (area: string): string => {
    return area.toUpperCase();
  };

  // Busca grupos filtrados pela API com TanStack Query
  const { data: rawGroups = [], isLoading: loadingGroups } =
    useInstitutionResearchGroups(institutionId);

  // Busca métricas por área para gráficos e cards de quantidade
  const { data: chartMetrics = [], isLoading: loadingMetrics } =
    useInstitutionResearchGroupMetrics(institutionId);

  const isLoading = loadingGroups || loadingMetrics;

  const total = (rawGroups as Patrimonio[]) || [];

  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const [search, setSearch] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [typeVisu, setTypeVisu] = useState('block');
  const [isOn, setIsOn] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchArea, setSearchArea] = useState('');

  const navigate = useNavigate();

  // Lista de áreas únicas (prioriza a ordem vinda das métricas oficiais)
  const areas = useMemo(() => {
    if (Array.isArray(chartMetrics) && chartMetrics.length > 0) {
      return chartMetrics.map((item) => item.area).filter(Boolean);
    }
    return [
      ...new Set(
        total.map((item) => item.area).filter((area): area is string => !!area),
      ),
    ];
  }, [chartMetrics, total]);

  // Mapa de contagem por área (a partir das métricas oficiais)
  const areaCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    chartMetrics.forEach((item) => {
      if (item.area) {
        counts[item.area] = item.count;
      }
    });
    return counts;
  }, [chartMetrics]);

  // Filtragem dos grupos de pesquisa por busca textual e áreas selecionadas
  const filteredTotal = useMemo(() => {
    return total.filter((item) => {
      const normalizeString = (str: string) =>
        (str || '')
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase();

      const searchString = normalizeString(item.name);
      const normalizedSearch = normalizeString(search);

      const matchesSearch = searchString.includes(normalizedSearch);
      const matchesArea =
        selectedAreas.length > 0 ? selectedAreas.includes(item.area) : true;

      return matchesSearch && matchesArea;
    });
  }, [total, search, selectedAreas]);

  // Reseta para a primeira página quando os filtros mudam
  useEffect(() => {
    setPage(1);
  }, [search, selectedAreas]);

  // Total oficial obtido a partir de /metrics/research-group/chart?institution_id=...
  const totalFromMetrics = useMemo(() => {
    if (Array.isArray(chartMetrics) && chartMetrics.length > 0) {
      return chartMetrics.reduce(
        (acc, curr) => acc + (Number(curr.count) || 0),
        0,
      );
    }
    return total.length;
  }, [chartMetrics, total.length]);

  const hasActiveFilters =
    search.trim().length > 0 || selectedAreas.length > 0;

  // Valor exibido no card de quantidade
  const displayedCount = hasActiveFilters
    ? filteredTotal.length
    : totalFromMetrics;

  // Métricas filtradas para o gráfico conforme a seleção de áreas
  const filteredChartData = useMemo(() => {
    if (selectedAreas.length > 0) {
      return chartMetrics.filter((m) => selectedAreas.includes(m.area));
    }
    return chartMetrics;
  }, [chartMetrics, selectedAreas]);

  // Itens paginados para a visualização em blocos
  const totalPages = Math.max(1, Math.ceil(filteredTotal.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return filteredTotal.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTotal, safePage, itemsPerPage]);

  const handleAreaChange = (value: string) => {
    setSelectedAreas((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const clearFilters = () => {
    setSelectedAreas([]);
    setOpen(false);
  };

  const convertJsonToCsv = (items: Patrimonio[]): string => {
    if (items.length === 0) return '';
    const dataToExport = items.map((item) => ({
      Nome: item.name,
      Área: item.area,
      Instituição: item.institution,
      'Primeiro Líder': item.first_leader,
      'Segundo Líder': item.second_leader || '',
    }));
    const header = Object.keys(dataToExport[0]);
    const replacer = (_: string, value: any) => (value === null ? '' : value);
    const csv = [
      '\uFEFF' + header.join(';'),
      ...dataToExport.map((row) =>
        header
          .map((fieldName) =>
            JSON.stringify((row as any)[fieldName], replacer),
          )
          .join(';'),
      ),
    ].join('\r\n');

    return csv;
  };

  const handleDownloadJson = () => {
    try {
      const itemsToExport =
        filteredTotal.length > 0 ? filteredTotal : total;
      const csvData = convertJsonToCsv(itemsToExport);
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=windows-1252;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `grupos-pesquisa-${institutionName || institutionId}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredAreasDropdown = useMemo(() => {
    if (!searchArea.trim()) return areas;
    const normalizeString = (str: string) =>
      (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const term = normalizeString(searchArea);
    return areas.filter((area) => normalizeString(area).includes(term));
  }, [areas, searchArea]);

  // Função auxiliar para gerar números de página com reticências
  const getPageNumbers = (current: number, totalP: number) => {
    if (totalP <= 7) {
      return Array.from({ length: totalP }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', totalP];
    }
    if (current >= totalP - 3) {
      return [
        1,
        '...',
        totalP - 4,
        totalP - 3,
        totalP - 2,
        totalP - 1,
        totalP,
      ];
    }
    return [1, '...', current - 1, current, current + 1, '...', totalP];
  };

  return (
    <main className="flex flex-1 flex-col">
      <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
        <div className="w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800">
          {isOn && (
            <div className="w-full flex justify-between items-center">
              <div className="w-full pt-4 flex justify-between items-center">
                <Alert className="h-14 mt-4 mb-2 p-2 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 w-full flex-1">
                    <MagnifyingGlass
                      size={16}
                      className="whitespace-nowrap w-10 text-muted-foreground"
                    />
                    <Input
                      onChange={(e) => setSearch(e.target.value)}
                      value={search}
                      type="text"
                      placeholder="Buscar grupo de pesquisa por nome..."
                      className="border-0 w-full focus-visible:ring-0 shadow-none"
                    />
                    {search && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearch('')}
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </Alert>
              </div>
            </div>
          )}

          <div className="flex w-full flex-wrap pt-2 pb-3 justify-between items-center">
            <div className="text-xs text-muted-foreground">
              {filteredTotal.length > 0 && (
                <span>
                  {filteredTotal.length}{' '}
                  {filteredTotal.length === 1
                    ? 'grupo encontrado'
                    : 'grupos encontrados'}
                </span>
              )}
            </div>

            <div className="hidden xl:flex xl:flex-nowrap gap-2">
              <div className="md:flex md:flex-nowrap gap-2">
                <Button
                  onClick={handleDownloadJson}
                  variant="ghost"
                  className=""
                  disabled={isLoading || total.length === 0}
                >
                  <Download size={16} className="" />
                  Baixar resultado
                </Button>

                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="">
                      <SlidersHorizontal size={16} className="" />
                      Filtros
                      {selectedAreas.length > 0 && (
                        <span className="ml-1 rounded-full bg-eng-blue text-white text-[10px] h-4 w-4 inline-flex items-center justify-center">
                          {selectedAreas.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72">
                    <DropdownMenuLabel>Filtrar por área</DropdownMenuLabel>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Buscar área..."
                        value={searchArea}
                        onChange={(e) => setSearchArea(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-72">
                      {filteredAreasDropdown.length > 0 ? (
                        filteredAreasDropdown.map((area) => (
                          <DropdownMenuCheckboxItem
                            key={area}
                            checked={selectedAreas.includes(area)}
                            onCheckedChange={() => handleAreaChange(area)}
                            className="flex items-center justify-between py-2 cursor-pointer"
                          >
                            <div className="flex items-center flex-1 mr-2 truncate">
                              <Alert
                                className={`w-3 h-3 rounded-full border-0 p-0 mr-2 flex-shrink-0 ${
                                  qualisColor[normalizeArea(area || '')] ||
                                  'bg-gray-400'
                                }`}
                              />
                              <span className="truncate">{area}</span>
                            </div>
                            {areaCounts[area] !== undefined && (
                              <span className="text-xs text-muted-foreground font-mono">
                                ({areaCounts[area]})
                              </span>
                            )}
                          </DropdownMenuCheckboxItem>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground p-3 text-center">
                          Nenhuma área encontrada
                        </p>
                      )}
                    </ScrollArea>
                    {selectedAreas.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="w-full text-xs h-8 text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash size={12} className="mr-1" />
                            Limpar seleção ({selectedAreas.length})
                          </Button>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

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

      <div className="p-4 md:p-8">
        {selectedAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <p className="text-sm font-medium text-muted-foreground mr-1">
              Filtros aplicados:
            </p>
            {selectedAreas.map((item) => (
              <Badge
                key={item}
                className={`gap-2 items-center flex font-normal rounded-md dark:text-white py-1.5 px-3 border shadow-sm ${
                  qualisColor[normalizeArea(item || '')] || 'bg-gray-200'
                }`}
              >
                {item}
                <div
                  className="cursor-pointer hover:opacity-75"
                  onClick={() => handleAreaChange(item)}
                >
                  <X size={14} />
                </div>
              </Badge>
            ))}

            <Badge
              variant="secondary"
              onClick={clearFilters}
              className="rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-800 border py-1.5 px-3 font-normal flex items-center justify-center gap-1.5"
            >
              <Trash size={12} />
              Limpar filtros
            </Badge>
          </div>
        )}

        {/* Card de Quantidade Oficial dos Grupos de Pesquisa */}
        <Alert className="p-0 mb-6 bg-cover bg-no-repeat bg-center">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de grupos de pesquisa
            </CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                displayedCount.toLocaleString('pt-BR')
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasActiveFilters
                ? 'encontrados na busca'
                : 'encontrados na instituição'}
            </p>
          </CardContent>
        </Alert>

        {/* Gráficos dos Grupos de Pesquisa */}
        <Accordion
          defaultValue="item-1"
          type="single"
          collapsible
          className="mb-6"
        >
          <AccordionItem value="item-1">
            <div className="flex mb-2">
              <HeaderResultTypeHome
                title="Gráficos dos grupos de pesquisa"
                icon={<ChartBar size={24} className="text-gray-400" />}
              />
              <AccordionTrigger />
            </div>
            <AccordionContent className="p-0">
              {isLoading ? (
                <Skeleton className="rounded-md w-full h-[300px]" />
              ) : (
                <GraficoAreaGrupos
                  data={filteredChartData}
                  group={filteredTotal}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Listagem de Grupos de Pesquisa com Paginação */}
        <Accordion defaultValue="item-1" type="single" collapsible>
          <AccordionItem value="item-1">
            <div className="flex mb-2 mt-4">
              <HeaderResultTypeHome
                title="Grupos de pesquisa"
                icon={<Blocks size={24} className="text-gray-400" />}
              >
                <div className="hidden md:flex gap-3 mr-3">
                  <Button
                    onClick={() => setTypeVisu('rows')}
                    variant={typeVisu === 'rows' ? 'default' : 'ghost'}
                    size="icon"
                  >
                    <Rows size={16} className="whitespace-nowrap" />
                  </Button>
                  <Button
                    onClick={() => setTypeVisu('block')}
                    variant={typeVisu === 'block' ? 'default' : 'ghost'}
                    size="icon"
                  >
                    <SquaresFour size={16} className="whitespace-nowrap" />
                  </Button>
                </div>
              </HeaderResultTypeHome>
              <AccordionTrigger />
            </div>

            <AccordionContent>
              {typeVisu === 'block' ? (
                isLoading ? (
                  <ResponsiveMasonry
                    columnsCountBreakPoints={{
                      350: 1,
                      750: 2,
                      900: 2,
                      1200: 3,
                      1700: 4,
                    }}
                  >
                    <Masonry gutter="16px" className="pb-4 md:pb-8">
                      <Skeleton className="w-full h-[120px] rounded-md" />
                      <Skeleton className="w-full h-[120px] rounded-md" />
                      <Skeleton className="w-full h-[120px] rounded-md" />
                      <Skeleton className="w-full h-[120px] rounded-md" />
                      <Skeleton className="w-full h-[120px] rounded-md" />
                      <Skeleton className="w-full h-[120px] rounded-md" />
                    </Masonry>
                  </ResponsiveMasonry>
                ) : filteredTotal.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <Blocks className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
                      Nenhum grupo de pesquisa encontrado
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Não encontramos grupos de pesquisa correspondentes aos
                      filtros aplicados.
                    </p>
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="mt-4"
                      >
                        Limpar filtros
                      </Button>
                    )}
                  </div>
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
                      <Masonry gutter="16px" className="pb-4 md:pb-8 z-[1]">
                        {paginatedItems.map((item) => {
                          const handlePesquisaFinal = (id: string) => {
                            const queryParams = new URLSearchParams();
                            queryParams.set('group_id', id);

                            // Preserva o contexto da instituição
                            if (institutionId && institutionName) {
                              queryParams.set('from_institution', 'true');
                              queryParams.set('institution_id', institutionId);
                              queryParams.set(
                                'institution_name',
                                institutionName,
                              );
                            }

                            navigate(
                              `/grupos-pesquisa?${queryParams.toString()}`,
                            );
                          };

                          return (
                            <div
                              key={item.id}
                              className="flex w-full"
                              onClick={() => handlePesquisaFinal(item.id)}
                            >
                              <div
                                className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[120px] border-neutral-200 border-r-0 ${
                                  qualisColor[
                                    normalizeArea(item.area || '')
                                  ] || 'bg-gray-400'
                                } min-h-full relative`}
                              />

                              <button
                                className={cn(
                                  'flex flex-col rounded-lg w-full rounded-l-none bg-white dark:bg-neutral-800 dark:border-neutral-700 items-start gap-2 border p-3 text-left text-sm transition-all hover:bg-accent hover:shadow-sm',
                                )}
                              >
                                <div className="flex w-full flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                                      {item.area ? item.area : 'Sem área'}
                                    </div>
                                    <Shapes
                                      size={16}
                                      className="text-muted-foreground"
                                    />
                                  </div>
                                  <div className="flex items-center">
                                    <div className="font-semibold text-base md:text-lg line-clamp-2">
                                      {item.name}
                                    </div>
                                  </div>
                                </div>
                                <div className="line-clamp-2 flex-wrap text-xs text-muted-foreground flex gap-3 mt-1">
                                  {item.first_leader && (
                                    <div className="text-xs text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                      <Users size={12} />
                                      {item.first_leader}
                                    </div>
                                  )}
                                  {item.institution && (
                                    <div className="text-xs text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                      <Building2 size={12} />
                                      {item.institution}
                                    </div>
                                  )}
                                  {item.second_leader && (
                                    <div className="text-xs text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                      <Users size={12} />
                                      {item.second_leader}
                                    </div>
                                  )}
                                </div>
                              </button>
                            </div>
                          );
                        })}
                      </Masonry>
                    </ResponsiveMasonry>

                    {/* Controles de Paginação */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-neutral-200 dark:border-neutral-800 mt-2">
                        <div className="text-sm text-muted-foreground order-2 sm:order-1">
                          Mostrando{' '}
                          <span className="font-medium text-foreground">
                            {(safePage - 1) * itemsPerPage + 1}
                          </span>{' '}
                          a{' '}
                          <span className="font-medium text-foreground">
                            {Math.min(
                              safePage * itemsPerPage,
                              filteredTotal.length,
                            )}
                          </span>{' '}
                          de{' '}
                          <span className="font-medium text-foreground">
                            {filteredTotal.length}
                          </span>{' '}
                          grupos
                        </div>

                        <div className="flex items-center gap-1 order-1 sm:order-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPage((prev) => Math.max(prev - 1, 1));
                            }}
                            disabled={safePage === 1}
                            className="h-8 gap-1"
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Anterior</span>
                          </Button>

                          <div className="flex items-center gap-1 mx-1">
                            {getPageNumbers(safePage, totalPages).map(
                              (pageNum, idx) =>
                                pageNum === '...' ? (
                                  <span
                                    key={`dots-${idx}`}
                                    className="px-2 text-muted-foreground text-xs"
                                  >
                                    ...
                                  </span>
                                ) : (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      safePage === pageNum
                                        ? 'default'
                                        : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => setPage(Number(pageNum))}
                                    className="h-8 w-8 p-0 text-xs"
                                  >
                                    {pageNum}
                                  </Button>
                                ),
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPage((prev) =>
                                Math.min(prev + 1, totalPages),
                              );
                            }}
                            disabled={safePage === totalPages}
                            className="h-8 gap-1"
                          >
                            <span className="hidden sm:inline">Próximo</span>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : isLoading ? (
                <Skeleton className="w-full rounded-md h-[400px]" />
              ) : (
                <DataTable columns={columns} data={filteredTotal} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
