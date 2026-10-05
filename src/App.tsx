import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
  UserContext,
  HistoricoItem,
  ItemsSelecionados,
} from './context/context';

import DefaultLayout from './layout/default-layout';
import SearchLayout from './layout/search-layout';
import DocsLayout from './layout/docs-layout';
import { CookiesProvider } from 'react-cookie';
import { AuthProvider } from './context/auth-context';
import { AuthCallback } from './pages/AuthCallback';
import { Error404 } from './components/errors/404';
import { AboutPage } from './pages/About';
import useWindowResize from './components/use-windows-resize';
import { Tv } from './pages/Tv';
import { Observatorio } from './components/observatorio/observatorio';
import { PROFILE_RESULTS_PATH } from './lib/search-types';
import { initGA, trackPageView } from './lib/analytics';

// Helper para importação sob demanda de componentes com named export (Code Splitting)
function lazyNamed<T, K extends keyof T>(
  loader: () => Promise<T>,
  exportName: K,
) {
  return React.lazy(() =>
    loader().then((module) => ({
      default: module[exportName] as unknown as React.ComponentType<any>,
    })),
  );
}

// Páginas da plataforma (SearchLayout)
const InitialHome = lazyNamed(() => import('./components/homepage/inital-home'), 'InitialHome');
const ResultHome = lazyNamed(() => import('./components/homepage/result-home'), 'ResultHome');
const ResearchersProfileHome = lazyNamed(
  () => import('./components/homepage/categorias/researchers-profile-home/researchers-profile-home'),
  'ResearchersProfileHome'
);
const GraduateProgram = lazyNamed(() => import('./components/graduate-program/graduate-program'), 'GraduateProgram');
const GruposPesquisaPage = lazyNamed(() => import('./components/grupos-pesquisa/grupos-pesquisa'), 'GruposPesquisaPage');
const Institution = lazyNamed(() => import('./components/institution/institution'), 'Institution');
const ContentIndicators = lazyNamed(() => import('./components/indicators/content-indicators'), 'ContentIndicators');
const IncitesPage = lazyNamed(() => import('./components/incites/content-incites'), 'IncitesPage');
const NewsArticles = lazyNamed(() => import('./components/novas-publicacoes/new-articles'), 'NewsArticles');
const ResearcherPage = lazyNamed(() => import('./components/researcher/researcher-page'), 'ResearcherPage');
const Maria = lazyNamed(() => import('./components/maria/maria'), 'Maria');
const PaineisDadosExternos = lazyNamed(() => import('./components/homepage/paines-dados-externos'), 'PaineisDadosExternos');
const IndicePesquisador = lazyNamed(() => import('./components/indice-pesquisador/indice-pesquisador'), 'IndicePesquisador');
const ProvimentoCargo = lazyNamed(() => import('./components/provimento-cargo/provimento-cargo'), 'ProvimentoCargo');
const TodosPesquisadores = lazyNamed(() => import('./components/listagens/todos-pesquisadores'), 'TodosPesquisadores');

// Páginas de documentação (DocsLayout)
const TermosUso = lazyNamed(() => import('./components/docs-api/termos-uso'), 'TermosUso');
const PoliticaPrivacidade = lazyNamed(() => import('./components/docs-api/politica-privacidade'), 'PoliticaPrivacidade');
const ApiDocs = lazyNamed(() => import('./components/docs-api/api-docs'), 'ApiDocs');
const Info = lazyNamed(() => import('./components/info/info'), 'Info');
const DicionarioCores = lazyNamed(() => import('./components/docs-api/dicionario-cores'), 'DicionarioCores');
const Videos = lazyNamed(() => import('./components/docs-api/videos'), 'Videos');

