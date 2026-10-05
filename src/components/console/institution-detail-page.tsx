import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../ui/badge';
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

  const { data: institution, isLoading, isError } = useInstitution(id);
  const deleteMutation = useDeleteInstitution();
  const removeAffiliationMutation = useRemoveAffiliation();

  // Modais de edição e exclusão da instituição
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

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Breadcrumb de Navegação */}
        <Breadcrumb>
          <BreadcrumbList className="text-xs font-sans">
            <BreadcrumbItem>
              <BreadcrumbLink to="/">Página Inicial</BreadcrumbLink>
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
              <BreadcrumbPage className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono">
                {institution ? institution.acronym : 'Detalhes'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header da Instituição */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/console/instituicoes')}
                className="h-7 px-2 text-xs gap-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à lista
              </Button>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <span className="text-xs text-neutral-500 font-mono">
                ID: {id?.slice(0, 8)}...
              </span>
            </div>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <Skeleton className="h-8 w-24 rounded-full" />
              ) : (
                <Badge
                  variant="outline"
                  className="font-mono text-sm px-3 py-1 border-[#559FB8] bg-[#559FB8]/10 text-[#07677e] dark:text-[#559FB8] font-bold"
                >
                  {institution?.acronym}
                </Badge>
              )}
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
                {isLoading ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  institution?.name
                )}
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Gerencie o corpo docente e os pesquisadores vinculados a esta
              instituição.
            </p>
          </div>

          {/* Ações da Instituição */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-9 gap-1.5 border-neutral-300 dark:border-neutral-700 text-xs font-medium"
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
                className="h-9 gap-1.5 border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Excluir
              </Button>
            )}
          </div>
        </div>

        {/* Bloco de Pesquisadores da Instituição */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-sans text-neutral-900 dark:text-neutral-100">
                Pesquisadores Vinculados
              </h2>
              <p className="text-xs text-neutral-500">
                Lista de pesquisadores com afiliação ativa em {institution?.acronym}.
              </p>
            </div>
          </div>

          {/* Reuso canônico da tabela de pesquisadores com filtro fixo */}
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
