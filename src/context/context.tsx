import { createContext } from 'react';

export interface HistoricoItem {
  termo: string;
  tipo: string;
}

export interface ItemsSelecionados {
  term: string;
}

export interface UserContextType {
  test: boolean;
  setTest: React.Dispatch<React.SetStateAction<boolean>>;
  navbar: boolean;
  mapModal: boolean;
  setMapModal: React.Dispatch<React.SetStateAction<boolean>>;
  setNavbar: React.Dispatch<React.SetStateAction<boolean>>;
  maria: boolean;
  setMaria: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;

  historico: HistoricoItem[];
  setHistorico: React.Dispatch<React.SetStateAction<HistoricoItem[]>>;

  valoresSelecionadosExport: string;
  setValoresSelecionadosExport: React.Dispatch<React.SetStateAction<string>>;

  messagesMaria: any[];
  setMessagesMaria: React.Dispatch<React.SetStateAction<any[]>>;

  itemsSelecionados: ItemsSelecionados[];
  setItensSelecionados: React.Dispatch<
    React.SetStateAction<ItemsSelecionados[]>
  >;

  itemsSelecionadosPopUp: ItemsSelecionados[];
  setItensSelecionadosPopUp: React.Dispatch<
    React.SetStateAction<ItemsSelecionados[]>
  >;

  sugestoes: ItemsSelecionados[];
  setSugestoes: React.Dispatch<React.SetStateAction<ItemsSelecionados[]>>;

  valorDigitadoPesquisaDireta: string;
  setValorDigitadoPesquisaDireta: React.Dispatch<React.SetStateAction<string>>;

  inputMaria: string;
  setInputMaria: React.Dispatch<React.SetStateAction<string>>;

  urlGeral: string;
  setUrlGeral: React.Dispatch<React.SetStateAction<string>>;

  urlGeral2: string;
  setUrlGeral2: React.Dispatch<React.SetStateAction<string>>;

  idGraduateProgram: string;
  setIdGraduateProgram: React.Dispatch<React.SetStateAction<string>>;

  searchType: string;
  setSearchType: React.Dispatch<React.SetStateAction<string>>;

  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  isCollapsedRight: boolean;
  setIsCollapsedRight: React.Dispatch<React.SetStateAction<boolean>>;

  simcc: boolean;
  setSimcc: React.Dispatch<React.SetStateAction<boolean>>;

  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;

  navCollapsedSize: number;
  setNavCollapsedSize: React.Dispatch<React.SetStateAction<number>>;

  defaultLayout: number[];
  setDefaultLayout: React.Dispatch<React.SetStateAction<number[]>>;
}

export const UserContext = createContext<UserContextType>({
  test: false,
  setTest: () => {},
  mapModal: false,
  setMapModal: () => {},
  navbar: false,
  setNavbar: () => {},
  maria: false,
  setMaria: () => {},
  user: null,
  setUser: () => {},

  historico: [],
  setHistorico: () => {},

  valoresSelecionadosExport: '',
  setValoresSelecionadosExport: () => {},

  itemsSelecionados: [],
  setItensSelecionados: () => {},

  itemsSelecionadosPopUp: [],
  setItensSelecionadosPopUp: () => {},

  sugestoes: [],
  setSugestoes: () => {},

  messagesMaria: [],
  setMessagesMaria: () => {},

  valorDigitadoPesquisaDireta: '',
  setValorDigitadoPesquisaDireta: () => {},

  inputMaria: '',
  setInputMaria: () => {},

  urlGeral: '',
  setUrlGeral: () => {},

  urlGeral2: '',
  setUrlGeral2: () => {},

  searchType: '',
  setSearchType: () => {},

  navCollapsedSize: 0,
  setNavCollapsedSize: () => {},

  isCollapsed: false,
  setIsCollapsed: () => {},

  isCollapsedRight: false,
  setIsCollapsedRight: () => {},

  simcc: false,
  setSimcc: () => {},

  defaultLayout: [],
  setDefaultLayout: () => {},

  mode: '',
  setMode: () => {},

  idGraduateProgram: '',
  setIdGraduateProgram: () => {},
});