function App() {
  const [navbar, setNavbar] = useState(false);

  const [urlGeral, setUrlGeral] = useState(
    import.meta.env.VITE_URL_GERAL || '',
  );

  const [urlGeral2, setUrlGeral2] = useState(
    import.meta.env.VITE_URL_GERAL2 || '',
  );

  const [simcc, setSimcc] = useState(
    import.meta.env.VITE_SIMCC === 'false' ? false : true,
  );
  const [test, setTest] = useState(
    import.meta.env.VITE_TEST_FUNCTIONS === 'false' ? false : true,
  );
  const [searchType, setSearchType] = useState('profile');
  const [idGraduateProgram, setIdGraduateProgram] = useState('0');
  const [valoresSelecionadosExport, setValoresSelecionadosExport] = useState('');
  const [valorDigitadoPesquisaDireta, setValorDigitadoPesquisaDireta] = useState('');
  const [itemsSelecionados, setItensSelecionados] = useState<ItemsSelecionados[]>([]);
  const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] = useState<ItemsSelecionados[]>([]);
  const [sugestoes, setSugestoes] = useState<ItemsSelecionados[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const storedIsCollapsed = localStorage.getItem('isCollapsed');
  const [isCollapsed, setIsCollapsed] = useState(
    storedIsCollapsed ? JSON.parse(storedIsCollapsed) : true,
  );

  const storedIsCollapsedRight = localStorage.getItem('isCollapsedRight');
  const [isCollapsedRight, setIsCollapsedRight] = useState(
    storedIsCollapsedRight ? JSON.parse(storedIsCollapsedRight) : true,
  );

  const [mode, setMode] = useState('');

  // Inicializa Google Analytics nativo
  useEffect(() => {
    initGA();
    trackPageView(window.location.href);
  }, []);

  useEffect(() => {
    localStorage.setItem('isCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('isCollapsedRight', JSON.stringify(isCollapsedRight));
  }, [isCollapsedRight]);

  useEffect(() => {
    if (searchType === '') {
      setSearchType('profile');
    }
  }, [searchType]);

  useWindowResize(() => {});

  const userContextValue = useMemo(
    () => ({
      navbar,
      setNavbar,
      searchType,
      setSearchType,
      urlGeral,
      setUrlGeral,
      urlGeral2,
      setUrlGeral2,
      idGraduateProgram,
      setIdGraduateProgram,
      valoresSelecionadosExport,
      setValoresSelecionadosExport,
      valorDigitadoPesquisaDireta,
      setValorDigitadoPesquisaDireta,
      itemsSelecionados,
      setItensSelecionados,
      sugestoes,
      setSugestoes,
      itemsSelecionadosPopUp,
      setItensSelecionadosPopUp,
      isCollapsed,
      setIsCollapsed,
      mode,
      setMode,
      simcc,
      setSimcc,
      isCollapsedRight,
      setIsCollapsedRight,
      test,
      setTest,
      historico,
      setHistorico,
    }),
    [
      navbar,
      searchType,
      urlGeral,
      urlGeral2,
      idGraduateProgram,
      valoresSelecionadosExport,
      valorDigitadoPesquisaDireta,
      itemsSelecionados,
      sugestoes,
      itemsSelecionadosPopUp,
      isCollapsed,
      mode,
      simcc,
      isCollapsedRight,
      test,
      historico,
    ],
  );

  return (
    <Router basename={import.meta.env.VITE_BASE_PATH || '/'}>
      <CookiesProvider>
        <AuthProvider>
          <UserContext.Provider value={userContextValue}>
            <DefaultLayout>
              <Routes>
                {/* Rotas com moldura principal (SearchLayout) */}
                <Route element={<SearchLayout />}>
                  <Route path="/" element={<InitialHome />} />
                  <Route path="/resultados" element={<ResultHome />} />
                  <Route path={PROFILE_RESULTS_PATH} element={<ResearchersProfileHome />} />
                  <Route path="/pos-graduacao" element={<GraduateProgram />} />
                  <Route path="/grupos-pesquisa" element={<GruposPesquisaPage />} />
                  <Route path="/instituicao/:acronym?" element={<Institution />} />
                  <Route path="/indicadores" element={<ContentIndicators />} />
                  <Route path="/incites" element={<IncitesPage />} />
                  <Route path="/producoes-recentes" element={<NewsArticles />} />
                  <Route path="/researcher" element={<ResearcherPage />} />
                  <Route path="/resultados-ia" element={<Maria />} />
                  <Route path="/paines-dados-externos" element={<PaineisDadosExternos />} />
                  <Route path="/indice-pesquisador" element={<IndicePesquisador />} />
                  <Route path="/provimento-cargo" element={<ProvimentoCargo />} />
                  <Route path="/listagens" element={<TodosPesquisadores />} />
                </Route>

                {/* Rotas de documentação (DocsLayout) */}
                <Route element={<DocsLayout />}>
                  <Route path="/termos-uso" element={<TermosUso />} />
                  <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
                  <Route path="/api-docs" element={<ApiDocs />} />
                  <Route path="/informacoes" element={<Info />} />
                  <Route path="/dicionario-cores" element={<DicionarioCores />} />
                  <Route path="/videos" element={<Videos />} />
                </Route>

                {/* Rotas Autônomas */}
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/observatorio" element={<Observatorio />} />
                <Route path="/tv" element={<Tv />} />
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="*" element={<Error404 />} />
              </Routes>
            </DefaultLayout>
          </UserContext.Provider>
        </AuthProvider>
      </CookiesProvider>
    </Router>
  );
}

export default App;
