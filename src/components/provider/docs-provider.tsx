'use client';

import { useEffect, useState } from 'react';
import { useModalDocs } from '../hooks/use-modal-docs';
import { TermosUso } from '../docs-api/termos-uso';
import { PoliticaPrivacidade } from '../docs-api/politica-privacidade';
import { ApiDocs } from '../docs-api/api-docs';
import { DicionarioCores } from '../docs-api/dicionario-cores';
import { Info } from '../info/info';
import { Videos } from '../docs-api/videos';

const ModalContent = () => {
  const { type } = useModalDocs();

  switch (type) {
    case 'termos-uso':
      return <TermosUso />;
    case 'politica-privacidade':
      return <PoliticaPrivacidade />;
    case 'api-docs':
      return <ApiDocs />;
    case 'dicionario-cores':
      return <DicionarioCores />;
    case 'informacoes':
      return <Info />;
    case 'videos':
      return <Videos />;
  }
};
export const DocsProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) null;
  return <ModalContent />;
};
