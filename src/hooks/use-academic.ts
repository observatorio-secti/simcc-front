import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { academicService } from '../services/academic';
import {
  CollectionCreate,
  CollectionsQueryParams,
  CollectionUpdate,
  InstitutionCreate,
  InstitutionsQueryParams,
  InstitutionUpdate,
  ResearcherCreate,
  ResearchersQueryParams,
  ResearcherUpdate,
} from '../types/academic';

// ===================== INSTITUIÇÕES HOOKS =====================

export function useInstitutions(params: InstitutionsQueryParams = {}) {
  return useQuery({
    queryKey: ['academic', 'institutions', params],
    queryFn: () => academicService.getInstitutions(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useInstitution(id?: string) {
  return useQuery({
    queryKey: ['academic', 'institution', id],
    queryFn: () => academicService.getInstitution(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InstitutionCreate) =>
      academicService.createInstitution(data),
    onSuccess: (created) => {
      toast.success(`Instituição "${created.acronym}" criada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['academic', 'institutions'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao criar instituição. Tente novamente.';
      toast.error(msg);
    },
  });
}

export function useUpdateInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InstitutionUpdate }) =>
      academicService.updateInstitution(id, data),
    onSuccess: (updated) => {
      toast.success(`Instituição "${updated.acronym}" atualizada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['academic', 'institutions'] });
      queryClient.invalidateQueries({
        queryKey: ['academic', 'institution', updated.id],
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao atualizar instituição.';
      toast.error(msg);
    },
  });
}

export function useDeleteInstitution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicService.deleteInstitution(id),
    onSuccess: () => {
      toast.success('Instituição excluída com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['academic', 'institutions'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ||
        'Não foi possível excluir a instituição. Verifique se existem vínculos ativos.';
      toast.error(msg);
    },
  });
}

// ===================== COLEÇÕES HOOKS =====================

export function useCollections(params: CollectionsQueryParams = {}) {
  return useQuery({
    queryKey: ['academic', 'collections', params],
    queryFn: () => academicService.getCollections(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCollection(id?: string) {
  return useQuery({
    queryKey: ['academic', 'collection', id],
    queryFn: () => academicService.getCollection(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CollectionCreate) =>
      academicService.createCollection(data),
    onSuccess: (created) => {
      toast.success(`Coleção "${created.name}" criada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['academic', 'collections'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao criar coleção. Verifique se o nome ou slug já existem.';
      toast.error(msg);
    },
  });
}

export function useUpdateCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CollectionUpdate }) =>
      academicService.updateCollection(id, data),
    onSuccess: (updated) => {
      toast.success(`Coleção "${updated.name}" atualizada!`);
      queryClient.invalidateQueries({ queryKey: ['academic', 'collections'] });
      queryClient.invalidateQueries({
        queryKey: ['academic', 'collection', updated.id],
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao atualizar coleção.';
      toast.error(msg);
    },
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicService.deleteCollection(id),
    onSuccess: () => {
      toast.success('Coleção excluída com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['academic', 'collections'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail ||
        'Não foi possível excluir a coleção. Verifique se é a padrão ou se há pesquisadores associados.';
      toast.error(msg);
    },
  });
}

export function useAddResearcherToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      researcherId,
      collectionId,
      attributes,
    }: {
      researcherId: string;
      collectionId: string;
      attributes?: Record<string, unknown>;
    }) =>
      academicService.addResearcherToCollection(
        researcherId,
        collectionId,
        attributes,
      ),
    onSuccess: (_, variables) => {
      toast.success('Pesquisador adicionado à coleção!');
      queryClient.invalidateQueries({
        queryKey: ['academic', 'researcher', variables.researcherId],
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['academic', 'collections'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao vincular coleção.';
      toast.error(msg);
    },
  });
}

export function useRemoveResearcherFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      researcherId,
      collectionId,
    }: {
      researcherId: string;
      collectionId: string;
    }) =>
      academicService.removeResearcherFromCollection(researcherId, collectionId),
    onSuccess: (_, variables) => {
      toast.success('Vínculo com a coleção removido.');
      queryClient.invalidateQueries({
        queryKey: ['academic', 'researcher', variables.researcherId],
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['academic', 'collections'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao remover da coleção.';
      toast.error(msg);
    },
  });
}

// ===================== PESQUISADORES HOOKS =====================

export function useResearchers(params: ResearchersQueryParams = {}) {
  return useQuery({
    queryKey: ['academic', 'researchers', params],
    queryFn: () => academicService.getResearchers(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useResearcher(id?: string) {
  return useQuery({
    queryKey: ['academic', 'researcher', id],
    queryFn: () => academicService.getResearcher(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateResearcher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ResearcherCreate) =>
      academicService.createResearcher(data),
    onSuccess: (created) => {
      toast.success(`Pesquisador "${created.name}" cadastrado com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['academic', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['academic', 'institutions'] });
    },
    onError: (err: any) => {
      if (err?.response?.status === 409) {
        toast.error('Este Lattes ID já está cadastrado na plataforma.');
      } else {
        const msg =
          err?.response?.data?.detail || 'Erro ao cadastrar pesquisador.';
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }
    },
  });
}

export function useUpdateResearcher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResearcherUpdate }) =>
      academicService.updateResearcher(id, data),
    onSuccess: (updated) => {
      toast.success(`Dados de "${updated.name}" atualizados com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['academic', 'researchers'] });
      queryClient.invalidateQueries({
        queryKey: ['academic', 'researcher', updated.researcher_id],
      });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao atualizar dados do pesquisador.';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    },
  });
}

export function useDeleteResearcher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => academicService.deleteResearcher(id),
    onSuccess: () => {
      toast.success('Pesquisador removido com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['academic', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['academic', 'institutions'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao remover pesquisador.';
      toast.error(msg);
    },
  });
}

// ===================== AFILIAÇÕES HOOKS =====================

export function useAddAffiliation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      researcherId,
      institutionId,
    }: {
      researcherId: string;
      institutionId: string;
    }) => academicService.addAffiliation(researcherId, institutionId),
    onSuccess: (_, variables) => {
      toast.success('Instituição vinculada com sucesso!');
      queryClient.invalidateQueries({
        queryKey: ['academic', 'researcher', variables.researcherId],
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['academic', 'institutions'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao vincular instituição.';
      toast.error(msg);
    },
  });
}

export function useRemoveAffiliation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      researcherId,
      institutionId,
    }: {
      researcherId: string;
      institutionId: string;
    }) => academicService.removeAffiliation(researcherId, institutionId),
    onSuccess: (_, variables) => {
      toast.success('Vínculo institucional removido.');
      queryClient.invalidateQueries({
        queryKey: ['academic', 'researcher', variables.researcherId],
      });
      queryClient.invalidateQueries({ queryKey: ['academic', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['academic', 'institutions'] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.detail || 'Erro ao remover vínculo institucional.';
      toast.error(msg);
    },
  });
}
