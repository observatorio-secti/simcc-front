import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useModalResult } from "../../hooks/use-modal-result";
import { UserContext } from "../../../context/context";
import { HeaderResultTypeHome } from "./header-result-type-home";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { Skeleton } from "../../ui/skeleton";
import { Alert } from "../../ui/alert";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { ToggleGroup, ToggleGroupItem } from "../../ui/toggle-group";
import { MapIcon, Trash, User, X } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { MagnifyingGlass } from "phosphor-react";
import { ResultFiltersSlotContext } from "../result-filters-slot-context";
import { ResultFiltersSidebar, ResultFiltersSheet } from "../result-filters-shell";
import MapaResearcher from "./researchers-home/mapa-researcher";
import municipios from "./researchers-home/municipios.json";

type CityData = {
  nome: string;
  latitude: number;
  longitude: number;
  pesquisadores: number;
  professores: string[];
  lattes_10_id: string;
};

export type Research = {
  among: number;
  status: boolean;
  articles: number;
  classe: string;
  cargo: string;
  rt: string;
  progressao: string;
  genero: string;
  entradanaufmg: string;
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
};

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

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

type FiltersModalProps = {
  researcher: Research[];
  setResearcher: React.Dispatch<React.SetStateAction<Research[]>>;
};

function useResearcherFilters({ researcher, setResearcher }: FiltersModalProps) {
  const queryUrl = useQuery();
  const getArrayFromUrl = (key: string) => queryUrl.get(key)?.split(";") || [];

  const [selectedAreas, setSelectedAreas] = useState<string[]>(getArrayFromUrl("areas"));
  const [selectedGraduations, setSelectedGraduations] = useState<string[]>(getArrayFromUrl("graduations"));
  const [selectedCities, setSelectedCities] = useState<string[]>(getArrayFromUrl("cities"));
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(getArrayFromUrl("universities"));
  const [selectedSubsidies, setSelectedSubsidies] = useState<string[]>(getArrayFromUrl("subsidy"));
  const [selectedGraduatePrograms, setSelectedGraduatePrograms] = useState<string[]>(getArrayFromUrl("graduatePrograms"));
  const [selectedDepartaments, setSelectedDepartaments] = useState<string[]>(getArrayFromUrl("departments"));

  const [filteredCount, setFilteredCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = [...researcher];
    if (selectedAreas.length > 0) {
      filtered = filtered.filter((r) =>
        selectedAreas.some((selectedArea) => {
          const areas = r.area && typeof r.area === "string" ? r.area.split(";").map((area) => area.trim()) : [];
          return areas.some((area) => area.includes(selectedArea));
        })
      );
    }
    if (selectedGraduations.length > 0) {
      filtered = filtered.filter((r) => selectedGraduations.includes(r.graduation));
    }
    if (selectedCities.length > 0) {
      filtered = filtered.filter((r) => selectedCities.includes(r.city));
    }
    if (selectedUniversities.length > 0) {
      filtered = filtered.filter((r) => selectedUniversities.includes(r.university));
    }
    if (selectedSubsidies.length > 0) {
      filtered = filtered.filter((r) => {
        if (!r.subsidy || !Array.isArray(r.subsidy)) return false;
        return r.subsidy.some((s) => selectedSubsidies.includes(s.modality_name));
      });
    }
    if (selectedGraduatePrograms.length > 0) {
      filtered = filtered.filter((r) => {
        if (!r.graduate_programs || !Array.isArray(r.graduate_programs)) return false;
        return r.graduate_programs.some((gp) => selectedGraduatePrograms.includes(gp.name));
      });
    }
    if (selectedDepartaments.length > 0) {
      filtered = filtered.filter((r) => {
        if (!r.departments || !Array.isArray(r.departments)) return false;
        return r.departments.some((gp) => selectedDepartaments.includes(gp.dep_sigla));
      });
    }
    setFilteredCount(filtered.length);

    updateFilters("areas", selectedAreas);
    updateFilters("graduations", selectedGraduations);
    updateFilters("cities", selectedCities);
    updateFilters("universities", selectedUniversities);
    updateFilters("subsidy", selectedSubsidies);
    updateFilters("graduatePrograms", selectedGraduatePrograms);
    updateFilters("departments", selectedDepartaments);

    navigate({
      pathname: "/resultados",
      search: queryUrl.toString(),
    });

    setResearcher(filteredResearchers);
  }, [researcher, selectedAreas, selectedGraduations, selectedCities, selectedUniversities, selectedSubsidies, selectedGraduatePrograms, selectedDepartaments]);

  const handleAreaToggle = (value: any) => {
    setSelectedAreas(value);
  };
  const handleGraduationToggle = (value: any) => {
    setSelectedGraduations(value);
  };
  const handleDepartamentToggle = (value: any) => {
    setSelectedDepartaments(value);
  };
  const handleCityToggle = (value: any) => {
    setSelectedCities(value);
  };
  const handleUniversityToggle = (value: any) => {
    setSelectedUniversities(value);
  };
  const handleSubsidyToggle = (value: any) => {
    setSelectedSubsidies(value);
  };
  const handleGraduateProgramToggle = (value: any) => {
    setSelectedGraduatePrograms(value);
  };
  const filteredResearchers = researcher.filter((res) => {
    const areas = res.area && typeof res.area === "string" ? res.area.split(";").map((area) => area.trim()) : [];
    const hasSelectedArea = selectedAreas.length === 0 || selectedAreas.some((selectedArea) => areas.some((area) => area.includes(selectedArea)));
    const hasSelectedGraduation = selectedGraduations.length === 0 || selectedGraduations.includes(res.graduation);
    const hasSelectedCity = selectedCities.length === 0 || selectedCities.includes(res.city);
    const hasSelectedUniversity = selectedUniversities.length === 0 || selectedUniversities.includes(res.university);
    const hasSelectedSubsidy = selectedSubsidies.length === 0 || (res.subsidy && res.subsidy.some((sub) => selectedSubsidies.includes(sub.modality_name)));
    const hasSelectedGraduateProgram = selectedGraduatePrograms.length === 0 || (res.graduate_programs && res.graduate_programs.some((gp) => selectedGraduatePrograms.includes(gp.name)));
    const hasSelectedDepartament = selectedDepartaments.length === 0 || (res.departments && res.departments.some((gp) => selectedDepartaments.includes(gp.dep_sigla)));
    return hasSelectedArea && hasSelectedGraduation && hasSelectedCity && hasSelectedUniversity && hasSelectedSubsidy && hasSelectedGraduateProgram && hasSelectedDepartament;
  });

  const applyFilters = () => {
    setResearcher(filteredResearchers);
  };

  const clearFilters = () => {
    setSelectedAreas([]);
    setSelectedGraduations([]);
    setSelectedCities([]);
    setSelectedUniversities([]);
    setSelectedSubsidies([]);
    setSelectedDepartaments([]);
    setSelectedGraduatePrograms([]);
    setResearcher(researcher);
  };

  const uniqueAreas = Array.from(new Set(researcher.flatMap((res) => (res.area ? res.area.split(";").map((area) => area.trim()) : [])))).filter(Boolean);
  const uniqueGraduations = Array.from(new Set(researcher.map((res) => res.graduation))).filter(Boolean);
  const uniqueCities = Array.from(new Set(researcher.map((res) => res.city))).filter(Boolean);
  const uniqueUniversities = Array.from(new Set(researcher.map((res) => res.university))).filter(Boolean);
  const uniqueSubsidies = Array.from(new Set(researcher.flatMap((res) => (Array.isArray(res.subsidy) ? res.subsidy.map((sub) => sub.modality_name) : [])))).filter(Boolean);
  const uniqueGraduatePrograms = Array.from(new Set(researcher.flatMap((res) => (Array.isArray(res.graduate_programs) ? res.graduate_programs.map((gp) => gp.name) : [])))).filter(Boolean);
  const uniqueDepartaments = Array.from(new Set(researcher.flatMap((res) => (Array.isArray(res.departments) ? res.departments.map((gp) => gp.dep_sigla) : [])))).filter(Boolean);

  useEffect(() => {
    if (researcher.length == 0) {
      setSelectedAreas([]);
      setSelectedGraduations([]);
      setSelectedCities([]);
      setSelectedUniversities([]);
      setSelectedSubsidies([]);
      setSelectedDepartaments([]);
      setSelectedGraduatePrograms([]);
    }
  }, [researcher]);

  const updateFilters = (category: string, values: string[]) => {
    if (values.length > 0) {
      queryUrl.set(category, values.join(";"));
      setResearcher(filteredResearchers);
    } else {
      queryUrl.delete(category);
    }
  };

  useEffect(() => {
    setSelectedAreas(getArrayFromUrl("areas"));
    setSelectedGraduations(getArrayFromUrl("graduations"));
    setSelectedCities(getArrayFromUrl("cities"));
    setSelectedUniversities(getArrayFromUrl("universities"));
    setSelectedSubsidies(getArrayFromUrl("subsidy"));
    setSelectedGraduatePrograms(getArrayFromUrl("graduatePrograms"));
    setSelectedDepartaments(getArrayFromUrl("departments"));
  }, []);

  const [search, setSearch] = useState("");
  const [search2, setSearch2] = useState("");

  const filteredTotal = Array.isArray(uniqueGraduatePrograms)
    ? uniqueGraduatePrograms.filter((item) => {
        const normalizeString = (str: any) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return normalizeString(item).includes(normalizeString(search));
      })
    : [];

  const filteredTotal2 = Array.isArray(uniqueCities)
    ? uniqueCities.filter((item) => {
        const normalizeString = (str: any) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        return normalizeString(item).includes(normalizeString(search2));
      })
    : [];

  const filters = {
    selectedAreas,
    selectedGraduations,
    selectedCities,
    selectedDepartaments,
    selectedGraduatePrograms,
    selectedSubsidies,
    selectedUniversities,
    setSelectedAreas,
    setSelectedGraduations,
    setSelectedCities,
    setSelectedDepartaments,
    setSelectedGraduatePrograms,
    setSelectedSubsidies,
    setSelectedUniversities,
    handleAreaToggle,
    handleGraduationToggle,
    handleDepartamentToggle,
    handleCityToggle,
    handleUniversityToggle,
    handleSubsidyToggle,
    handleGraduateProgramToggle,
    uniqueAreas,
    uniqueGraduations,
    uniqueCities,
    uniqueUniversities,
    uniqueSubsidies,
    uniqueGraduatePrograms,
    uniqueDepartaments,
    search,
    setSearch,
    search2,
    setSearch2,
    filteredTotal,
    filteredTotal2,
    clearFilters,
    applyFilters,
    filteredCount,
  };

  return {
    selectedAreas,
    selectedGraduations,
    selectedCities,
    selectedDepartaments,
    selectedGraduatePrograms,
    selectedSubsidies,
    selectedUniversities,
    setSelectedAreas,
    setSelectedGraduations,
    setSelectedCities,
    setSelectedDepartaments,
    setSelectedGraduatePrograms,
    setSelectedSubsidies,
    setSelectedUniversities,
    clearFilters,
    sidebar: <FiltersSidebar filters={filters} />,
    component: <FiltersSheet filters={filters} />,
  };
}

