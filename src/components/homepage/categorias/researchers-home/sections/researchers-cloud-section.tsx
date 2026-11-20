import { ListNumbers } from 'phosphor-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../components/ui/accordion';
import { Skeleton } from '../../../../ui/skeleton';
import { Research } from '../../../../../types/researcher';
import { HeaderResultTypeHome } from '../../header-result-type-home';
import { CloudWordResearcherHome } from '../clould-word-researcher-home';

interface ResearchersCloudSectionProps {
  researchers: Research[];
  loading: boolean;
  searchType?: string;
}

export function ResearchersCloudSection({
  researchers,
  loading,
  searchType,
}: ResearchersCloudSectionProps) {
  if (
    searchType === 'abstract' ||
    searchType === 'name' ||
    searchType === 'area'
  ) {
    return null;
  }

  return (
    <Accordion
      defaultValue="item-1"
      type="single"
      collapsible
      className="hidden md:flex w-full"
    >
      <AccordionItem value="item-1" className="w-full">
        <div className="flex w-full">
          <HeaderResultTypeHome
            title="Pesquisadores mais relevantes por ordem de ocorrências"
            icon={<ListNumbers size={24} className="text-gray-400" />}
          />
          <AccordionTrigger />
        </div>
        <AccordionContent className="w-full p-0">
          {loading ? (
            <Skeleton className="w-full rounded-md h-[300px]" />
          ) : (
            <CloudWordResearcherHome researcher={researchers} />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
