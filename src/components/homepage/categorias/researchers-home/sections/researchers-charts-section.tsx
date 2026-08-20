import { ChartBar } from 'phosphor-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../../../components/ui/accordion';
import { Skeleton } from '../../../../ui/skeleton';
import { GraficoAreaPesquisares } from '../../../../listagens/graficos/grafico-area-pesquisadores';
import { GraficoTitulacao } from '../../../../listagens/graficos/grafico-titulacao';
import { HeaderResultTypeHome } from '../../header-result-type-home';

interface ResearchersChartsSectionProps {
  loading: boolean;
  searchType?: string;
}

export function ResearchersChartsSection({
  loading,
  searchType,
}: ResearchersChartsSectionProps) {
  if (searchType === 'name' || searchType === 'area') {
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
            title="Gráficos dos pesquisadores"
            icon={<ChartBar size={24} className="text-gray-400" />}
          />
          <AccordionTrigger />
        </div>
        <AccordionContent className="p-0">
          {loading ? (
            <Skeleton className="rounded-md w-full h-[300px]" />
          ) : (
            <div>
              <div className="grid gap-8 xl:grid-cols-2">
                <GraficoTitulacao />
                <GraficoAreaPesquisares />
              </div>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
