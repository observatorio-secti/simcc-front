import { MapIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../components/ui/accordion';
import { Alert } from '../../../../ui/alert';
import { Skeleton } from '../../../../ui/skeleton';
import { CityData } from '../../../../../types/researcher';
import { HeaderResultTypeHome } from '../../header-result-type-home';
import MapaResearcher from '../mapa-researcher';

interface ResearchersMapSectionProps {
  cityData: CityData[];
  loading: boolean;
  searchType?: string;
  simcc?: boolean;
}

export function ResearchersMapSection({
  cityData,
  loading,
  searchType,
  simcc,
}: ResearchersMapSectionProps) {
  if (searchType === 'name' || !simcc) {
    return null;
  }

  return (
    <Accordion
      defaultValue="item-1"
      type="single"
      collapsible
      className="hidden md:flex"
    >
      <AccordionItem value="item-1" className="w-full">
        <div className="flex mb-2">
          <HeaderResultTypeHome
            title="Pesquisadores no mapa"
            icon={<MapIcon size={24} className="text-gray-400" />}
          />
          <AccordionTrigger />
        </div>
        <AccordionContent className="p-0">
          {loading ? (
            <Skeleton className="rounded-md w-full h-[300px]" />
          ) : (
            <div>
              <Alert className="p-0">
                <MapaResearcher cityData={cityData} />
              </Alert>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
