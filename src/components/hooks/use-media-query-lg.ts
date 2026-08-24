// Detecta reativamente se a tela é desktop (>= 1024px).
// Usado para impedir que o Sheet de filtros (mobile) abra em telas grandes.
import { useEffect, useState } from "react";

export function useMediaQueryLg() {
    const [isDesktop, setIsDesktop] = useState<boolean>(typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false);

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 1024px)');
        const onChange = () => setIsDesktop(mql.matches);
        mql.addEventListener('change', onChange);
        setIsDesktop(mql.matches);
        return () => mql.removeEventListener('change', onChange);
    }, []);

    return isDesktop;
}