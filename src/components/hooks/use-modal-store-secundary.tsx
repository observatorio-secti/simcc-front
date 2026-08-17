import { create } from 'zustand';
import { useModal } from './use-modal-store';
import { Keepo } from '../dashboard/builder-page/builder-page';

export type ModalType =
  | 'articles-modal'
  | 'cookies'
  | 'edit-article'
  | 'image-article'
  | 'project-modal'
  | 'coautores'
  | 'editor-page'
  | 'share-article';

interface ModalData {
  id?: string;
  name?: string;

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

  keepoData?: Keepo;
  setKeepoData?: React.Dispatch<React.SetStateAction<Keepo>>;

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

  researcher_name?: string;
  id_dep?: string;

  relevance?: boolean;
  has_image?: boolean;

  quadrennial?: string;

  type_reset?: string;

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

  production?: Production[];
  foment?: Forment[];
  components?: Components[];
  apiUrl?: string;
  query?: string;
  data?: any;
  onSuccess?: () => void;
  onUpdate?: () => void;
}

interface Components {
  citations: string;
  lattes_id: string;
  name: string;
}

interface Production {
  title: string;
  type: string;
}

interface Forment {
  agency_code: string;
  agency_name: string;
  nature: string;
}

interface ModalStoreSecundary {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
  data: ModalData;
  onUpdate: (newData: Partial<ModalData>) => void;
}

export const useModalSecundary = create<ModalStoreSecundary>((set: any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, newData = {}) => {
    // Get primary modal state but don't modify it
    const primaryModal = useModal.getState();

    set({ isOpen: true, type, data: newData });
  },
  onClose: () => set({ type: null, isOpen: false }),
  onUpdate: (newData) =>
    set((state: ModalStoreSecundary) => ({
      data: { ...state.data, ...newData },
    })),
}));
