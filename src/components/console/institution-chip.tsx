import React from 'react';
import { Badge } from '../ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Affiliation } from '../../types/academic';

interface InstitutionChipProps {
  acronym: string;
  name?: string;
  size?: 'sm' | 'default';
  onClick?: (e: React.MouseEvent) => void;
}

export function InstitutionChip({
  acronym,
  name,
  size = 'default',
  onClick,
}: InstitutionChipProps) {
  const chip = (
    <Badge
      variant="outline"
      onClick={onClick}
      className={`rounded-full font-mono font-medium transition-colors ${
        size === 'sm' ? 'px-2 py-0 text-[10px]' : 'px-2.5 py-0.5 text-xs'
      } border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 hover:border-[#559FB8] hover:text-[#07677e] dark:hover:text-[#559FB8] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {acronym}
    </Badge>
  );

  if (!name) return chip;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{chip}</TooltipTrigger>
        <TooltipContent className="text-xs font-sans max-w-xs bg-neutral-900 dark:bg-neutral-800 text-white border-none shadow-md">
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface AffiliationChipsGroupProps {
  affiliations?: Affiliation[];
  maxVisible?: number;
  onChipClick?: (affiliation: Affiliation) => void;
}

export function AffiliationChipsGroup({
  affiliations = [],
  maxVisible = 2,
  onChipClick,
}: AffiliationChipsGroupProps) {
  if (!affiliations || affiliations.length === 0) {
    return (
      <span className="text-xs text-neutral-400 dark:text-neutral-500 italic">
        Sem afiliação
      </span>
    );
  }

  const visible = affiliations.slice(0, maxVisible);
  const remaining = affiliations.slice(maxVisible);

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {visible.map((item, idx) => (
        <InstitutionChip
          key={`${item.institution.id}-${idx}`}
          acronym={item.institution.acronym}
          name={item.institution.name}
          size="sm"
          onClick={
            onChipClick
              ? (e) => {
                  e.stopPropagation();
                  onChipClick(item);
                }
              : undefined
          }
        />
      ))}

      {remaining.length > 0 && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className="rounded-full px-1.5 py-0 text-[10px] font-mono border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/40 cursor-default"
              >
                +{remaining.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="text-xs font-sans space-y-1 bg-neutral-900 dark:bg-neutral-800 text-white border-none shadow-md">
              <p className="font-semibold text-neutral-300 pb-1 border-b border-neutral-700">
                Outras afiliações:
              </p>
              {remaining.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#559FB8]">
                    {item.institution.acronym}
                  </span>
                  <span>- {item.institution.name}</span>
                </div>
              ))}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
