'use client';

import { useEffect, useState } from 'react';
import { ArticlesHome } from '../homepage/categorias/articles-home';
import { ResearchersHome } from '../homepage/categorias/researchers-home';

import { useModalResult } from '../hooks/use-modal-result';
import { PatentHome } from '../homepage/categorias/patent-home';
import { BookHome } from '../homepage/categorias/book-home';
import { SpeakerHome } from '../homepage/categorias/speaker-home';
import { InstitutionsHome } from '../homepage/categorias/institutions-home';
import { MapaHome } from '../homepage/categorias/mapa-home';
import { MapaHomeV2 } from '../homepage/categorias/mapa-home-v2';

const ModalContent = () => {
  const { type } = useModalResult();

  switch (type) {
    case 'articles-home':
      return <ArticlesHome />;
    case 'researchers-home':
      return <ResearchersHome />;
    case 'patent-home':
      return <PatentHome />;
    case 'book-home':
      return <BookHome />;
    case 'speaker-home':
      return <SpeakerHome />;
    case 'institutions-home':
      return <InstitutionsHome />;
    case 'mapa-home':
      return <MapaHome />;
    case 'mapa-home-v2':
      return <MapaHomeV2 />;
  }
};
export const ResultProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContent />;
};
