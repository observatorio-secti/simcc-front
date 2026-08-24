import { useCallback, useEffect, useRef, useState } from "react";
import { ResultFiltersSidebar, ResultFiltersSheet } from "../../result-filters-shell";
import { ArticleFilterSections } from "./article-filter-fields";
import debounce from "lodash.debounce";

type Filter = {
    year: number[];
    qualis: string[];
};

type UseArticleFiltersProps = {
    filteredCount: number;
    filters: Filter[];
    onFilterUpdate: (filters: Filter[]) => void;
};

const DEFAULT_FILTERS: Filter = {
    year: [1990],
    qualis: [],
};

export function useArticleFilters({ filteredCount, filters, onFilterUpdate }: UseArticleFiltersProps) {
    const [qualis, setQualis] = useState<string[]>(filters[0]?.qualis ?? DEFAULT_FILTERS.qualis);
    const [year, setYear] = useState<number[]>(filters[0]?.year ?? DEFAULT_FILTERS.year);
    const isFirstRender = useRef(true);
    const onFilterUpdateRef = useRef(onFilterUpdate);
    onFilterUpdateRef.current = onFilterUpdate;

    const debouncedUpdate = useRef(debounce((nextFilters: Filter[]) => onFilterUpdateRef.current(nextFilters), 500)).current;

    const emitFilters = useCallback((nextQualis: string[], nextYear: number[]) => {
        debouncedUpdate([{ year: nextYear, qualis: nextQualis }]);
    }, [debouncedUpdate]);

    const handleQualisChange = useCallback((nextQualis: string[]) => {
        setQualis(nextQualis);
    }, []);

    const handleYearChange = useCallback((nextYear: number[]) => {
        setYear(nextYear);
    }, []);

    const clearFilters = useCallback(() => {
        setQualis([]);
        setYear(DEFAULT_FILTERS.year);
        onFilterUpdate([{ ...DEFAULT_FILTERS }]);
    }, [onFilterUpdate]);

    const applyFilters = useCallback(() => {
        onFilterUpdate([{ year, qualis }]);
    }, [year, qualis, onFilterUpdate]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        emitFilters(qualis, year);
    }, [qualis, year]);

    const sections = (
        <ArticleFilterSections
            qualis={qualis}
            year={year}
            onQualisChange={handleQualisChange}
            onYearChange={handleYearChange}
        />
    );

    const sidebar = (
        <ResultFiltersSidebar onClear={clearFilters}>
            {sections}
        </ResultFiltersSidebar>
    );

    const component = (
        <ResultFiltersSheet
            onClear={clearFilters}
            onApply={applyFilters}
            filteredCount={filteredCount}
        >
            {sections}
        </ResultFiltersSheet>
    );

    return { sidebar, component };
}