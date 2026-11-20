import { ListNumbers } from 'phosphor-react';
import { ResearcherV2 } from '../../../../types/researcher-v2';
import { useModal } from '../../../hooks/use-modal-store';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../../ui/accordion';
import { Alert } from '../../../ui/alert';
import { Skeleton } from '../../../ui/skeleton';
import { HeaderResultTypeHome } from '../header-result-type-home';
import { PROFILE_TERM_CLASS } from './profile-summary-cards';

// Mesma gradação da nuvem antiga: até seis tamanhos, um por contagem distinta.
const TOTAL_LEVELS = 6;
const MAX_FONT_SIZE = 180;
const MIN_FONT_SIZE = 120;

interface ResearchersCloudProps {
  /** Pesquisadores já ordenados por `sort_by=matches`. */
  researchers: ResearcherV2[] | undefined;
  loading: boolean;
  error: boolean;
  /** Cor do tipo de busca, a mesma dos termos no resumo. */
  className?: string;
}

/** Tamanho da fonte (%) para cada contagem: a maior recebe o maior nível. */
const fontSizes = (totals: number[]) => {
  const distinct = [...new Set(totals)].sort((a, b) => b - a);
  const levels = Math.min(distinct.length, TOTAL_LEVELS);
  const step = levels > 1 ? (MAX_FONT_SIZE - MIN_FONT_SIZE) / (levels - 1) : 0;
  return (total: number) =>
    MAX_FONT_SIZE - step * Math.min(distinct.indexOf(total), levels - 1);
};

// Nuvem de palavras com os pesquisadores com mais ocorrências da busca.
export function ResearchersCloud({
  researchers,
  loading,
  error,
  className = PROFILE_TERM_CLASS,
}: ResearchersCloudProps) {
  const { onOpen } = useModal();

  // Na busca por perfil, quem casa só pelo nome ou resumo não tem obras contadas.
  const items = (researchers ?? []).filter(
    (researcher) => (researcher.matches?.total ?? 0) > 0,
  );
  if (!loading && !error && items.length === 0) return null;

  const sizeFor = fontSizes(items.map((item) => item.matches?.total ?? 0));

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
            title="Pesquisadores com mais ocorrências"
            icon={<ListNumbers size={24} className="text-gray-400" />}
          />
          <AccordionTrigger />
        </div>
        <AccordionContent className="w-full p-0">
          {error ? (
            <Alert className="p-6 text-sm">
              Não foi possível carregar a nuvem de pesquisadores.
            </Alert>
          ) : loading ? (
            <Skeleton className="w-full rounded-md h-[120px]" />
          ) : (
            <ul className="flex flex-wrap items-end gap-2 w-full">
              {items.map((researcher) => (
                <li key={researcher.researcher_id}>
                  <button
                    type="button"
                    onClick={() =>
                      onOpen('researcher-modal', { name: researcher.name })
                    }
                    className={`flex items-center whitespace-nowrap font-semibold text-white transition-all hover:opacity-90 ${className}`}
                    style={{
                      fontSize: `${sizeFor(researcher.matches?.total ?? 0)}%`,
                      padding: '0.65em 1.1em',
                      gap: '0.45em',
                      borderRadius: '0.5em',
                    }}
                  >
                    {researcher.name}
                    <span className="font-normal">
                      {(researcher.matches?.total ?? 0).toLocaleString('pt-BR')}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
