import { lazy, Suspense } from 'react';
import { MapIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../components/ui/accordion';
import { Alert } from '../../../../ui/alert';
import { Skeleton } from '../../../../ui/skeleton';
import type { Research } from '../../../../../types/researcher';
import { HeaderResultTypeHome } from '../../header-result-type-home';

const BahiaTerritoriosMap = lazy(() => import('../mapa-researcher-v2'));

interface ResearchersMapSectionProps {
  researchers: Research[];
  loading: boolean;
  searchType?: string;
  simcc?: boolean;
}

export function ResearchersMapSection({
  researchers,
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
              <Alert className="p-0 overflow-hidden">
                <Suspense
                  fallback={
                    <Skeleton className="rounded-md w-full h-[300px]" />
                  }
                >
                  <BahiaTerritoriosMap researchers={researchers} />
                </Suspense>
              </Alert>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
