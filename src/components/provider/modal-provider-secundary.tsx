"use client";

import { useEffect, useState } from "react";

import { ArticlesModal } from "../modals/articles-modal";


import { useModalSecundary } from "../hooks/use-modal-store-secundary";
import { CookiesModal } from "../modals/cookies";
import { EditArticle } from "../modals/edit-article";
import { ProjectModal } from "../modals/project-modal";
import { CoautoresModal } from "../modals/coautores-modal";
import { EditorpageModal } from "../modals/editor-page";


const ModalContentSecundary = () => {
  const { type } = useModalSecundary();

  switch (type) {
    case 'articles-modal':
      return <ArticlesModal />
    case 'edit-article':
      return <EditArticle />
    case 'project-modal':
      return <ProjectModal />
    case 'coautores':
      return <CoautoresModal />
    case 'editor-page':
      return <EditorpageModal />
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

  return <ModalContentSecundary />
}