type FiltersData = {
  selectedAreas: string[];
  selectedGraduations: string[];
  selectedCities: string[];
  selectedDepartaments: string[];
  selectedGraduatePrograms: string[];
  selectedSubsidies: string[];
  selectedUniversities: string[];
  setSelectedAreas: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedGraduations: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedCities: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedDepartaments: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedGraduatePrograms: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedSubsidies: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedUniversities: React.Dispatch<React.SetStateAction<string[]>>;
  handleAreaToggle: (value: any) => void;
  handleGraduationToggle: (value: any) => void;
  handleDepartamentToggle: (value: any) => void;
  handleCityToggle: (value: any) => void;
  handleUniversityToggle: (value: any) => void;
  handleSubsidyToggle: (value: any) => void;
  handleGraduateProgramToggle: (value: any) => void;
  uniqueAreas: string[];
  uniqueGraduations: string[];
  uniqueCities: string[];
  uniqueUniversities: string[];
  uniqueSubsidies: string[];
  uniqueGraduatePrograms: string[];
  uniqueDepartaments: string[];
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  search2: string;
  setSearch2: React.Dispatch<React.SetStateAction<string>>;
  filteredTotal: string[];
  filteredTotal2: string[];
  clearFilters: () => void;
  applyFilters: () => void;
  filteredCount: number;
};

