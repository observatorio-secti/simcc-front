import { useContext, useEffect } from 'react';
import { UserContext } from '../context/context';
import SearchLayout from '../layout/search-layout';
import { GrafosFlow } from '../components/grafos/GrafosFlow';

export function GrafosPage() {
  const { navCollapsedSize, defaultLayout, isCollapsed, setIsCollapsed } = useContext(UserContext);

  useEffect(() => {
    // Manter a sidebar aberta ao entrar na página de grafos,
    // ou fechar se for o padrão para visualização de ferramentas complexas
    setIsCollapsed(false);
  }, []);

  return (
    <SearchLayout
      defaultLayout={defaultLayout}
      defaultCollapsed={isCollapsed}
      navCollapsedSize={navCollapsedSize}
    >
      <div className="h-full flex flex-col w-full bg-neutral-50 dark:bg-black">
        <GrafosFlow />
      </div>
    </SearchLayout>
  );
}
