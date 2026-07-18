import { ChevronDown, ChevronUp, Download, MapIcon, Plus, SlidersHorizontal, Trash, User, X } from "lucide-react";
import { ChartBar, MagnifyingGlass, Rows, SquaresFour, UserList } from "phosphor-react";
import { Button } from "../ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Skeleton } from "../ui/skeleton";
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { ResearchItem } from "../homepage/categorias/researchers-home/researcher-item";
import { columns } from "../homepage/categorias/researchers-home/columns";
import { DataTable } from "../homepage/categorias/researchers-home/data-table";
import { GraficoBolsistasPQ, CategoryMetric } from "../dashboard/graficos/grafico-bolsista-produtividade";
import { GraficoBolsistasDT } from "../dashboard/graficos/grafico-bolsista-tecnologico";
import municipios from '../homepage/categorias/researchers-home/municipios.json';
import MapaResearcher from "../homepage/categorias/researchers-home/mapa-researcher";

type CityData = {
  nome: string;
  latitude: number;
  longitude: number;
  pesquisadores: number;
  professores: string[];
  lattes_10_id: string;
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

export interface Research {
  among: number;
  satus: boolean;
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
  speaker: string;
}

interface BolsistasInstitutionProps {
  institutionId: string;
  institutionName?: string;
}

export function BolsistasInstitution({ institutionId, institutionName }: BolsistasInstitutionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<Research[]>([]);
  const { urlGeral } = useContext(UserContext);
  const [count, setCount] = useState(24);
  const [search, setSearch] = useState('');
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [typeVisu, setTypeVisu] = useState('block');
  const [isOn, setIsOn] = useState(true);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [search2, setSearch2] = useState('');
  const [cityData, setCityData] = useState<CityData[]>([]);

  const location = useLocation();
  const navigate = useNavigate();

  const urlBolsistas = `${urlGeral}researcher/foment`;

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response = await fetch(urlBolsistas, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });
        const data = await response.json();
        if (data) {
          setTotal(data);
          setIsLoading(false);
          setJsonData(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlBolsistas]);

  // Filtrar bolsistas por instituição
  const filteredByInstitution = Array.isArray(total) ? total.filter(item => {
    const normalizeString = (str: string) => str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    const itemUniversity = normalizeString(item.university);
    const targetInstitution = normalizeString(institutionName || '');
    const targetId = normalizeString(institutionId);

    return itemUniversity.includes(targetInstitution) ||
      itemUniversity.includes(targetId) ||
      targetInstitution.includes(itemUniversity);
  }) : [];

  // Extrair modalidades únicas dos bolsistas filtrados
  const modalities = Array.isArray(filteredByInstitution)
    ? [...new Set(
      filteredByInstitution.flatMap(item =>
        Array.isArray(item.subsidy) ? item.subsidy.map(s => s.modality_name) : []
      )
    )].filter(Boolean)
    : [];

  const filteredTotal = filteredByInstitution.filter(item => {
    const normalizeString = (str: string) => str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const searchString = normalizeString(item.name);
    const normalizedSearch = normalizeString(search);

    const hasSelectedModality = selectedModalities.length === 0 || (
      item.subsidy && item.subsidy.some(sub => selectedModalities.includes(sub.modality_name))
    );

    return searchString.includes(normalizedSearch) && hasSelectedModality;
  });

  const getMetricsFromResearchers = (researchersList: Research[]): CategoryMetric[] => {
    const countsMap = new Map<string, { modality_code: string; category_level_code: string; count: number }>();

    researchersList.forEach(r => {
      if (Array.isArray(r.subsidy)) {
        r.subsidy.forEach(sub => {
          const mod = sub.modality_code;
          const level = sub.category_level_code;
          if (mod && level) {
            const key = `${mod}-${level}`;
            const existing = countsMap.get(key);
            if (existing) {
              existing.count += 1;
            } else {
              countsMap.set(key, {
                modality_code: mod,
                category_level_code: level,
                count: 1
              });
            }
          }
        });
      }
    });

    return Array.from(countsMap.values());
  };

  const institutionMetrics = getMetricsFromResearchers(filteredTotal);

  const handleModalityChange = (value: string) => {
    setSelectedModalities((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const clearFilters = () => {
    setSelectedModalities([]);
    setOpen(false);
  };

  const convertJsonToCsv = (json: any[]): string => {
    const items = json;
    const replacer = (_: string, value: any) => (value === null ? '' : value);
    const header = Object.keys(items[0]);
    const csv = [
      '\uFEFF' + header.join(';'),
      ...items.map((item) =>
        header.map((fieldName) => JSON.stringify(item[fieldName], replacer)).join(';')
      )
    ].join('\r\n');

    return csv;
  };

  const handleDownloadJson = async () => {
    try {
      const csvData = convertJsonToCsv(filteredByInstitution);
      const blob = new Blob([csvData], { type: 'text/csv;charset=windows-1252;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `bolsistas-produtividade-${institutionName}.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredTotal2 = Array.isArray(modalities) ? modalities.filter(item => {
    const normalizeString = (str: any) => str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const searchString = normalizeString(item);
    const normalizedSearch = normalizeString(search2);

    return searchString.includes(normalizedSearch);
  }) : [];

  // Função para normalizar nomes de cidade
  const normalizeCityName = (cityName: string) => {
    return cityName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Processar dados de cidade para o mapa
  useEffect(() => {
    const processCityData = () => {
      const cityMap = new Map<string, CityData>();

      const municipioMap = new Map(
        municipios.map((m) => [normalizeCityName(m.nome), m])
      );

      filteredByInstitution.forEach((r) => {
        if (r.city) {
          const normalizedCity = normalizeCityName(r.city);
          const municipio = municipioMap.get(normalizedCity);

          if (!municipio) {
            console.warn(`Município não encontrado para a cidade: ${r.city}`);
            return;
          }

          if (!cityMap.has(normalizedCity)) {
            cityMap.set(normalizedCity, {
              nome: r.city,
              latitude: municipio.latitude,
              longitude: municipio.longitude,
              pesquisadores: 1,
              professores: [r.name],
              lattes_10_id: r.lattes_10_id,
            });
          } else {
            const city = cityMap.get(normalizedCity)!;
            city.pesquisadores += 1;
            city.professores.push(r.name);
          }
        }
      });

      setCityData(Array.from(cityMap.values()));
    };

    processCityData();
  }, [filteredByInstitution]);

  return (
    <main className="flex flex-1 flex-col">
      <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
        <div className={`w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800`}>
          {isOn && (
            <div className="w-full flex justify-between items-center">
              <div className="w-full pt-4 flex justify-between items-center">
                <Alert className="h-14 mt-4 mb-2 p-2 flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 w-full flex-1">
                    <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
                    <Input onChange={(e) => setSearch(e.target.value)} value={search} type="text" className="border-0 w-full" />
                  </div>
                </Alert>
              </div>
            </div>
          )}

          <div className={`flex w-full flex-wrap pt-2 pb-3 justify-between`}>
            <div></div>

            <div className="hidden xl:flex xl:flex-nowrap gap-2">
              <div className="md:flex md:flex-nowrap gap-2">
                <Button onClick={() => handleDownloadJson()} variant="ghost" className="">
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
                    <DropdownMenuLabel>Filtrar por modalidade</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <ScrollArea className="h-72">
                      {filteredTotal2.map((modality) => (
                        <DropdownMenuCheckboxItem
                          key={modality}
                          checked={selectedModalities.includes(modality)}
                          onCheckedChange={() => handleModalityChange(modality)}
                        >
                          {modality}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div></div>
              <Button variant="ghost" size="icon" onClick={() => setIsOn(!isOn)}>
                {isOn ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        <div className={`${selectedModalities.length > 0 ? ('flex') : ('hidden')} flex flex-wrap gap-3 mb-6 items-center`}>
          <p className="text-sm font-medium">Filtros aplicados:</p>
          {selectedModalities.map((item) => (
            <Badge
              key={item}
              className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
            >
              {item}
              <div
                className="cursor-pointer"
                onClick={() => handleModalityChange(item)}
              >
                <X size={16} />
              </div>
            </Badge>
          ))}

          <Badge variant={'secondary'} onClick={() => clearFilters()} className="rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900 border-0 py-2 px-3 font-normal flex items-center justify-center gap-2">
            <Trash size={12} />Limpar filtros
          </Badge>
        </div>

        <Alert className={`p-0 mb-6 bg-cover bg-no-repeat bg-center`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de bolsistas de produtividade
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTotal.length}</div>
            <p className="text-xs text-muted-foreground">
              encontrados na instituição
            </p>
          </CardContent>
        </Alert>

        <Accordion defaultValue="item-1" type="single" collapsible className="mb-6 hidden md:flex">
          <AccordionItem value="item-1" className="w-full">
            <div className="flex mb-2">
              <HeaderResultTypeHome title="Bolsistas no mapa" icon={<MapIcon size={24} className="text-gray-400" />}>
              </HeaderResultTypeHome>
              <AccordionTrigger></AccordionTrigger>
            </div>
            <AccordionContent className="p-0">
              {isLoading ? (
                <Skeleton className="rounded-md w-full h-[350px]" />
              ) : (
                <MapaResearcher cityData={cityData} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible className="mb-6 hidden md:flex">
          <AccordionItem value="item-1" className="w-full">
            <div className="flex mb-2">
              <HeaderResultTypeHome title="Gráficos dos bolsistas CNPq" icon={<ChartBar size={24} className="text-gray-400" />}>
              </HeaderResultTypeHome>
              <AccordionTrigger></AccordionTrigger>
            </div>
            <AccordionContent className="p-0">
              {isLoading ? (
                <Skeleton className="rounded-md w-full h-[300px]" />
              ) : (
                <div className="grid gap-8 xl:grid-cols-2">
                  <GraficoBolsistasPQ metricsData={institutionMetrics} />
                  <GraficoBolsistasDT metricsData={institutionMetrics} />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible>
          <AccordionItem value="item-1">
            <div className="flex mb-2 mt-4">
              <HeaderResultTypeHome title="Bolsistas de produtividade" icon={<UserList size={24} className="text-gray-400" />}>
                <div className="hidden md:flex gap-3 mr-3">
                  <Button onClick={() => setTypeVisu('rows')} variant={typeVisu === 'block' ? 'ghost' : 'outline'} size={'icon'}>
                    <Rows size={16} className="whitespace-nowrap" />
                  </Button>
                  <Button onClick={() => setTypeVisu('block')} variant={typeVisu === 'block' ? 'outline' : 'ghost'} size={'icon'}>
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
                      350: 2,
                      750: 3,
                      900: 4,
                      1200: 6,
                      1500: 6,
                      1700: 7
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
                        350: 2,
                        750: 3,
                        900: 4,
                        1200: 6,
                        1500: 6,
                        1700: 7
                      }}
                    >
                      <Masonry gutter="16px" className="pb-4 md:pb-8 z-[1] w-full">
                        {filteredTotal.slice(0, count).map((props, index) => {
                          const matchingSubsidy = props.subsidy && props.subsidy.length > 0 ? props.subsidy[0] : null;

                          return (
                            <ResearchItem
                              key={index}
                              among={props.among}
                              articles={props.articles}
                              book={props.book}
                              book_chapters={props.book_chapters}
                              id={props.id}
                              name={props.name}
                              university={props.university}
                              lattes_id={props.lattes_id}
                              area={props.area}
                              lattes_10_id={props.lattes_10_id}
                              city={props.city}
                              graduation={props.graduation}
                              patent={props.patent}
                              subsidy={matchingSubsidy ? [matchingSubsidy] : []}
                              graduate_programs={props.graduate_programs}
                              speaker=""
                              status={false}
                              h_index={props.h_index}
                              relevance_score={props.relevance_score}
                              works_count={props.works_count}
                              cited_by_count={props.cited_by_count}
                              i10_index={props.i10_index}
                              scopus={props.scopus}
                              openalex={props.openalex}
                              departments=""
                            />
                          );
                        })}
                      </Masonry>
                    </ResponsiveMasonry>

                    {filteredTotal.length > count && (
                      <div className="w-full flex justify-center pb-8">
                        <Button className="w-fit" onClick={() => setCount(count + 24)}>
                          <Plus size={16} />
                          Mostrar mais
                        </Button>
                      </div>
                    )}
                  </div>
                )
              ) : (
                isLoading ? (
                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <DataTable columns={columns} data={filteredTotal} />
                )
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  );
}