function FilterSections({ filters }: { filters: FiltersData }) {
  const version = false;
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-4">
        <div className="flex items-center justify-between">
          <Label>Instituições</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedUniversities.length > 0 && (
              <Button onClick={() => filters.setSelectedUniversities([])} className="lg:h-8 lg:w-8" variant={"destructive"} size={"icon"}>
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger></AccordionTrigger>
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup type="multiple" variant={"outline"} value={filters.selectedUniversities} onValueChange={filters.handleUniversityToggle} className="aspect-auto flex flex-wrap items-start justify-start gap-2">
            {filters.uniqueUniversities.map((university) => (
              <ToggleGroupItem key={university} value={university} className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left">
                {university}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <div className="flex items-center justify-between">
          <Label>Cidade</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedCities.length > 0 && (
              <Button onClick={() => filters.setSelectedCities([])} className="lg:h-8 lg:w-8" variant={"destructive"} size={"icon"}>
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger></AccordionTrigger>
          </div>
        </div>
        <AccordionContent>
          <Alert className="h-12 p-2 mb-4 flex items-center justify-between  w-full ">
            <div className="flex items-center gap-2 w-full flex-1">
              <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
              <Input onChange={(e) => filters.setSearch2(e.target.value)} value={filters.search2} type="text" className="border-0 w-full " />
            </div>
            <div className="w-fit"></div>
          </Alert>
          <ToggleGroup type="multiple" variant={"outline"} value={filters.selectedCities} onValueChange={filters.handleCityToggle} className="aspect-auto flex flex-wrap items-start justify-start gap-2">
            {filters.filteredTotal2.map((city) => (
              <ToggleGroupItem key={city} value={city} className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left">
                {city}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-2">
        <div className="flex items-center justify-between">
          <Label>Perfil</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedGraduations.length > 0 && (
              <Button onClick={() => filters.setSelectedGraduations([])} className="lg:h-8 lg:w-8" variant={"destructive"} size={"icon"}>
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger></AccordionTrigger>
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup type="multiple" variant={"outline"} value={filters.selectedGraduations} onValueChange={filters.handleGraduationToggle} className="aspect-auto flex flex-wrap items-start justify-start gap-2">
            {filters.uniqueGraduations.map((graduation) => (
              <ToggleGroupItem key={graduation} value={graduation} className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left">
                {graduation}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-1" className="w-full">
        <div className="flex items-center justify-between">
          <Label>Área de especialidade</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedAreas.length > 0 && (
              <Button
                onClick={() => {
                  filters.setSelectedAreas([]);
                  filters.applyFilters();
                }}
                className="lg:h-8 lg:w-8"
                variant={"destructive"}
                size={"icon"}
              >
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger></AccordionTrigger>
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup type="multiple" variant={"outline"} value={filters.selectedAreas} onValueChange={filters.handleAreaToggle} className="aspect-auto flex flex-wrap items-start justify-start gap-2">
            {filters.uniqueAreas
              .filter((area) => area.trim() !== "")
              .map((area) => (
                <ToggleGroupItem key={area} value={area} className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left gap-2 flex">
                  <Alert
                    className={` w-4 rounded-md border-0 h-4 p-0 ${
                      area.includes("CIENCIAS AGRARIAS")
                        ? "bg-red-400"
                        : area.includes("CIENCIAS EXATAS E DA TERRA")
                          ? "bg-green-400"
                          : area.includes("CIENCIAS DA SAUDE")
                            ? "bg-[#20BDBE]"
                            : area.includes("CIENCIAS HUMANAS")
                              ? "bg-[#F5831F]"
                              : area.includes("CIENCIAS BIOLOGICAS")
                                ? "bg-[#EB008B]"
                                : area.includes("ENGENHARIAS")
                                  ? "bg-[#FCB712]"
                                  : area.includes("CIENCIAS SOCIAIS APLICADAS")
                                    ? "bg-[#009245]"
                                    : area.includes("LINGUISTICA LETRAS E ARTES")
                                      ? "bg-[#A67C52]"
                                      : area.includes("OUTROS")
                                        ? "bg-[#1B1464]"
                                        : "bg-[#000]"
                    }`}
                  />{" "}
                  {area}
                </ToggleGroupItem>
              ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-5">
        <div className="flex items-center justify-between">
          <Label>Bolsa CNPq</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedSubsidies.length > 0 && (
              <Button onClick={() => filters.setSelectedSubsidies([])} className="lg:h-8 lg:w-8" variant={"destructive"} size={"icon"}>
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger></AccordionTrigger>
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup type="multiple" variant={"outline"} value={filters.selectedSubsidies} onValueChange={filters.handleSubsidyToggle} className="aspect-auto flex flex-wrap items-start justify-start gap-2">
            {filters.uniqueSubsidies.map((subsidy) => (
              <ToggleGroupItem key={subsidy} value={subsidy} className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left">
                {subsidy === "pq" ? "Produtividade em Pesquisa" : subsidy === "dt" ? "Desenvolvimento Tecnológico" : subsidy}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      {version && (
        <AccordionItem value="item-6">
          <div className="flex items-center justify-between">
            <Label>Departamentos</Label>
            <div className="flex gap-2 items-center">
              {filters.selectedDepartaments.length > 0 && (
                <Button onClick={() => filters.setSelectedDepartaments([])} className="lg:h-8 lg:w-8" variant={"destructive"} size={"icon"}>
                  <Trash size={16} />
                </Button>
              )}
              <AccordionTrigger></AccordionTrigger>
            </div>
          </div>
          <AccordionContent>
            <ToggleGroup type="multiple" variant={"outline"} value={filters.selectedDepartaments} onValueChange={filters.handleDepartamentToggle} className="aspect-auto flex flex-wrap items-start justify-start gap-2">
              {filters.uniqueDepartaments.map((program) => (
                <ToggleGroupItem key={program} value={program} className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left">
                  {program}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </AccordionContent>
        </AccordionItem>
      )}
    </Accordion>
  );
}

function FiltersSidebar({ filters }: { filters: FiltersData }) {
  return (
    <ResultFiltersSidebar onClear={filters.clearFilters}>
      <FilterSections filters={filters} />
    </ResultFiltersSidebar>
  );
}

function FiltersSheet({ filters }: { filters: FiltersData }) {
  return (
    <ResultFiltersSheet onClear={filters.clearFilters} onApply={filters.applyFilters} filteredCount={filters.filteredCount}>
      <FilterSections filters={filters} />
    </ResultFiltersSheet>
  );
}

export function MapaHome() {
  const { isOpen, type } = useModalResult();
  const [loading, setLoading] = useState(false);
  const [researcher, setResearcher] = useState<Research[]>([]);
  const [originalResearcher, setOriginalResearcher] = useState<Research[]>([]);
  const [cityData, setCityData] = useState<CityData[]>([]);
  const { urlGeral, searchType, simcc } = useContext(UserContext);
  const { pesquisadoresSelecionados, idGraduateProgram } = useContext(UserContext);
  const { slot: filtersSlot } = useContext(ResultFiltersSlotContext);

  const queryUrl = useQuery();
  const terms = queryUrl.get("terms");

  let urlTermPesquisadores = ``;
  if (searchType === "name") {
    urlTermPesquisadores = `${urlGeral}researcherName?name=${terms?.replace(/[;|()]/g, "")}`;
  } else if (searchType === "article") {
    urlTermPesquisadores = `${urlGeral}researcher?terms=${terms}&university=&type=ARTICLE&graduate_program_id=${idGraduateProgram == "0" ? "" : idGraduateProgram}`;
  } else if (searchType === "book") {
    urlTermPesquisadores = `${urlGeral}researcherBook?term=${terms}&university=&type=BOOK&graduate_program_id=${idGraduateProgram == "0" ? "" : idGraduateProgram}`;
  } else if (searchType === "area") {
    urlTermPesquisadores = `${urlGeral}researcherArea_specialty?area_specialty=${terms}&university=&graduate_program_id=${idGraduateProgram == "0" ? "" : idGraduateProgram}`;
  } else if (searchType === "speaker") {
    urlTermPesquisadores = `${urlGeral}researcherParticipationEvent?term=${terms}&university=&graduate_program_id=${idGraduateProgram == "0" ? "" : idGraduateProgram}`;
  } else if (searchType === "patent") {
    urlTermPesquisadores = `${urlGeral}researcherPatent?term=${terms}&graduate_program_id=${idGraduateProgram == "0" ? "" : idGraduateProgram}&university=`;
  } else if (searchType === "abstract") {
    urlTermPesquisadores = `${urlGeral}researcher?terms=${terms}&university=&type=ABSTRACT&graduate_program_id=${idGraduateProgram == "0" ? "" : idGraduateProgram}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!urlTermPesquisadores) return;
      try {
        setLoading(true);
        const allResearchers: Research[] = [];
        let page = 1;
        let batch: Research[] = [];
        const sep = urlTermPesquisadores.includes("?") ? "&" : "?";
        try {
          do {
            const response = await fetch(`${urlTermPesquisadores}${sep}page=${page}`, {
              mode: "cors",
              headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "3600",
                "Content-Type": "text/plain",
              },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            batch = await response.json();
            allResearchers.push(...batch);
            page++;
            if (batch.length < 100) break;
            if (page > 100) break;
          } while (batch.length > 0);
        } catch (err) {
          if (allResearchers.length === 0) {
            try {
              const response = await fetch(urlTermPesquisadores, {
                mode: "cors",
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET",
                  "Access-Control-Allow-Headers": "Content-Type",
                  "Access-Control-Max-Age": "3600",
                  "Content-Type": "text/plain",
                },
              });
              const single = await response.json();
              allResearchers.push(...single);
            } catch (singleErr) {
              console.error("Fallback fetch error:", singleErr);
            }
          }
        }
        if (allResearchers.length > 0) {
          setResearcher(allResearchers);
          setOriginalResearcher(allResearchers);
        } else {
          setResearcher([]);
          setOriginalResearcher([]);
        }
      } catch (err) {
        console.error("Main data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [urlTermPesquisadores]);

  const normalizeCityName = (cityName: string) => {
    return cityName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  useEffect(() => {
    const processCityData = () => {
      const cityMap = new Map<string, CityData>();
      const municipioMap = new Map(municipios.map((m) => [normalizeCityName(m.nome), m]));
      researcher.forEach((r) => {
        if (r.city) {
          const normalizedCity = normalizeCityName(r.city);
          const municipio = municipioMap.get(normalizedCity);
          if (!municipio) return;
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
  }, [researcher]);

  const {
    setSelectedAreas,
    setSelectedGraduations,
    setSelectedCities,
    setSelectedDepartaments,
    setSelectedGraduatePrograms,
    setSelectedSubsidies,
    setSelectedUniversities,
    clearFilters,
    selectedAreas,
    selectedGraduations,
    component,
    sidebar,
    selectedCities,
    selectedDepartaments,
    selectedGraduatePrograms,
    selectedSubsidies,
    selectedUniversities,
  } = useResearcherFilters({
    researcher: originalResearcher,
    setResearcher,
  });

  const hasActiveFilters =
    selectedAreas.length > 0 ||
    selectedCities.length > 0 ||
    selectedDepartaments.length > 0 ||
    selectedGraduatePrograms.length > 0 ||
    selectedGraduations.length > 0 ||
    selectedSubsidies.length > 0 ||
    selectedUniversities.length > 0;

  const isHiddenForContext = searchType == "name" || !simcc;

  return (
    <div className="w-full h-full">
      <div className="w-full flex gap-4 justify-center items-start">
        {filtersSlot && createPortal(sidebar, filtersSlot)}
        <div className="flex-1 gap-4 flex flex-col">
          <div className={`flex flex-col gap-4 w-full ${hasActiveFilters ? "flex" : "hidden"}`}>
            <Separator />
            <div className="flex flex-wrap gap-3 items-center">
              <p className="text-sm font-medium">Filtros aplicados:</p>
              {selectedAreas.map((item) => (
                <Badge
                  key={item}
                  className={` gap-2 items-center flex font-normal  rounded-md  dark:text-white py-2 px-3 ${
                    item.includes("CIENCIAS AGRARIAS")
                      ? "bg-red-400"
                      : item.includes("CIENCIAS EXATAS E DA TERRA")
                        ? "bg-green-400"
                        : item.includes("CIENCIAS DA SAUDE")
                          ? "bg-[#20BDBE]"
                          : item.includes("CIENCIAS HUMANAS")
                            ? "bg-[#F5831F]"
                            : item.includes("CIENCIAS BIOLOGICAS")
                              ? "bg-[#EB008B]"
                              : item.includes("ENGENHARIAS")
                                ? "bg-[#FCB712]"
                                : item.includes("CIENCIAS SOCIAIS APLICADAS")
                                  ? "bg-[#009245]"
                                  : item.includes("LINGUISTICA LETRAS E ARTES")
                                    ? "bg-[#A67C52]"
                                    : item.includes("OUTROS")
                                      ? "bg-[#1B1464]"
                                      : "bg-[#000]"
                  }`}
                >
                  {item}
                  <div onClick={() => setSelectedAreas(selectedAreas.filter((area) => area !== item))} className="cursor-pointer">
                    <X size={16} />
                  </div>
                </Badge>
              ))}
              {selectedGraduations.map((item) => (
                <Badge key={item} className="bg-eng-blue gap-2 items-center flex font-normal  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3 ">
                  {item}
                  <div className="cursor-pointer" onClick={() => setSelectedGraduations(selectedGraduations.filter((i) => i !== item))}>
                    <X size={16} />
                  </div>
                </Badge>
              ))}
              {selectedCities.map((item) => (
                <Badge key={item} className="bg-eng-blue gap-2 items-center flex font-normal  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3">
                  {item}
                  <div className="cursor-pointer" onClick={() => setSelectedCities(selectedCities.filter((i) => i !== item))}>
                    <X size={16} />
                  </div>
                </Badge>
              ))}
              {selectedDepartaments.map((item) => (
                <Badge key={item} className="bg-eng-blue gap-2 items-center flex font-normal  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3">
                  {item}
                  <div className="cursor-pointer" onClick={() => setSelectedDepartaments(selectedDepartaments.filter((i) => i !== item))}>
                    <X size={16} />
                  </div>
                </Badge>
              ))}
              {selectedGraduatePrograms.map((item) => (
                <Badge key={item} className="bg-eng-blue gap-2 items-center flex font-normal  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3">
                  {item}
                  <div className="cursor-pointer" onClick={() => setSelectedGraduatePrograms(selectedGraduatePrograms.filter((i) => i !== item))}>
                    <X size={16} />
                  </div>
                </Badge>
              ))}
              {selectedSubsidies.map((item) => (
                <Badge key={item} className="bg-eng-blue gap-2 items-center flex font-normal  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3">
                  {item}
                  <div className="cursor-pointer" onClick={() => setSelectedSubsidies(selectedSubsidies.filter((i) => i !== item))}>
                    <X size={16} />
                  </div>
                </Badge>
              ))}
              {selectedUniversities.map((item) => (
                <Badge key={item} className="bg-eng-blue gap-2 items-center flex font-normal  rounded-md dark:bg-eng-blue  dark:text-white py-2 px-3">
                  {item}
                  <div className="cursor-pointer" onClick={() => setSelectedUniversities(selectedUniversities.filter((i) => i !== item))}>
                    <X size={16} />
                  </div>
                </Badge>
              ))}
              <Badge variant={"secondary"} onClick={() => clearFilters()} className=" rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900 border-0  py-2 px-3 font-normal flex items-center justify-center gap-2">
                <Trash size={12} />
                Limpar filtros
              </Badge>
            </div>
          </div>

          {!isHiddenForContext && (
            <div className="grid gap-4 mt-4 md:grid-cols-2">
              <Alert className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de pesquisadores</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{researcher.length.toLocaleString("pt-BR")}</div>
                  {originalResearcher.length !== researcher.length ? (
                    <p className="text-xs text-muted-foreground">de {originalResearcher.length.toLocaleString("pt-BR")} encontrados</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">encontrados na busca</p>
                  )}
                </CardContent>
              </Alert>
              <Alert className="p-0">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cidades no mapa</CardTitle>
                  <MapIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cityData.length.toLocaleString("pt-BR")}</div>
                  <p className="text-xs text-muted-foreground">com pesquisadores localizados</p>
                </CardContent>
              </Alert>
            </div>
          )}

          {isHiddenForContext ? (
            <Alert className="py-8 text-center text-sm text-muted-foreground">Mapa indisponível para este tipo de busca.</Alert>
          ) : (
            <Accordion defaultValue="item-1" type="single" collapsible className="hidden md:flex w-full">
              <AccordionItem value="item-1" className="w-full">
                <div className="flex mb-2">
                  <HeaderResultTypeHome title="Pesquisadores no mapa" icon={<MapIcon size={24} className="text-gray-400" />}></HeaderResultTypeHome>
                  <AccordionTrigger></AccordionTrigger>
                </div>
                <AccordionContent className="p-0">
                  {loading ? (
                    <Skeleton className="rounded-md w-full h-[480px] lg:h-[520px] xl:h-[560px]" />
                  ) : (
                    <div>
                      <Alert className="p-0 overflow-hidden">
                        <MapaResearcher cityData={cityData} heightClass="h-[480px] lg:h-[520px] xl:h-[560px]" />
                      </Alert>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

        </div>
        {component}
      </div>
    </div>
  );
}
