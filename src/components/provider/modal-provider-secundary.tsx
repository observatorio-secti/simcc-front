'use client';

import { useEffect, useState } from 'react';

import { ArticlesModal } from '../modals/articles-modal';
import { useModalSecundary } from '../hooks/use-modal-store-secundary';
import { ProjectModal } from '../modals/project-modal';
import { CoautoresModal } from '../modals/coautores-modal';
import { ShareArticleModal } from '../modals/share-article-modal';

const ModalContentSecundary = () => {
  const { type } = useModalSecundary();

  switch (type) {
    case 'articles-modal':
      return <ArticlesModal />;
    case 'project-modal':
      return <ProjectModal />;
    case 'coautores':
      return <CoautoresModal />;
    case 'share-article':
      return <ShareArticleModal />;
    default:
      return null;
  }
};

export const ModalProviderSecundary = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <ModalContentSecundary />;
};
