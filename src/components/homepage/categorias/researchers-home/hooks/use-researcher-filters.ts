import { useMemo, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Research, ResearcherFilterApiResponse } from '../../../../../types/researcher';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export interface UseResearcherFiltersProps {
  researchers: Research[];
  apiFilters?: ResearcherFilterApiResponse;
}

export function useResearcherFilters({
  researchers,
  apiFilters,
}: UseResearcherFiltersProps) {
  const queryUrl = useQuery();
  const navigate = useNavigate();

  const getArrayFromUrl = useCallback(
    (key: string) => queryUrl.get(key)?.split(';').filter(Boolean) || [],
    [queryUrl],
  );

  const [selectedIdentityTerritories, setSelectedIdentityTerritories] = useState<string[]>(() => {
    const t = getArrayFromUrl('identity_territories');
    return t.length > 0 ? t : getArrayFromUrl('identity_territory');
  });
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

  useEffect(() => {
    const territories = getArrayFromUrl('identity_territories');
    setSelectedIdentityTerritories(
      territories.length > 0 ? territories : getArrayFromUrl('identity_territory'),
    );
    setSelectedAreas(getArrayFromUrl('areas'));
    setSelectedGraduations(getArrayFromUrl('graduations'));
    setSelectedCities(getArrayFromUrl('cities'));
    setSelectedUniversities(getArrayFromUrl('universities'));
    setSelectedSubsidies(getArrayFromUrl('subsidy'));
    setSelectedGraduatePrograms(getArrayFromUrl('graduatePrograms'));
    setSelectedDepartaments(getArrayFromUrl('departments'));
  }, [getArrayFromUrl]);

  const [searchIdentityTerritory, setSearchIdentityTerritory] = useState('');
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
      identity_territories:
        key === 'identity_territories' ? values : selectedIdentityTerritories,
      areas: key === 'areas' ? values : selectedAreas,
      graduations: key === 'graduations' ? values : selectedGraduations,
      cities: key === 'cities' ? values : selectedCities,
      universities: key === 'universities' ? values : selectedUniversities,
      subsidy: key === 'subsidy' ? values : selectedSubsidies,
      graduatePrograms: key === 'graduatePrograms' ? values : selectedGraduatePrograms,
      departments: key === 'departments' ? values : selectedDepartaments,
    });
  };

  const handleIdentityTerritoryToggle = (value: string[]) => {
    setSelectedIdentityTerritories(value);
    updateFiltersAndUrl('identity_territories', value);
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
    setSelectedIdentityTerritories([]);
    setSelectedAreas([]);
    setSelectedGraduations([]);
    setSelectedCities([]);
    setSelectedUniversities([]);
    setSelectedSubsidies([]);
    setSelectedDepartaments([]);
    setSelectedGraduatePrograms([]);
    updateUrlParams({
      identity_territories: [],
      areas: [],
      graduations: [],
      cities: [],
      universities: [],
      subsidy: [],
      graduatePrograms: [],
      departments: [],
    });
  };

  // Extrai listas de opções: prioriza retorno de /researcher_filter (apiFilters) com fallback nos pesquisadores carregados
  const uniqueIdentityTerritories = useMemo(() => {
    if (apiFilters?.identity_territory && apiFilters.identity_territory.length > 0) {
      return apiFilters.identity_territory;
    }
    return Array.from(
      new Set(
        researchers.map(
          (res) => res.identity_territory || res.institution?.identity_territory,
        ),
      ),
    ).filter(Boolean) as string[];
  }, [apiFilters, researchers]);

  const uniqueAreas = useMemo(() => {
    if (apiFilters?.area && apiFilters.area.length > 0) {
      return apiFilters.area;
    }
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          res.area ? res.area.split(';').map((area) => area.trim()) : [],
        ),
      ),
    ).filter(Boolean);
  }, [apiFilters, researchers]);

  const uniqueGraduations = useMemo(() => {
    if (apiFilters?.graduation && apiFilters.graduation.length > 0) {
      return apiFilters.graduation;
    }
    return Array.from(
      new Set(researchers.map((res) => res.graduation)),
    ).filter(Boolean);
  }, [apiFilters, researchers]);

  const uniqueCities = useMemo(() => {
    if (apiFilters?.city && apiFilters.city.length > 0) {
      return apiFilters.city;
    }
    return Array.from(new Set(researchers.map((res) => res.city))).filter(Boolean);
  }, [apiFilters, researchers]);

  const uniqueUniversities = useMemo(() => {
    if (apiFilters?.institution && apiFilters.institution.length > 0) {
      return apiFilters.institution;
    }
    return Array.from(
      new Set(researchers.map((res) => res.university)),
    ).filter(Boolean);
  }, [apiFilters, researchers]);

  const uniqueSubsidies = useMemo(() => {
    if (apiFilters?.modality && apiFilters.modality.length > 0) {
      return apiFilters.modality;
    }
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          Array.isArray(res.subsidy)
            ? res.subsidy.map((sub) => sub.modality_name)
            : [],
        ),
      ),
    ).filter(Boolean);
  }, [apiFilters, researchers]);

  const uniqueGraduatePrograms = useMemo(() => {
    if (apiFilters?.graduate_program && apiFilters.graduate_program.length > 0) {
      return apiFilters.graduate_program;
    }
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          Array.isArray(res.graduate_programs)
            ? res.graduate_programs.map((gp) => gp.name)
            : [],
        ),
      ),
    ).filter(Boolean);
  }, [apiFilters, researchers]);

  const uniqueDepartaments = useMemo(() => {
    if (apiFilters?.departament && apiFilters.departament.length > 0) {
      return apiFilters.departament;
    }
    return Array.from(
      new Set(
        researchers.flatMap((res) =>
          Array.isArray(res.departments)
            ? res.departments.map((gp) => gp.dep_sigla)
            : [],
        ),
      ),
    ).filter(Boolean);
  }, [apiFilters, researchers]);

  // Territórios de identidade filtrados pela busca
  const filteredIdentityTerritoriesList = useMemo(() => {
    if (!searchIdentityTerritory.trim()) return uniqueIdentityTerritories;
    const normalizeString = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const normalizedSearch = normalizeString(searchIdentityTerritory);
    return uniqueIdentityTerritories.filter((item) =>
      normalizeString(item).includes(normalizedSearch),
    );
  }, [uniqueIdentityTerritories, searchIdentityTerritory]);

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

      const hasSelectedIdentityTerritory =
        selectedIdentityTerritories.length === 0 ||
        selectedIdentityTerritories.some((selectedTerritory) => {
          const t =
            res.identity_territory ||
            res.institution?.identity_territory ||
            '';
          return t.toLowerCase().includes(selectedTerritory.toLowerCase());
        });

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
        hasSelectedIdentityTerritory &&
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
    selectedIdentityTerritories,
    selectedAreas,
    selectedGraduations,
    selectedCities,
    selectedUniversities,
    selectedSubsidies,
    selectedGraduatePrograms,
    selectedDepartaments,
  ]);

  const hasActiveFilters =
    selectedIdentityTerritories.length > 0 ||
    selectedAreas.length > 0 ||
    selectedGraduations.length > 0 ||
    selectedCities.length > 0 ||
    selectedUniversities.length > 0 ||
    selectedSubsidies.length > 0 ||
    selectedGraduatePrograms.length > 0 ||
    selectedDepartaments.length > 0;

  return {
    selectedIdentityTerritories,
    selectedAreas,
    selectedGraduations,
    selectedCities,
    selectedUniversities,
    selectedSubsidies,
    selectedGraduatePrograms,
    selectedDepartaments,
    setSelectedIdentityTerritories,
    setSelectedAreas,
    setSelectedGraduations,
    setSelectedCities,
    setSelectedUniversities,
    setSelectedSubsidies,
    setSelectedGraduatePrograms,
    setSelectedDepartaments,
    handleIdentityTerritoryToggle,
    handleAreaToggle,
    handleGraduationToggle,
    handleCityToggle,
    handleUniversityToggle,
    handleSubsidyToggle,
    handleGraduateProgramToggle,
    handleDepartamentToggle,
    uniqueIdentityTerritories,
    uniqueAreas,
    uniqueGraduations,
    uniqueCities,
    uniqueUniversities,
    uniqueSubsidies,
    uniqueGraduatePrograms,
    uniqueDepartaments,
    filteredIdentityTerritoriesList,
    filteredCitiesList,
    filteredGraduateProgramsList,
    searchIdentityTerritory,
    setSearchIdentityTerritory,
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
