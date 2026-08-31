import { useCallback, useEffect, useRef, useState } from "react";
import { ResultFiltersSidebar, ResultFiltersSheet } from "../../result-filters-shell";
import { ArticleFilterSections, getDefaultYearRange, normalizeYearRange } from "./article-filter-fields";
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

const getDefaultFilters = (): Filter => ({
    year: [...getDefaultYearRange()],
    qualis: [],
});

const DEFAULT_FILTERS: Filter = getDefaultFilters();

export function useArticleFilters({ filteredCount, filters, onFilterUpdate }: UseArticleFiltersProps) {
    const [qualis, setQualis] = useState<string[]>(filters[0]?.qualis ?? getDefaultFilters().qualis);
    const [year, setYear] = useState<number[]>(normalizeYearRange(filters[0]?.year ?? getDefaultFilters().year));
    const isFirstRender = useRef(true);
    const onFilterUpdateRef = useRef(onFilterUpdate);
    onFilterUpdateRef.current = onFilterUpdate;

    const debouncedUpdate = useRef(debounce((nextFilters: Filter[]) => onFilterUpdateRef.current(nextFilters), 500)).current;

    const emitFilters = useCallback((nextQualis: string[], nextYear: number[]) => {
        debouncedUpdate([{ year: nextYear, qualis: nextQualis }]);
    }, [debouncedUpdate]);

    const handleQualisChange = useCallback((nextQualis: string[] | ((prev: string[]) => string[])) => {
        setQualis((prev) => (typeof nextQualis === 'function' ? (nextQualis as (p: string[]) => string[])(prev) : nextQualis));
    }, []);

    const handleYearChange = useCallback((nextYear: number[]) => {
        setYear(nextYear);
    }, []);

    const clearFilters = useCallback(() => {
        debouncedUpdate.cancel();
        const defaults = getDefaultFilters();
        setQualis([]);
        setYear(defaults.year);
        onFilterUpdate([{ ...defaults }]);
    }, [onFilterUpdate, debouncedUpdate]);

    const applyFilters = useCallback(() => {
        debouncedUpdate.cancel();
        onFilterUpdate([{ year, qualis }]);
    }, [year, qualis, onFilterUpdate, debouncedUpdate]);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        emitFilters(qualis, year);
    }, [qualis, year]);

    const sidebar = (
        <ResultFiltersSidebar onClear={clearFilters}>
            <ArticleFilterSections
                qualis={qualis}
                year={year}
                onQualisChange={handleQualisChange}
                onYearChange={handleYearChange}
            />
        </ResultFiltersSidebar>
    );

    const component = (
        <ResultFiltersSheet
            onClear={clearFilters}
            onApply={applyFilters}
            filteredCount={filteredCount}
        >
            <ArticleFilterSections
                qualis={qualis}
                year={year}
                onQualisChange={handleQualisChange}
                onYearChange={handleYearChange}
            />
        </ResultFiltersSheet>
    );

    return { sidebar, component };
}