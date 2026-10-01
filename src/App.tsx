import { useEffect, useState } from 'react';
import { Home } from './pages/Home';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { UserContext, HistoricoItem, ItemsSelecionados, PesquisadoresSelecionados, Permission } from '../src/context/context';

import DefaultLayout from './layout/default-layout';
import { CookiesProvider } from 'react-cookie';
import LoadingWrapper from './components/loading';
import { Error404 } from './components/errors/404';
import { TermosUso } from './pages/TermosUso';
import { AboutPage } from './pages/About';
import useWindowResize from './components/use-windows-resize';
import { Tv } from './pages/Tv';
import { Observatorio } from './components/observatorio/observatorio';
import { PROFILE_RESULTS_PATH } from './lib/search-types';
import { initGA, trackPageView } from './lib/analytics';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [navbar, setNavbar] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [urlGeral, setUrlGeral] = useState(
    import.meta.env.VITE_URL_GERAL || '',
  );

  const [urlGeral2, setUrlGeral2] = useState(
    import.meta.env.VITE_URL_GERAL2 || '',
  );

  const [urlGeralAdm, setUrlGeralAdm] = useState(
    import.meta.env.VITE_URL_GERAL_ADM || '',
  );

  const [mapModal, setMapModal] = useState(false);

  const [role, setRole] = useState('');
  const [permission, setPermission] = useState<Permission[]>([]);

  const [simcc, setSimcc] = useState(
    import.meta.env.VITE_SIMCC === 'false' ? false : true,
  );
  const [test, setTest] = useState(
    import.meta.env.VITE_TEST_FUNCTIONS === 'false' ? false : true,
  );
  const [searchType, setSearchType] = useState('article');
  const [
    pesquisadoresSelecionadosGroupBarema,
    setPesquisadoresSelecionadosGroupBarema,
  ] = useState('');
  const [idGraduateProgram, setIdGraduateProgram] = useState('0');
  const [valoresSelecionadosExport, setValoresSelecionadosExport] =
    useState('');
  const [valorDigitadoPesquisaDireta, setValorDigitadoPesquisaDireta] =
    useState('');
  const [inputMaria, setInputMaria] = useState('');
  const [maria, setMaria] = useState(false);
  const [itemsSelecionados, setItensSelecionados] = useState<
    ItemsSelecionados[]
  >([]);
  const [itemsSelecionadosPopUp, setItensSelecionadosPopUp] = useState<
    ItemsSelecionados[]
  >([]);
  const [sugestoes, setSugestoes] = useState<ItemsSelecionados[]>([]);
  const [pesquisadoresSelecionados, setPesquisadoresSelecionados] = useState<
    PesquisadoresSelecionados[]
  >([]);
  const [messagesMaria, setMessagesMaria] = useState<any[]>([]);
  const [idDocumentBarema, setIdDocumentBarema] = useState('');

  const [historico, setHistorico] = useState<HistoricoItem[]>([]);

  const storedIsCollapsed = localStorage.getItem('isCollapsed');
  const [isCollapsed, setIsCollapsed] = useState(
    storedIsCollapsed ? JSON.parse(storedIsCollapsed) : true,
  );

  const storedIsCollapsedRight = localStorage.getItem('isCollapsedRight');
  const [isCollapsedRight, setIsCollapsedRight] = useState(
    storedIsCollapsedRight ? JSON.parse(storedIsCollapsedRight) : true,
  );

  const [navCollapsedSize, setNavCollapsedSize] = useState(0);
  const [defaultLayout, setDefaultLayout] = useState([0, 440, 655]);
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
      setSearchType('article');
    }
  }, [searchType]);

  useWindowResize(() => {});

  useEffect(() => {
    const storedPesquisadores = localStorage.getItem(
      'pesquisadoresSelecionados',
    );
    if (storedPesquisadores) {
      setPesquisadoresSelecionados(JSON.parse(storedPesquisadores));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'pesquisadoresSelecionados',
      JSON.stringify(pesquisadoresSelecionados),
    );
  }, [pesquisadoresSelecionados]);

  return (
    <>
      <Router basename={import.meta.env.VITE_BASE_PATH || '/'}>
        <CookiesProvider>
          <UserContext.Provider
            value={{
              loggedIn,
              setLoggedIn,
              navbar,
              setNavbar,
              urlGeralAdm,
              setUrlGeralAdm,
              user,
              setUser,
              searchType,
              setSearchType,
              urlGeral,
              setUrlGeral,
              urlGeral2,
              setUrlGeral2,
              pesquisadoresSelecionadosGroupBarema,
              setPesquisadoresSelecionadosGroupBarema,
              idGraduateProgram,
              setIdGraduateProgram,
              valoresSelecionadosExport,
              setValoresSelecionadosExport,
              valorDigitadoPesquisaDireta,
              setValorDigitadoPesquisaDireta,
              inputMaria,
              setInputMaria,
              maria,
              setMaria,
              mapModal,
              setMapModal,
              messagesMaria,
              setMessagesMaria,
              itemsSelecionados,
              setItensSelecionados,
              sugestoes,
              setSugestoes,
              pesquisadoresSelecionados,
              setPesquisadoresSelecionados,
              idDocumentBarema,
              setIdDocumentBarema,
              itemsSelecionadosPopUp,
              setItensSelecionadosPopUp,
              isCollapsed,
              setIsCollapsed,
              mode,
              setMode,
              navCollapsedSize,
              setNavCollapsedSize,
              defaultLayout,
              setDefaultLayout,
              role,
              setRole,
              permission,
              setPermission,
              simcc,
              setSimcc,
              isCollapsedRight,
              setIsCollapsedRight,
              test,
              setTest,
              historico,
              setHistorico,
            }}
          >
            <DefaultLayout>
              <LoadingWrapper>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/resultados" element={<Home />} />
                  <Route path={PROFILE_RESULTS_PATH} element={<Home />} />
                  <Route path="/dicionario" element={<Home />} />
                  <Route path="/pos-graduacao" element={<Home />} />
                  <Route path="/grupos-pesquisa" element={<Home />} />
                  <Route
                    path="/instituicao/:acronym?"
                    element={<Home />}
                  />
                  <Route path="/indicadores" element={<Home />} />
                  <Route path="/incites" element={<Home />} />
                  <Route path="/observatorio" element={<Observatorio />} />
                  <Route path="/producoes-recentes" element={<Home />} />
                  <Route path="/researcher" element={<Home />} />
                  <Route path="/resultados-ia" element={<Home />} />
                  <Route path="/paines-dados-externos" element={<Home />} />
                  <Route path="/indice-pesquisador" element={<Home />} />
                  <Route path="/provimento-cargo" element={<Home />} />
                  <Route path="/listagens" element={<Home />} />
                  <Route path="/tv" element={<Tv />} />
                  <Route path="/termos-uso" element={<TermosUso />} />
                  <Route path="/politica-privacidade" element={<TermosUso />} />
                  <Route path="/api-docs" element={<TermosUso />} />
                  <Route path="/informacoes" element={<TermosUso />} />
                  <Route path="/dicionario-cores" element={<TermosUso />} />
                  <Route path="/videos" element={<TermosUso />} />
                  <Route path="/sobre" element={<AboutPage />} />
                  <Route path="*" element={<Error404 />} />
                </Routes>
              </LoadingWrapper>
            </DefaultLayout>
          </UserContext.Provider>
        </CookiesProvider>
      </Router>
    </>
  );
}

export default App;
