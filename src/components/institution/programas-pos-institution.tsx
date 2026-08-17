import {
  ChevronDown,
  ChevronUp,
  Download,
  GraduationCap,
  Plus,
  SlidersHorizontal,
  Trash,
  X,
} from 'lucide-react';
import { ChartBar, MagnifyingGlass, Rows, SquaresFour } from 'phosphor-react';
import { Button } from '../ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { Skeleton } from '../ui/skeleton';
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
import { DataTable } from '../homepage/categorias/researchers-home/data-table';
import { columnsGraduate } from '../graduate-program/columns-graduate';
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
import { areasComCores, ProgramItem } from '../graduate-program/program-item';
import { GraficoAreaProgramas } from '../graduate-program/graficos-tabelas/grafico-area-programa';
import { GraficoRatingProgramas } from '../graduate-program/graficos-tabelas/grafico-rating-programas';

export interface GraduateProgram {
  area: string;
  code: string;
  graduate_program_id: string;
  modality: string;
  name: string;
  rating: string;
  type: string;
  city: string;
  state: string;
  acronym: string;
  instituicao: string;
  url_image: string;
  region: string;
  sigla: string;
  latitude: string;
  longitude: string;
  visible: boolean;
  qtd_discente: string;
  qtd_colaborador: string;
  qtd_permanente: string;
  create_at: string;
  institution: string;
  researchers: string[];
}

interface ProgramasPosInstitutionProps {
  institutionId: string;
  institutionName?: string;
}

export function ProgramasPosInstitution({
  institutionId,
  institutionName,
}: ProgramasPosInstitutionProps) {
  const normalizeArea = (area: string): string =>
    area
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const qualisColor = new Map(
    areasComCores.map(([area, color]) => [normalizeArea(area), color]),
  );

  const getColorByArea = (area: string): string =>
    qualisColor.get(normalizeArea(area)) || 'bg-gray-500';

  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<GraduateProgram[]>([]);
  const { urlGeral } = useContext(UserContext);
  const [count, setCount] = useState(12);
  const [search, setSearch] = useState('');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [typeVisu, setTypeVisu] = useState('block');
  const [isOn, setIsOn] = useState(true);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search2, setSearch2] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const urlGraduateProgram = `${urlGeral}graduate_program_profnit?id=`;

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
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
        if (data) {
          const visiblePrograms = data.filter(
            (item: GraduateProgram) => item.visible === true,
          );
          setTotal(visiblePrograms);
          setIsLoading(false);
          setJsonData(visiblePrograms);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlGraduateProgram]);

  // Filtrar programas por instituição
  const filteredByInstitution = Array.isArray(total)
    ? total.filter((item) => {
        const normalizeString = (str: string) =>
          str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();

        const itemInstitution = normalizeString(item.institution);
        const targetInstitution = normalizeString(institutionName || '');
        const targetId = normalizeString(institutionId);

        return (
          itemInstitution.includes(targetInstitution) ||
          itemInstitution.includes(targetId) ||
          targetInstitution.includes(itemInstitution)
        );
      })
    : [];

  const areas = Array.isArray(filteredByInstitution)
    ? [...new Set(filteredByInstitution.map((item) => item.area))]
    : [];

  const filteredTotal = filteredByInstitution.filter((item) => {
    const normalizeString = (str: string) =>
      str
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
      const csvData = convertJsonToCsv(filteredByInstitution);
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=windows-1252;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `programas-pos-${institutionName}.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTotal2 = Array.isArray(areas)
    ? areas.filter((item) => {
        const normalizeString = (str: any) =>
          str
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
                            className={`w-4 rounded-md border-0 h-4 p-0 mr-2 ${getColorByArea(area)}`}
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
              className={`gap-2 items-center flex font-normal rounded-md dark:text-white py-2 px-3 ${getColorByArea(item)}`}
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
              Total de programas de pós-graduação
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
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
                title="Gráficos das pós-graduações"
                icon={<ChartBar size={24} className="text-gray-400" />}
              ></HeaderResultTypeHome>
              <AccordionTrigger></AccordionTrigger>
            </div>
            <AccordionContent className="p-0">
              {isLoading ? (
                <div className="grid gap-8">
                  <Skeleton className="rounded-md w-full h-[300px]" />
                  <Skeleton className="rounded-md w-full h-[300px]" />
                </div>
              ) : (
                <div className="grid gap-8">
                  <GraficoAreaProgramas group={filteredTotal} />
                  <GraficoRatingProgramas group={filteredTotal} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible>
          <AccordionItem value="item-1">
            <div className="flex mb-2 mt-4">
              <HeaderResultTypeHome
                title="Programas de pós-graduação"
                icon={<GraduationCap size={24} className="text-gray-400" />}
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
                      <Skeleton className="w-full h-[300px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[300px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[300px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[300px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[300px] rounded-md"></Skeleton>
                      <Skeleton className="w-full h-[300px] rounded-md"></Skeleton>
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
                        className="pb-4 md:pb-8 z-[1] w-full"
                      >
                        {filteredTotal.slice(0, count).map((props, index) => (
                          <ProgramItem
                            key={index}
                            area={props.area}
                            institution={props.institution}
                            researchers={props.researchers}
                            code={props.code}
                            graduate_program_id={props.graduate_program_id}
                            modality={props.modality}
                            name={props.name}
                            rating={props.rating}
                            type={props.type}
                            city={props.city}
                            state={props.state}
                            instituicao={props.instituicao}
                            url_image={props.url_image}
                            region={props.region}
                            sigla={props.sigla}
                            acronym={props.acronym}
                            visible={props.visible}
                            qtd_discente={props.qtd_discente}
                            qtd_colaborador={props.qtd_colaborador}
                            qtd_permanente={props.qtd_permanente}
                            create_at={props.create_at}
                            fromInstitution={true}
                            institutionId={institutionId}
                            institutionName={institutionName}
                          />
                        ))}
                      </Masonry>
                    </ResponsiveMasonry>

                    {filteredTotal.length > count && (
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
                <DataTable columns={columnsGraduate} data={filteredTotal} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
