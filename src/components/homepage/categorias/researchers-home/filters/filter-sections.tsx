import { MagnifyingGlass, Trash } from 'phosphor-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../ui/accordion';
import { Alert } from '../../../../ui/alert';
import { Button } from '../../../../ui/button';
import { Input } from '../../../../ui/input';
import { Label } from '../../../../ui/label';
import { ToggleGroup, ToggleGroupItem } from '../../../../ui/toggle-group';
import { useResearcherFilters } from '../hooks/use-researcher-filters';

interface FilterSectionsProps {
  filters: ReturnType<typeof useResearcherFilters>;
}

export function FilterSections({ filters }: FilterSectionsProps) {
  return (
    <Accordion
      defaultValue="item-1"
      type="single"
      collapsible
      className="w-full"
    >
      {/* 1. Área de especialidade */}
      <AccordionItem value="item-1" className="w-full">
        <div className="flex items-center justify-between">
          <Label>Área de especialidade</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedAreas.length > 0 && (
              <Button
                onClick={() => filters.setSelectedAreas([])}
                className="lg:h-8 lg:w-8"
                variant={'destructive'}
                size={'icon'}
              >
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger />
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup
            type="multiple"
            variant={'outline'}
            value={filters.selectedAreas}
            onValueChange={filters.handleAreaToggle}
            className="aspect-auto flex flex-wrap items-start justify-start gap-2"
          >
            {filters.uniqueAreas
              .filter((area) => area.trim() !== '')
              .map((area) => (
                <ToggleGroupItem
                  key={area}
                  value={area}
                  className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left gap-2 flex"
                >
                  <Alert
                    className={`w-4 rounded-md border-0 h-4 p-0 ${
                      area.includes('CIENCIAS AGRARIAS')
                        ? 'bg-red-400'
                        : area.includes('CIENCIAS EXATAS E DA TERRA')
                          ? 'bg-green-400'
                          : area.includes('CIENCIAS DA SAUDE')
                            ? 'bg-[#20BDBE]'
                            : area.includes('CIENCIAS HUMANAS')
                              ? 'bg-[#F5831F]'
                              : area.includes('CIENCIAS BIOLOGICAS')
                                ? 'bg-[#EB008B]'
                                : area.includes('ENGENHARIAS')
                                  ? 'bg-[#FCB712]'
                                  : area.includes('CIENCIAS SOCIAIS APLICADAS')
                                    ? 'bg-[#009245]'
                                    : area.includes('LINGUISTICA LETRAS E ARTES')
                                      ? 'bg-[#A67C52]'
                                      : area.includes('OUTROS')
                                        ? 'bg-[#1B1464]'
                                        : 'bg-[#000]'
                    }`}
                  />{' '}
                  {area}
                </ToggleGroupItem>
              ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      {/* 2. Titulação */}
      <AccordionItem value="item-2">
        <div className="flex items-center justify-between">
          <Label>Titulação</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedGraduations.length > 0 && (
              <Button
                onClick={() => filters.setSelectedGraduations([])}
                className="lg:h-8 lg:w-8"
                variant={'destructive'}
                size={'icon'}
              >
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger />
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup
            type="multiple"
            variant={'outline'}
            value={filters.selectedGraduations}
            onValueChange={filters.handleGraduationToggle}
            className="aspect-auto flex flex-wrap items-start justify-start gap-2"
          >
            {filters.uniqueGraduations.map((graduation) => (
              <ToggleGroupItem
                key={graduation}
                value={graduation}
                className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left"
              >
                {graduation}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      {/* 3. Cidade */}
      <AccordionItem value="item-3">
        <div className="flex items-center justify-between">
          <Label>Cidade</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedCities.length > 0 && (
              <Button
                onClick={() => filters.setSelectedCities([])}
                className="lg:h-8 lg:w-8"
                variant={'destructive'}
                size={'icon'}
              >
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger />
          </div>
        </div>
        <AccordionContent>
          <Alert className="h-12 p-2 mb-4 flex items-center justify-between w-full">
            <div className="flex items-center gap-2 w-full flex-1">
              <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
              <Input
                onChange={(e) => filters.setSearchCity(e.target.value)}
                value={filters.searchCity}
                type="text"
                placeholder="Buscar cidade..."
                className="border-0 w-full"
              />
            </div>
          </Alert>

          <ToggleGroup
            type="multiple"
            variant={'outline'}
            value={filters.selectedCities}
            onValueChange={filters.handleCityToggle}
            className="aspect-auto flex flex-wrap items-start justify-start gap-2"
          >
            {filters.filteredCitiesList.map((city) => (
              <ToggleGroupItem
                key={city}
                value={city}
                className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left"
              >
                {city}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      {/* 4. Instituições */}
      <AccordionItem value="item-4">
        <div className="flex items-center justify-between">
          <Label>Instituições</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedUniversities.length > 0 && (
              <Button
                onClick={() => filters.setSelectedUniversities([])}
                className="lg:h-8 lg:w-8"
                variant={'destructive'}
                size={'icon'}
              >
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger />
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup
            type="multiple"
            variant={'outline'}
            value={filters.selectedUniversities}
            onValueChange={filters.handleUniversityToggle}
            className="aspect-auto flex flex-wrap items-start justify-start gap-2"
          >
            {filters.uniqueUniversities.map((university) => (
              <ToggleGroupItem
                key={university}
                value={university}
                className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left"
              >
                {university}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      {/* 5. Bolsa CNPq */}
      <AccordionItem value="item-5">
        <div className="flex items-center justify-between">
          <Label>Bolsa CNPq</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedSubsidies.length > 0 && (
              <Button
                onClick={() => filters.setSelectedSubsidies([])}
                className="lg:h-8 lg:w-8"
                variant={'destructive'}
                size={'icon'}
              >
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger />
          </div>
        </div>
        <AccordionContent>
          <ToggleGroup
            type="multiple"
            variant={'outline'}
            value={filters.selectedSubsidies}
            onValueChange={filters.handleSubsidyToggle}
            className="aspect-auto flex flex-wrap items-start justify-start gap-2"
          >
            {filters.uniqueSubsidies.map((subsidy) => (
              <ToggleGroupItem
                key={subsidy}
                value={subsidy}
                className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left"
              >
                {subsidy === 'pq'
                  ? 'Produtividade em Pesquisa'
                  : subsidy === 'dt'
                    ? 'Desenvolvimento Tecnológico'
                    : subsidy}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>

      {/* 6. Programas de Pós-graduação */}
      <AccordionItem value="item-7">
        <div className="flex items-center justify-between">
          <Label>Programas de Pós-graduação</Label>
          <div className="flex gap-2 items-center">
            {filters.selectedGraduatePrograms.length > 0 && (
              <Button
                onClick={() => filters.setSelectedGraduatePrograms([])}
                className="lg:h-8 lg:w-8"
                variant={'destructive'}
                size={'icon'}
              >
                <Trash size={16} />
              </Button>
            )}
            <AccordionTrigger />
          </div>
        </div>
        <AccordionContent>
          <Alert className="h-12 p-2 mb-4 flex items-center justify-between w-full">
            <div className="flex items-center gap-2 w-full flex-1">
              <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
              <Input
                onChange={(e) => filters.setSearchGraduateProgram(e.target.value)}
                value={filters.searchGraduateProgram}
                type="text"
                placeholder="Buscar programa..."
                className="border-0 w-full"
              />
            </div>
          </Alert>

          <ToggleGroup
            type="multiple"
            variant={'outline'}
            value={filters.selectedGraduatePrograms}
            onValueChange={filters.handleGraduateProgramToggle}
            className="aspect-auto flex flex-wrap items-start justify-start gap-2"
          >
            {filters.filteredGraduateProgramsList.map((program) => (
              <ToggleGroupItem
                key={program}
                value={program}
                className="px-3 py-2 h-auto min-h-10 max-w-full whitespace-normal break-words text-left"
              >
                {program}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
