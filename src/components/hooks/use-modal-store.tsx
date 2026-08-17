import { create } from 'zustand';
import { useModalSecundary } from './use-modal-store-secundary';

export type ModalType =
  | 'search'
  | 'add-graduate-program'
  | 'map-researchers-modal'
  | 'researcher-modal'
  | 'confirm-delete-researcher'
  | 'confirm-delete-pos-graduate-program'
  | 'edit-graduate-program'
  | 'add-researcher-graduation'
  | 'add-researcher-csv'
  | 'add-student-graduation'
  | 'add-grupo-pesquisa'
  | 'filters'
  | 'pesquisadores-selecionados'
  | 'list-student-program'
  | 'add-researcher-graduation-two'
  | 'gratuate-program'
  | 'confirm-delete-researcher-graduate-program'
  | 'reset-peso-producoes'
  | 'confirm-delete-student-graduate-program'
  | 'import-bolsistas'
  | 'import-docentes'
  | 'import-taes'
  | 'add-departamento'
  | 'confirm-delete-departamento'
  | 'edit-departamento'
  | 'import-disciplina'
  | 'confirm-delete-researcher-departament'
  | 'minha-area'
  | 'add-background'
  | 'relatar-problema'
  | 'confirm-delete-institution'
  | 'filters-graduate'
  | 'filters-researcher-listagens'
  | 'user-profile-initial'
  | 'edit-background';

interface ModalData {
  onSuccess?: any;
  id?: string;
  name?: string;

  titulo?: string;
  descricao?: string;
  botao?: string;
  link?: string;
  imgURL?: string;
  color?: string;
  textColor?: string;
  nome?: string;
  latitude?: number;
  longitude?: number;
  pesquisadores?: number;
  professores?: string[];

  doi?: string;
  qualis?:
    | 'A1'
    | 'A2'
    | 'A3'
    | 'A4'
    | 'B1'
    | 'B2'
    | 'B3'
    | 'B4'
    | 'B5'
    | 'C'
    | 'None'
    | 'NP'
    | 'SQ';
  title?: string;
  year?: string;
  jif?: string;
  jcr_link?: string;
  lattes_10_id?: string;
  researcher_id?: string;
  magazine?: string;
  lattes_id?: string;
  researcher?: string;
  id_delete?: string;

  abstract?: string;
  article_institution?: string;
  authors?: string;
  authors_institution?: string;
  citations_count?: string;
  issn?: string;
  keywords?: string;
  landing_page_url?: string;
  language?: string;
  pdf?: string;

  graduate_program_id?: string;
  code?: string;
  area?: string;
  modality?: string;
  type?: string;
  rating?: string;
  institution_id?: string;
  description?: string;
  url_image?: string;
  city?: string;
  visible?: string;
  qtd_discente?: string;
  qtd_colaborador?: string;
  qtd_permanente?: string;
  acronym?: string;
  site?: string;

  id_dep?: string;

  type_reset?: string;

  dep_id?: string;
  org_cod?: string;
  dep_nom?: string;
  dep_des?: string;
  dep_email?: string;
  dep_site?: string;
  dep_tel?: string;
  img_data?: string;
  dep_sigla?: string;

  agency_code?: string;
  agency_name?: string;
  nature?: string;

  end_year?: string;

  number_academic_masters?: string;
  number_phd?: string;
  number_specialists?: string;
  number_undergraduates?: string;
  project_name?: string;
  start_year?: string;
  status?: string;
  menagers?: string[];
  production?: Production[];
  foment?: Forment[];
  components?: Components[];
}

interface Components {
  title: string;
  type: string;
}

interface Production {
  citations: string;
  lattes_id: string;
  name: string;
}

interface Forment {
  agency_code: string;
  agency_name: string;
  nature: string;
}

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
  data: ModalData;
}

export const useModal = create<ModalStore>((set: any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (
    type,
    newData = {
      onSuccess: undefined,
    },
  ) => {
    const updatedData = { ...useModal.getState().data, ...newData };
    set({ isOpen: true, type, data: updatedData });
  },
  onClose: () => {
    const secondaryModal = useModalSecundary.getState();
    if (!secondaryModal.isOpen) {
      set({ type: null, isOpen: false, data: {} });
    }
  },
}));
