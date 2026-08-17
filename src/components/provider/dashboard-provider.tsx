'use client';

import { useEffect, useState } from 'react';
import { GeralViewDashboard } from '../dashboard/geral-view-dashboard/geral-view-dashboard';

import { useModalDashboard } from '../hooks/use-modal-dashboard';
import { PosGraducaoView } from '../dashboard/pos-graduacao/pos-graduacao-view-dashboard';
import { AddResearcherDashboard } from '../dashboard/add-researcher-dashboard';
import { PesoProducoes } from '../dashboard/pesos-avaliacao/peso-producoes';
import { GrupoPesquisaView } from '../dashboard/grupo-pesquisa';
import { IndicadoresDashboard } from '../dashboard/indicadores-instituicao/indicadores-dashboard';
import { BaremasHome } from '../baremas/baremas-home';
import { EnviarNotificacoes } from '../enviar-notificacoes/enviar-notificacoes';
import { InfoDashboardPage } from '../dashboard/info-dashboard-page';
import { HomeDashboard } from '../dashboard/home-dashboard';
import { MinhasProducoes } from '../dashboard/minhas-producoes/minhas-producoes';
import { ParametrosPesquisa } from '../dashboard/parametros-pesquisa/parametros-pesquisa';
import { SessaoPessoal } from '../dashboard/sessao-pessoal/sessao-pessoal';
import { BuilderPage } from '../dashboard/builder-page/builder-page';

const ModalContent = () => {
  const { type } = useModalDashboard();

  switch (type) {
    case 'general':
      return <GeralViewDashboard />;
    case 'graduate-program':
      return <PosGraducaoView />;
    case 'researcher':
      return <AddResearcherDashboard />;
    case 'peso-producao':
      return <PesoProducoes />;
    case 'grupo-pesquisa':
      return <GrupoPesquisaView />;
    case 'indicadores':
      return <IndicadoresDashboard />;
    case 'baremas':
      return <BaremasHome />;
    case 'enviar-notificacoes':
      return <EnviarNotificacoes />;
    case 'informacoes':
      return <InfoDashboardPage />;
    case 'home-dashboard':
      return <HomeDashboard />;
    case 'minhas-producoes':
      return <MinhasProducoes />;
    case 'parametros-pesquisa':
      return <ParametrosPesquisa />;
    case 'sessao-pessoal':
      return <SessaoPessoal />;
    case 'construtor-pagina':
      return <BuilderPage />;
    default:
      return null;
  }
};

export const DashboardProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContent />;
};
