import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../ui/breadcrumb';
import {
  ArrowLeft,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  useDeleteInstitution,
  useInstitution,
  useRemoveAffiliation,
} from '../../hooks/use-academic';
import { useAuth } from '../../hooks/use-auth';
import { ResearcherListTable } from './researcher-list-table';
import { InstitutionDialog } from './institution-dialog';
import { ConfirmImpactDialog } from './confirm-impact-dialog';
import { ResearcherItem } from '../../types/academic';

export function InstitutionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const { data: institution, isLoading } = useInstitution(id);
  const deleteMutation = useDeleteInstitution();
  const removeAffiliationMutation = useRemoveAffiliation();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [researcherToUnlink, setResearcherToUnlink] =
    useState<ResearcherItem | null>(null);

  const handleDeleteInstitution = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    setIsDeleteDialogOpen(false);
    navigate('/console/instituicoes');
  };

  const handleConfirmUnlink = async () => {
    if (!id || !researcherToUnlink) return;
    await removeAffiliationMutation.mutateAsync({
      researcherId: researcherToUnlink.researcher_id,
      institutionId: id,
    });
    setResearcherToUnlink(null);
  };

  return (
    <>
      <Helmet>
        <title>
          {institution
            ? `${institution.acronym} | Console Simcc`
            : 'Instituição | Console Simcc'}
        </title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto bg-sm-canvas min-h-screen">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList className="text-xs font-sans text-sm-navy-600">
            <BreadcrumbItem>
              <BreadcrumbLink to="/">Início</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink to="/console">Console</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink to="/console/instituicoes">Instituições</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-extrabold text-sm-navy font-mono">
                {institution ? institution.acronym : 'Detalhes'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header da Instituição */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sm-wave-gray pb-5">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/console/instituicoes')}
              className="h-7 px-2 text-xs gap-1 text-sm-navy-600 hover:text-sm-navy"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar à lista
            </Button>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-6 w-16 rounded-full" />
              ) : (
                <span className="sm-tag font-mono text-xs">
                  {institution?.acronym}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-sm-navy font-sans">
                {isLoading ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  institution?.name
                )}
              </h1>
            </div>
            <p className="text-xs text-sm-navy-600">
              Corpo docente e pesquisadores vinculados a esta instituição.
            </p>
          </div>

          {/* Ações da Instituição */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-8 gap-1.5 border-sm-wave-gray text-xs font-semibold text-sm-navy rounded-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar Instituição
            </Button>

            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="h-8 gap-1.5 border-sm-wave-gray text-sm-red-700 hover:bg-sm-red-100/50 text-xs font-semibold rounded-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </Button>
            )}
          </div>
        </div>

        {/* Bloco de Pesquisadores da Instituição */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold font-sans text-sm-navy">
              Pesquisadores Vinculados
            </h2>
            <p className="text-xs text-sm-navy-600">
              Pesquisadores com afiliação cadastrada em {institution?.acronym}.
            </p>
          </div>

          {id && (
            <ResearcherListTable
              fixedInstitutionId={id}
              fixedInstitutionName={institution?.acronym}
              onRemoveFromInstitution={(res) => setResearcherToUnlink(res)}
              isRemoving={removeAffiliationMutation.isPending}
            />
          )}
        </div>

        {/* Modal Editar Instituição */}
        {institution && (
          <InstitutionDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            institution={institution}
          />
        )}

        {/* Confirmação de Exclusão da Instituição */}
        <ConfirmImpactDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          title="Excluir Instituição"
          description={`Tem certeza que deseja excluir "${institution?.acronym} - ${institution?.name}"?`}
          impactMessage="Todos os vínculos com os pesquisadores desta instituição serão desfeitos."
          confirmLabel="Excluir Instituição"
          destructive
          isLoading={deleteMutation.isPending}
          onConfirm={handleDeleteInstitution}
        />

        {/* Confirmação de Desvincular Pesquisador */}
        <ConfirmImpactDialog
          open={Boolean(researcherToUnlink)}
          onOpenChange={(open) => !open && setResearcherToUnlink(null)}
          title="Remover Vínculo Institucional"
          description={`Deseja desvincular o pesquisador "${researcherToUnlink?.name}" da instituição "${institution?.acronym}"?`}
          impactMessage="O pesquisador não será excluído do observatório, apenas o seu vínculo com esta instituição será cancelado."
          confirmLabel="Sim, desvincular"
          destructive={false}
          isLoading={removeAffiliationMutation.isPending}
          onConfirm={handleConfirmUnlink}
        />
      </div>
    </>
  );
}
