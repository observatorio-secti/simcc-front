import { Trash, X } from 'lucide-react';
import { Badge } from '../../../../ui/badge';
import { Separator } from '../../../../ui/separator';
import { FacetsV2 } from '../../../../../types/researcher-v2';
import { ProfileSearchState } from '../hooks/use-profile-search-state';
import { FACET_DEFINITIONS, getFacetLabel } from './facet-registry';

interface AppliedFacetsBadgesProps {
  facets: FacetsV2 | null | undefined;
  state: ProfileSearchState;
}

interface AppliedBadge {
  key: string;
  label: string;
  onRemove: () => void;
}

export function AppliedFacetsBadges({
  facets,
  state,
}: AppliedFacetsBadgesProps) {
  if (!state.hasActiveFilters) return null;

  const badges: AppliedBadge[] = FACET_DEFINITIONS.flatMap((definition) => {
    const { filter } = definition;

    if (filter.kind === 'multi') {
      const selected = state.getMulti(filter.param);
      return selected.map((value) => {
        // A API sempre devolve os valores selecionados no facet, com o rótulo.
        const item = facets?.[definition.key]?.items.find(
          (facetItem) => facetItem.value === value,
        );
        return {
          key: `${filter.param}-${value}`,
          label: item ? getFacetLabel(definition, item) : definition.title,
          onRemove: () =>
            state.setMulti(
              filter.param,
              selected.filter((selectedValue) => selectedValue !== value),
            ),
        };
      });
    }

    if (filter.kind === 'range') {
      const { start, end } = state.getRange(filter.startParam, filter.endParam);
      if (start === null && end === null) return [];
      const label =
        start !== null && end !== null
          ? start === end
            ? `${start}`
            : `${start} – ${end}`
          : start !== null
            ? `A partir de ${start}`
            : `Até ${end}`;
      return [
        {
          key: definition.key,
          label: `${definition.title}: ${label}`,
          onRemove: () => state.clearFacet(definition),
        },
      ];
    }

    return [];
  });

  return (
    <div className="flex flex-col gap-4 w-full">
      <Separator />
      <div className="flex flex-wrap gap-3 items-center">
        <p className="text-sm font-medium">Filtros aplicados:</p>

        {badges.map((badge) => (
          <Badge
            key={badge.key}
            className="bg-eng-blue gap-2 items-center flex font-normal rounded-md dark:bg-eng-blue dark:text-white py-2 px-3"
          >
            {badge.label}
            <div className="cursor-pointer" onClick={badge.onRemove}>
              <X size={16} />
            </div>
          </Badge>
        ))}

        <Badge
          variant={'secondary'}
          onClick={state.clearFilters}
          className="rounded-md cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-900 border-0 py-2 px-3 font-normal flex items-center justify-center gap-2"
        >
          <Trash size={12} />
          Limpar filtros
        </Badge>
      </div>
    </div>
  );
}
