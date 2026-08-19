import { useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Research } from '../../../../../types/researcher';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export interface UseResearcherFiltersProps {
  researchers: Research[];
}

export function useResearcherFilters({ researchers }: UseResearcherFiltersProps) {
  const queryUrl = useQuery();
  const navigate = useNavigate();

  const getArrayFromUrl = useCallback(
    (key: string) => queryUrl.get(key)?.split(';').filter(Boolean) || [],
    [queryUrl],
  );

  const [selectedAreas, setSelectedAreas] = useState<string[]>(() =>
    getArrayFromUrl('areas'),
  );
  const [selectedGraduations, setSelectedGraduations] = useState<string[]>(() =>
    getArrayFromUrl('graduations'),
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(() =>
    getArrayFromUrl('cities'),
  );
  const [selectedUniversities, setSelectedUniversities] = useState<string[]>(() =>
    getArrayFromUrl('universities'),
  );
  const [selectedSubsidies, setSelectedSubsidies] = useState<string[]>(() =>
    getArrayFromUrl('subsidy'),
  );
  const [selectedGraduatePrograms, setSelectedGraduatePrograms] = useState<string[]>(() =>
    getArrayFromUrl('graduatePrograms'),
  );
  const [selectedDepartaments, setSelectedDepartaments] = useState<string[]>(() =>
    getArrayFromUrl('departments'),
  );

  const [searchGraduateProgram, setSearchGraduateProgram] = useState('');
  const [searchCity, setSearchCity] = useState('');

  // Sincroniza parâmetros na URL quando os filtros mudam
  const updateUrlParams = useCallback(
    (newFilters: Record<string, string[]>) => {
      const newQuery = new URLSearchParams(window.location.search);
      Object.entries(newFilters).forEach(([key, values]) => {
        if (values && values.length > 0) {
          newQuery.set(key, values.join(';'));
        } else {
          newQuery.delete(key);
        }
      });

      navigate(
        {
          pathname: '/resultados',
          search: newQuery.toString(),
        },
        { replace: true },
      );
    },
    [navigate],
  );

  const updateFiltersAndUrl = (key: string, values: string[]) => {
    updateUrlParams({
      areas: key === 'areas' ? values : selectedAreas,
      graduations: key === 'graduations' ? values : selectedGraduations,
      cities: key === 'cities' ? values : selectedCities,
      universities: key === 'universities' ? values : selectedUniversities,
      subsidy: key === 'subsidy' ? values : selectedSubsidies,
      graduatePrograms: key === 'graduatePrograms' ? values : selectedGraduatePrograms,
      departments: key === 'departments' ? values : selectedDepartaments,
    });
  };

  const handleAreaToggle = (value: string[]) => {
    setSelectedAreas(value);
    updateFiltersAndUrl('areas', value);
  };

  const handleGraduationToggle = (value: string[]) => {
    setSelectedGraduations(value);
    updateFiltersAndUrl('graduations', value);
  };

  const handleCityToggle = (value: string[]) => {
    setSelectedCities(value);
    updateFiltersAndUrl('cities', value);
  };

  const handleUniversityToggle = (value: string[]) => {
    setSelectedUniversities(value);
    updateFiltersAndUrl('universities', value);
  };

  const handleSubsidyToggle = (value: string[]) => {
    setSelectedSubsidies(value);
    updateFiltersAndUrl('subsidy', value);
  };

  const handleGraduateProgramToggle = (value: string[]) => {
    setSelectedGraduatePrograms(value);
    updateFiltersAndUrl('graduatePrograms', value);
  };

  const handleDepartamentToggle = (value: string[]) => {
    setSelectedDepartaments(value);
    updateFiltersAndUrl('departments', value);
  };

  const clearFilters = () => {
    setSelectedAreas([]);
    setSelectedGraduations([]);
    setSelectedCities([]);
    setSelectedUniversities([]);
    setSelectedSubsidies([]);
    setSelectedDepartaments([]);
    setSelectedGraduatePrograms([]);
    updateUrlParams({
      areas: [],
      graduations: [],
      cities: [],
      universities: [],
      subsidy: [],
      graduatePrograms: [],
      departments: [],
    });
  };

  // Extrai listas únicas a partir dos pesquisadores carregados
  const uniqueAreas = useMemo(() => {
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          res.area ? res.area.split(';').map((area) => area.trim()) : [],
        ),
      ),
    ).filter(Boolean);
  }, [researchers]);

  const uniqueGraduations = useMemo(() => {
    return Array.from(
      new Set(researchers.map((res) => res.graduation)),
    ).filter(Boolean);
  }, [researchers]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(researchers.map((res) => res.city))).filter(Boolean);
  }, [researchers]);

  const uniqueUniversities = useMemo(() => {
    return Array.from(
      new Set(researchers.map((res) => res.university)),
    ).filter(Boolean);
  }, [researchers]);

  const uniqueSubsidies = useMemo(() => {
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          Array.isArray(res.subsidy)
            ? res.subsidy.map((sub) => sub.modality_name)
            : [],
        ),
      ),
    ).filter(Boolean);
  }, [researchers]);

  const uniqueGraduatePrograms = useMemo(() => {
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          Array.isArray(res.graduate_programs)
            ? res.graduate_programs.map((gp) => gp.name)
            : [],
        ),
      ),
    ).filter(Boolean);
  }, [researchers]);

  const uniqueDepartaments = useMemo(() => {
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          Array.isArray(res.departments)
            ? res.departments.map((gp) => gp.dep_sigla)
            : [],
        ),
      ),
    ).filter(Boolean);
  }, [researchers]);

  // Cidades filtradas pela busca interna no accordion
  const filteredCitiesList = useMemo(() => {
    if (!searchCity.trim()) return uniqueCities;
    const normalizeString = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const normalizedSearch = normalizeString(searchCity);
    return uniqueCities.filter((item) =>
      normalizeString(item).includes(normalizedSearch),
    );
  }, [uniqueCities, searchCity]);

  // Programas filtrados pela busca interna no accordion
  const filteredGraduateProgramsList = useMemo(() => {
    if (!searchGraduateProgram.trim()) return uniqueGraduatePrograms;
    const normalizeString = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const normalizedSearch = normalizeString(searchGraduateProgram);
    return uniqueGraduatePrograms.filter((item) =>
      normalizeString(item).includes(normalizedSearch),
    );
  }, [uniqueGraduatePrograms, searchGraduateProgram]);

  // Aplica todos os filtros sobre a lista de pesquisadores
  const filteredResearchers = useMemo(() => {
    return researchers.filter((res) => {
      const areas =
        res.area && typeof res.area === 'string'
          ? res.area.split(';').map((area) => area.trim())
          : [];

      const hasSelectedArea =
        selectedAreas.length === 0 ||
        selectedAreas.some((selectedArea) =>
          areas.some((area) => area.includes(selectedArea)),
        );

      const hasSelectedGraduation =
        selectedGraduations.length === 0 ||
        selectedGraduations.includes(res.graduation);

      const hasSelectedCity =
        selectedCities.length === 0 || selectedCities.includes(res.city);

      const hasSelectedUniversity =
        selectedUniversities.length === 0 ||
        selectedUniversities.includes(res.university);

      const hasSelectedSubsidy =
        selectedSubsidies.length === 0 ||
        (res.subsidy &&
          Array.isArray(res.subsidy) &&
          res.subsidy.some((sub) =>
            selectedSubsidies.includes(sub.modality_name),
          ));

      const hasSelectedGraduateProgram =
        selectedGraduatePrograms.length === 0 ||
        (res.graduate_programs &&
          Array.isArray(res.graduate_programs) &&
          res.graduate_programs.some((gp) =>
            selectedGraduatePrograms.includes(gp.name),
          ));

      const hasSelectedDepartament =
        selectedDepartaments.length === 0 ||
        (res.departments &&
          Array.isArray(res.departments) &&
          res.departments.some((gp) =>
            selectedDepartaments.includes(gp.dep_sigla),
          ));

      return (
        hasSelectedArea &&
        hasSelectedGraduation &&
        hasSelectedCity &&
        hasSelectedUniversity &&
        hasSelectedSubsidy &&
        hasSelectedGraduateProgram &&
        hasSelectedDepartament
      );
    });
  }, [
    researchers,
    selectedAreas,
    selectedGraduations,
    selectedCities,
    selectedUniversities,
    selectedSubsidies,
    selectedGraduatePrograms,
    selectedDepartaments,
  ]);

  const hasActiveFilters =
    selectedAreas.length > 0 ||
    selectedGraduations.length > 0 ||
    selectedCities.length > 0 ||
    selectedUniversities.length > 0 ||
    selectedSubsidies.length > 0 ||
    selectedGraduatePrograms.length > 0 ||
    selectedDepartaments.length > 0;

  return {
    selectedAreas,
    selectedGraduations,
    selectedCities,
    selectedUniversities,
    selectedSubsidies,
    selectedGraduatePrograms,
    selectedDepartaments,
    setSelectedAreas,
    setSelectedGraduations,
    setSelectedCities,
    setSelectedUniversities,
    setSelectedSubsidies,
    setSelectedGraduatePrograms,
    setSelectedDepartaments,
    handleAreaToggle,
    handleGraduationToggle,
    handleCityToggle,
    handleUniversityToggle,
    handleSubsidyToggle,
    handleGraduateProgramToggle,
    handleDepartamentToggle,
    uniqueAreas,
    uniqueGraduations,
    uniqueCities,
    uniqueUniversities,
    uniqueSubsidies,
    uniqueGraduatePrograms,
    uniqueDepartaments,
    filteredCitiesList,
    filteredGraduateProgramsList,
    searchCity,
    setSearchCity,
    searchGraduateProgram,
    setSearchGraduateProgram,
    filteredResearchers,
    filteredCount: filteredResearchers.length,
    hasActiveFilters,
    clearFilters,
  };
}

export type ResearcherFiltersContextType = ReturnType<typeof useResearcherFilters>;
