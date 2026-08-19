import { Trash, X } from 'lucide-react';
import { Badge } from '../../../../ui/badge';
import { Separator } from '../../../../ui/separator';
import { useResearcherFilters } from '../hooks/use-researcher-filters';

interface AppliedFiltersBadgesProps {
  filters: ReturnType<typeof useResearcherFilters>;
}

export function AppliedFiltersBadges({ filters }: AppliedFiltersBadgesProps) {
  if (!filters.hasActiveFilters) return null;

  return (
    <div className="flex flex-col gap-4 w-full">
      <Separator />
      <div className="flex flex-wrap gap-3 items-center">
        <p className="text-sm font-medium">Filtros aplicados:</p>

        {/* Áreas */}
        {filters.selectedAreas.map((item) => (
          <Badge
            key={item}
            className={`gap-2 items-center flex font-normal rounded-md dark:text-white py-2 px-3 ${
              item.includes('CIENCIAS AGRARIAS')
                ? 'bg-red-400'
                : item.includes('CIENCIAS EXATAS E DA TERRA')
                  ? 'bg-green-400'
                  : item.includes('CIENCIAS DA SAUDE')
                    ? 'bg-[#20BDBE]'
                    : item.includes('CIENCIAS HUMANAS')
                      ? 'bg-[#F5831F]'
                      : item.includes('CIENCIAS BIOLOGICAS')
                        ? 'bg-[#EB008B]'
                        : item.includes('ENGENHARIAS')
                          ? 'bg-[#FCB712]'
                          : item.includes('CIENCIAS SOCIAIS APLICADAS')
                            ? 'bg-[#009245]'
                            : item.includes('LINGUISTICA LETRAS E ARTES')
                              ? 'bg-[#A67C52]'
                              : item.includes('OUTROS')
                                ? 'bg-[#1B1464]'
                                : 'bg-[#000]'
            }`}
          >
            {item}
            <div
              onClick={() =>
                filters.handleAreaToggle(
                  filters.selectedAreas.filter((area) => area !== item),
                )
              }
              className="cursor-pointer"
            >
              <X size={16} />
            </div>
          </Badge>
        ))}

        {/* Graduações / Titulações */}
        {filters.selectedGraduations.map((item) => (
          <Badge
            key={item}
            className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
          >
            {item}
            <div
              className="cursor-pointer"
              onClick={() =>
                filters.handleGraduationToggle(
                  filters.selectedGraduations.filter((i) => i !== item),
                )
              }
            >
              <X size={16} />
            </div>
          </Badge>
        ))}

        {/* Cidades */}
        {filters.selectedCities.map((item) => (
          <Badge
            key={item}
            className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
          >
            {item}
            <div
              className="cursor-pointer"
              onClick={() =>
                filters.handleCityToggle(
                  filters.selectedCities.filter((i) => i !== item),
                )
              }
            >
              <X size={16} />
            </div>
          </Badge>
        ))}

        {/* Departamentos */}
        {filters.selectedDepartaments.map((item) => (
          <Badge
            key={item}
            className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
          >
            {item}
            <div
              className="cursor-pointer"
              onClick={() =>
                filters.handleDepartamentToggle(
                  filters.selectedDepartaments.filter((i) => i !== item),
                )
              }
            >
              <X size={16} />
            </div>
          </Badge>
        ))}

        {/* Programas de Pós-graduação */}
        {filters.selectedGraduatePrograms.map((item) => (
          <Badge
            key={item}
            className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
          >
            {item}
            <div
              className="cursor-pointer"
              onClick={() =>
                filters.handleGraduateProgramToggle(
                  filters.selectedGraduatePrograms.filter((i) => i !== item),
                )
              }
            >
              <X size={16} />
            </div>
          </Badge>
        ))}

        {/* Bolsas CNPq */}
        {filters.selectedSubsidies.map((item) => (
          <Badge
            key={item}
            className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
          >
            {item === 'pq'
              ? 'Produtividade em Pesquisa'
              : item === 'dt'
                ? 'Desenvolvimento Tecnológico'
                : item}
            <div
              className="cursor-pointer"
              onClick={() =>
                filters.handleSubsidyToggle(
                  filters.selectedSubsidies.filter((i) => i !== item),
                )
              }
            >
              <X size={16} />
            </div>
          </Badge>
        ))}

        {/* Universidades */}
        {filters.selectedUniversities.map((item) => (
          <Badge
            key={item}
            className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
          >
            {item}
            <div
              className="cursor-pointer"
              onClick={() =>
                filters.handleUniversityToggle(
                  filters.selectedUniversities.filter((i) => i !== item),
                )
              }
            >
              <X size={16} />
            </div>
          </Badge>
        ))}

        {/* Limpar filtros */}
        <Badge
          variant={'secondary'}
          onClick={filters.clearFilters}
          className="rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900 border-0 py-2 px-3 font-normal flex items-center justify-center gap-2"
        >
          <Trash size={12} />
          Limpar filtros
        </Badge>
      </div>
    </div>
  );
}
