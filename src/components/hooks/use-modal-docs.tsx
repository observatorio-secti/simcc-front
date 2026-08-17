import { create } from 'zustand';

export type ModalType =
  | 'termos-uso'
  | 'videos'
  | 'politica-privacidade'
  | 'api-docs'
  | 'informacoes'
  | 'dicionario-cores'
  | 'incites';

interface ModalStore {
  type: ModalType | null;
  isOpen: boolean;
  onOpen: (type: ModalType) => void;
  onClose: () => void;
}

export const useModalDocs = create<ModalStore>((set: any) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type: any) => set({ isOpen: true, type }),
  onClose: () => set({ type: null, isOpen: false }),
}));
