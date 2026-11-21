import {
  formatGroupStatus,
  resolveGroupArea,
  type ResearchGroup,
} from '@/entities/research-group/model';
import { areaColor, areaKey, chartNeutralBg } from '@/shared/lib/design-tokens';
import type { FacetOptionItem, FacetsMap } from '@/shared/ui/facet-panel';
import type { ResearchGroupsSearch } from './search';

export interface GroupFacetDistributionItem {
  label: string;
  count: number;
  colorClass: string;
}

export interface ResearchGroupStats {
  totalGroups: number;
  totalInstitutions: number;
  totalMembers: number;
  totalLines: number;
  byArea: GroupFacetDistributionItem[];
  byInstitution: GroupFacetDistributionItem[];
}

export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function getGroupAreaValue(group: ResearchGroup): string | null {
  return resolveGroupArea(group)?.label ?? null;
}

function getGroupInstitutionValue(group: ResearchGroup): string | null {
  const value =
    group.institutionAcronym?.trim() || group.institutionLabel?.trim();
  return value || null;
}

function getGroupStatusValue(group: ResearchGroup): string | null {
  return formatGroupStatus(group.status)?.label ?? null;
}

function getGroupStateValue(group: ResearchGroup): string | null {
  const value =
    group.address.state?.trim() || group.headquarters?.stateAcronym?.trim();
  return value ? value.toUpperCase() : null;
}

function matchesQuery(group: ResearchGroup, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;

  const haystack: Array<string | null | undefined> = [
    group.name,
    group.area,
    group.knowledgeArea,
    group.institutionLabel,
    group.institutionAcronym,
    group.address.city,
    group.address.state,
    ...group.leaders.map((leader) => leader.name),
    ...group.researchLines.map((line) => line.title),
  ];

  return haystack.some((field) => {
    if (!field) return false;
    return normalizeSearchText(field).includes(normalizedQuery);
  });
}

function matchesSelected(
  value: string | null,
  selected: readonly string[] | undefined,
): boolean {
  if (!selected || selected.length === 0) return true;
  if (!value) return false;
  return selected.includes(value);
}

/** Filtra e ordena os grupos de pesquisa de acordo com os search params da URL. */
export function filterAndSortGroups(
  groups: readonly ResearchGroup[],
  search: ResearchGroupsSearch,
): ResearchGroup[] {
  const normalizedQuery = search.q ? normalizeSearchText(search.q) : '';

  const filtered = groups.filter((group) => {
    if (!matchesQuery(group, normalizedQuery)) return false;
    if (!matchesSelected(getGroupAreaValue(group), search.area)) return false;
    if (!matchesSelected(getGroupInstitutionValue(group), search.institution)) {
      return false;
    }
    if (!matchesSelected(getGroupStatusValue(group), search.status)) {
      return false;
    }
    if (!matchesSelected(getGroupStateValue(group), search.state)) {
      return false;
    }
    return true;
  });

  const direction = search.sort_order === 'desc' ? -1 : 1;
  const sortBy = search.sort_by;

  return [...filtered].sort((a, b) => {
    if (sortBy === 'members') {
      const diff = a.memberCount - b.memberCount;
      if (diff !== 0) return diff * direction;
    } else if (sortBy === 'lines') {
      const diff = a.researchLineCount - b.researchLineCount;
      if (diff !== 0) return diff * direction;
    } else if (sortBy === 'year') {
      const yearA = a.foundedYear ?? -1;
      const yearB = b.foundedYear ?? -1;
      if (yearA !== yearB) return (yearA - yearB) * direction;
    }

    return a.name.localeCompare(b.name, 'pt-BR') * direction;
  });
}

function countFacetValues(
  groups: readonly ResearchGroup[],
  extractor: (group: ResearchGroup) => string | null,
  selected: readonly string[] | undefined,
): FacetOptionItem[] {
  const counts = new Map<string, number>();
  for (const group of groups) {
    const val = extractor(group);
    if (!val) continue;
    counts.set(val, (counts.get(val) ?? 0) + 1);
  }

  for (const item of selected ?? []) {
    if (!counts.has(item)) {
      counts.set(item, 0);
    }
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      label: value,
      count,
      selected: selected?.includes(value) ?? false,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.label.localeCompare(b.label, 'pt-BR');
    });
}

/** Constrói o mapa de facetas compatível com `FacetPanel`. */
export function buildGroupFacets(
  groups: readonly ResearchGroup[],
  search: ResearchGroupsSearch,
): FacetsMap {
  const areaItems = countFacetValues(groups, getGroupAreaValue, search.area);
  const institutionItems = countFacetValues(
    groups,
    getGroupInstitutionValue,
    search.institution,
  );
  const statusItems = countFacetValues(
    groups,
    getGroupStatusValue,
    search.status,
  );
  const stateItems = countFacetValues(groups, getGroupStateValue, search.state);

  const facets: FacetsMap = {};
  if (areaItems.length > 0) {
    facets.area = {
      param: 'area',
      total: areaItems.length,
      items: areaItems,
    };
  }
  if (institutionItems.length > 0) {
    facets.institution = {
      param: 'institution',
      total: institutionItems.length,
      items: institutionItems,
    };
  }
  if (statusItems.length > 0) {
    facets.status = {
      param: 'status',
      total: statusItems.length,
      items: statusItems,
    };
  }
  if (stateItems.length > 0) {
    facets.state = {
      param: 'state',
      total: stateItems.length,
      items: stateItems,
    };
  }

  return facets;
}

/** Resolve a cor do `Dot` para uma faceta do `FacetPanel`. */
export function getGroupFacetDotClass(
  facetKey: string,
  value: string,
): string | undefined {
  if (facetKey !== 'area') return undefined;
  return areaKey(value) ? areaColor(value).bg : 'bg-neutral-400';
}

/** Calcula os KPIs e distribuições agregadas para a listagem filtrada. */
export function computeGroupStats(
  groups: readonly ResearchGroup[],
): ResearchGroupStats {
  const institutions = new Set<string>();
  const areaCounts = new Map<string, number>();
  const institutionCounts = new Map<string, number>();

  let totalMembers = 0;
  let totalLines = 0;

  for (const group of groups) {
    totalMembers += group.memberCount;
    totalLines += group.researchLineCount;

    const inst = getGroupInstitutionValue(group);
    if (inst) {
      institutions.add(inst);
      institutionCounts.set(inst, (institutionCounts.get(inst) ?? 0) + 1);
    }

    const area = getGroupAreaValue(group);
    if (area) {
      areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
    }
  }

  const byArea: GroupFacetDistributionItem[] = Array.from(areaCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .slice(0, 6)
    .map(([label, count]) => ({
      label,
      count,
      colorClass: areaKey(label) ? areaColor(label).bg : 'bg-eng-blue',
    }));

  const byInstitution: GroupFacetDistributionItem[] = Array.from(
    institutionCounts.entries(),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pt-BR'))
    .slice(0, 6)
    .map(([label, count], index) => ({
      label,
      count,
      colorClass: chartNeutralBg(index),
    }));

  return {
    totalGroups: groups.length,
    totalInstitutions: institutions.size,
    totalMembers,
    totalLines,
    byArea,
    byInstitution,
  };
}
