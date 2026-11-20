import { ResultFiltersSidebar } from '../../../result-filters-shell';
import { useResearcherFilters } from '../hooks/use-researcher-filters';
import { FilterSections } from './filter-sections';

interface FiltersSidebarProps {
  filters: ReturnType<typeof useResearcherFilters>;
}

export function FiltersSidebar({ filters }: FiltersSidebarProps) {
  return (
    <ResultFiltersSidebar onClear={filters.clearFilters}>
      <FilterSections filters={filters} />
    </ResultFiltersSidebar>
  );
}
