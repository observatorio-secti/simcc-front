import {
  Blocks,
  Building2,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
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
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { useInstitutionResearchGroups } from './hooks/use-institution-queries';
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

  const { data: rawGroups = [], isLoading } = useInstitutionResearchGroups();
  const total = rawGroups as Patrimonio[];

  const [count, setCount] = useState(12);
  const [search, setSearch] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [typeVisu, setTypeVisu] = useState('block');
  const [isOn, setIsOn] = useState(true);
  const jsonData = total;
  const [open, setOpen] = useState(false);
  const [search2, setSearch2] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  // Filtrar grupos por instituição
  const filteredByInstitution = Array.isArray(total)
    ? total.filter((item) => {
        // Normalizar strings para comparação
        const normalizeString = (str: string) =>
          (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

        const itemInstitution = normalizeString(item.institution);
        const targetInstitution = normalizeString(institutionName || '');
        const targetId = normalizeString(institutionId);

        // Tentar match por nome ou ID
        return (
          itemInstitution.includes(targetInstitution) ||
          itemInstitution.includes(targetId) ||
          targetInstitution.includes(itemInstitution)
        );
      })
    : [];

  const areas = Array.isArray(filteredByInstitution)
    ? [
        ...new Set(
          filteredByInstitution
            .map((item) => item.area)
            .filter((area): area is string => !!area),
        ),
      ]
    : [];

  const filteredTotal = filteredByInstitution.filter((item) => {
    const normalizeString = (str: string) =>
      (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const searchString = normalizeString(item.name);
    const normalizedSearch = normalizeString(search);

    return (
      searchString.includes(normalizedSearch) &&
      (selectedAreas.length > 0 ? selectedAreas.includes(item.area) : true)
    );
  });

  const handleAreaChange = (value: string) => {
    setSelectedAreas((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const clearFilters = () => {
    setSelectedAreas([]);
    setOpen(false);
  };

  const convertJsonToCsv = (json: any[]): string => {
    const items = json;
    if (items.length === 0) return '';
    const replacer = (_: string, value: any) => (value === null ? '' : value);
    const header = Object.keys(items[0]);
    const csv = [
      '\uFEFF' + header.join(';'),
      ...items.map((item) =>
        header
          .map((fieldName) => JSON.stringify(item[fieldName], replacer))
          .join(';'),
      ),
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
      link.download = `grupos-pesquisa-${institutionName}.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTotal2 = Array.isArray(areas)
    ? areas.filter((item) => {
        const normalizeString = (str: any) =>
          (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();

        const searchString = normalizeString(item);
        const normalizedSearch = normalizeString(search2);

        return searchString.includes(normalizedSearch);
      })
    : [];

  return (
    <main className="flex flex-1 flex-col">
      <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
        <div
          className={`w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800`}
        >
          {isOn && (
            <div className="w-full flex justify-between items-center">
              <div className="w-full pt-4 flex justify-between items-center">
                <Alert className="h-14 mt-4 mb-2 p-2 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 w-full flex-1">
                    <MagnifyingGlass
                      size={16}
                      className="whitespace-nowrap w-10"
                    />
                    <Input
                      onChange={(e) => setSearch(e.target.value)}
                      value={search}
                      type="text"
                      className="border-0 w-full"
                    />
                  </div>
                </Alert>
              </div>
            </div>
          )}

          <div className={`flex w-full flex-wrap pt-2 pb-3 justify-between`}>
            <div></div>

            <div className="hidden xl:flex xl:flex-nowrap gap-2">
              <div className="md:flex md:flex-nowrap gap-2">
                <Button
                  onClick={() => handleDownloadJson()}
                  variant="ghost"
                  className=""
                >
                  <Download size={16} className="" />
                  Baixar resultado
                </Button>

                <DropdownMenu open={open} onOpenChange={setOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="">
                      <SlidersHorizontal size={16} className="" />
                      Filtros
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filtrar por área</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-72">
                      {filteredTotal2.map((area) => (
                        <DropdownMenuCheckboxItem
                          key={area}
                          checked={selectedAreas.includes(area)}
                          onCheckedChange={() => handleAreaChange(area)}
                        >
                          <Alert
                            className={`w-4 rounded-md border-0 h-4 p-0 mr-2 ${qualisColor[normalizeArea(area || '')]}`}
                          />
                          {area}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
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

      <div className="p-4 md:p-8">
        <div
          className={`${selectedAreas.length > 0 ? 'flex' : 'hidden'} flex flex-wrap gap-3 mb-6 items-center`}
        >
          <p className="text-sm font-medium">Filtros aplicados:</p>
          {selectedAreas.map((item) => (
            <Badge
              key={item}
              className={`gap-2 items-center flex font-normal rounded-md dark:text-white py-2 px-3 ${qualisColor[normalizeArea(item || '')]}`}
            >
              {item}
              <div
                className="cursor-pointer"
                onClick={() => handleAreaChange(item)}
              >
                <X size={16} />
              </div>
            </Badge>
          ))}

          <Badge
            variant={'secondary'}
            onClick={() => clearFilters()}
            className="rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900 border-0 py-2 px-3 font-normal flex items-center justify-center gap-2"
          >
            <Trash size={12} />
            Limpar filtros
          </Badge>
        </div>

        <Alert className={`p-0 mb-6 bg-cover bg-no-repeat bg-center`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de grupos de pesquisa
            </CardTitle>
            <Blocks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTotal.length}</div>
            <p className="text-xs text-muted-foreground">
              encontrados na instituição
            </p>
          </CardContent>
        </Alert>

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
              ></HeaderResultTypeHome>
              <AccordionTrigger></AccordionTrigger>
            </div>
            <AccordionContent className="p-0">
              {isLoading ? (
                <Skeleton className="rounded-md w-full h-[300px]" />
              ) : (
                <GraficoAreaGrupos group={filteredTotal} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

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
              </HeaderResultTypeHome>
              <AccordionTrigger></AccordionTrigger>
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
                      <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
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
                      <Masonry gutter="16px" className="pb-4 md:pb-8 z-[1]">
                        {filteredTotal.slice(0, count).map((item) => {
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
                                className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[120px] border-neutral-200 border-r-0 ${qualisColor[normalizeArea(item.area || '')]} min-h-full relative`}
                              ></div>

                              <button
                                className={cn(
                                  'flex flex-col rounded-lg w-full rounded-l-none bg-white dark:bg-neutral-800 dark:border-neutral-700 items-start gap-2 border p-3 text-left text-sm transition-all hover:bg-accent',
                                )}
                              >
                                <div className="flex w-full flex-col gap-1">
                                  <div className="flex justify-between items-center">
                                    <div className="text-xs font-medium mb-2 flex items-center gap-2">
                                      {item.area != ''
                                        ? item.area
                                        : 'Sem código'}
                                    </div>
                                    <Shapes size={16} />
                                  </div>
                                  <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                      <div className="font-semibold text-lg">
                                        {item.name}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="line-clamp-2 flex-wrap text-xs text-muted-foreground flex gap-3">
                                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                    <Users size={12} />
                                    {item.first_leader}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                    <Building2 size={12} />
                                    {item.institution}
                                  </div>
                                  {item.second_leader != '' &&
                                    item.second_leader != null && (
                                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
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
