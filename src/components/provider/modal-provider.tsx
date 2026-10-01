'use client';

import { useEffect, useState } from 'react';
import { SearchModal } from '../modals/search-modal';
import { ResearcherModal } from '../modals/researcher-modal';
import { useModal } from '../hooks/use-modal-store';
import { RelatarBug } from '../modals/relatar-bug';
import { PesquisadoresSelecionadosModal } from '../modals/pesquisadores-selecionados-modal';

const ModalContent = () => {
  const { type } = useModal();

  switch (type) {
    case 'search':
      return <SearchModal />;
    case 'researcher-modal':
      return <ResearcherModal />;
    case 'relatar-problema':
      return <RelatarBug />;
    case 'pesquisadores-selecionados':
      return <PesquisadoresSelecionadosModal />;
    default:
      return null;
  }
};

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContent />;
};
