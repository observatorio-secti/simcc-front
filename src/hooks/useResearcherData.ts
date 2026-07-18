import { useCallback, useEffect, useState } from 'react';
import { useContext } from 'react';
import { UserContext } from '../context/context';

// Cache global para todas as requisições
const globalCache = new Map<string, any>();

interface UseResearcherDataOptions {
    type?: string;
    enabled?: boolean;
}

export function useResearcherData(researcherId: string, options: UseResearcherDataOptions = {}) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { urlGeral } = useContext(UserContext);

    const { type, enabled = true } = options;

    const cacheKey = `${researcherId}-${type || 'default'}`;

    const fetchData = useCallback(async () => {
        if (!enabled) return;

        // Verifica cache
        if (globalCache.has(cacheKey)) {
            setData(globalCache.get(cacheKey));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const baseUrl = type 
                ? `${urlGeral}bibliographic_production_researcher?researcher_id=${researcherId}&type=${type}`
                : `${urlGeral}technical_production_researcher?researcher_id=${researcherId}`;

            const response = await fetch(baseUrl, {
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '3600',
                    'Content-Type': 'text/plain'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const result = await response.json();
            
            // Armazena no cache
            globalCache.set(cacheKey, result);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
            console.error('Error fetching researcher data:', err);
        } finally {
            setLoading(false);
        }
    }, [researcherId, type, urlGeral, cacheKey, enabled]);

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            fetchData();
        }

        return () => {
            mounted = false;
        };
    }, [fetchData]);

    const invalidateCache = useCallback(() => {
        globalCache.delete(cacheKey);
    }, [cacheKey]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        invalidateCache
    };
}
