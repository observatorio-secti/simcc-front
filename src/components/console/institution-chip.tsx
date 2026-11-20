import React from 'react';
import { Affiliation } from '../../types/academic';

interface InstitutionChipProps {
  acronym: string;
  name?: string;
  size?: 'sm' | 'default';
  onClick?: (e: React.MouseEvent) => void;
}

export function InstitutionChip({
  acronym,
  size = 'default',
  onClick,
}: InstitutionChipProps) {
  return (
    <span
      onClick={onClick}
      className={`sm-tag font-mono transition-colors ${
        size === 'sm' ? 'text-[10px] py-0.5 px-2' : 'text-xs'
      } ${onClick ? 'cursor-pointer hover:bg-sm-navy hover:text-white' : ''}`}
    >
      {acronym}
    </span>
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
      <span className="text-xs text-sm-navy-600 italic">
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
        <span
          className="sm-tag font-mono text-[10px] py-0.5 px-1.5 bg-sm-wash text-sm-navy-600"
          title={remaining.map((r) => r.institution.acronym).join(', ')}
        >
          +{remaining.length}
        </span>
      )}
    </div>
  );
}
