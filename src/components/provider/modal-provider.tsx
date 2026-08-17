'use client';

import { useEffect, useState } from 'react';
import { SearchModal } from '../modals/search-modal';
import { AddGraduateProgram } from '../modals/add-graduate-program';

import { ResearcherModal } from '../modals/researcher-modal';
import { ConfirmDeleteResearcher } from '../modals/confirm-delete-researcher';
import { ConfirmDeletePosGraduateProgram } from '../modals/confirm-delete-pos-graduate-program';
import { EditGraduateProgram } from '../modals/edit-graduate-program';

import { AddResearcherCsvModal } from '../modals/add-researcher-csv-modal';

import { ConfirmDeleteResearcherGraduateProgram } from '../modals/confirm-delete-researcher-graduate-program';
import { ConfirmDeleteStudentGraduateProgram } from '../modals/confirm-delete-student-graduate-program';
import { useModal } from '../hooks/use-modal-store';
import { ImportBolsistas } from '../modals/import-bolsistas';
import { ImportDocentes } from '../modals/import-docentes';
import { ImportTaes } from '../modals/import-taes';

import { AddDepartamento } from '../modals/add-departamento';
import { ConfirmDeleteDepartamento } from '../modals/confirm-delete-departamento';
import { ImportDisciplina } from '../modals/import-disciplina';
import { ConfirmDeleteResearcherDepartament } from '../modals/confirm-delete-researcher-departament';
import { MinhaArea } from '../minha-area/minha-area';
import { AddBackground } from '../modals/add-background';
import { RelatarBug } from '../modals/relatar-bug';
import { PesquisadoresSelecionadosModal } from '../modals/pesquisadores-selecionados-modal';
import { ConfirmDeleteInstitution } from '../modals/confirm-delete-institution';
import { UserProfileInitialModal } from '../modals/user-profile-initial';

const ModalContent = () => {
  const { type } = useModal();

  switch (type) {
    case 'add-graduate-program':
      return <AddGraduateProgram />;
    case 'search':
      return <SearchModal />;
    case 'confirm-delete-pos-graduate-program':
      return <ConfirmDeletePosGraduateProgram />;
    case 'confirm-delete-researcher':
      return <ConfirmDeleteResearcher />;
    case 'confirm-delete-researcher-graduate-program':
      return <ConfirmDeleteResearcherGraduateProgram />;
    case 'confirm-delete-student-graduate-program':
      return <ConfirmDeleteStudentGraduateProgram />;
    case 'edit-graduate-program':
      return <EditGraduateProgram />;
    case 'researcher-modal':
      return <ResearcherModal />;
    case 'import-bolsistas':
      return <ImportBolsistas />;
    case 'import-docentes':
      return <ImportDocentes />;
    case 'import-taes':
      return <ImportTaes />;
    case 'add-researcher-csv':
      return <AddResearcherCsvModal />;
    case 'add-departamento':
      return <AddDepartamento />;
    case 'confirm-delete-departamento':
      return <ConfirmDeleteDepartamento />;
    case 'edit-departamento':
      return <AddDepartamento />;
    case 'import-disciplina':
      return <ImportDisciplina />;
    case 'confirm-delete-researcher-departament':
      return <ConfirmDeleteResearcherDepartament />;
    case 'minha-area':
      return <MinhaArea />;
    case 'confirm-delete-institution':
      return <ConfirmDeleteInstitution />;
    case 'add-background':
      return <AddBackground />;
    case 'relatar-problema':
      return <RelatarBug />;
    case 'pesquisadores-selecionados':
      return <PesquisadoresSelecionadosModal />;
    case 'user-profile-initial':
      return <UserProfileInitialModal />;
    case 'edit-background':
      return <AddBackground />;
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
