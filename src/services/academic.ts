import { apiAdmin } from '../lib/api';
import {
  Affiliation,
  GenericEnvelope,
  InstitutionCreate,
  InstitutionPublic,
  InstitutionsQueryParams,
  InstitutionUpdate,
  ResearcherCreate,
  ResearcherDetail,
  ResearcherItem,
  ResearcherSearchResponse,
  ResearchersQueryParams,
  ResearcherUpdate,
} from '../types/academic';

export const academicService = {
  // ===================== INSTITUIÇÕES =====================

  async getInstitutions(
    params: InstitutionsQueryParams = {},
  ): Promise<GenericEnvelope<InstitutionPublic>> {
    const { data } = await apiAdmin.get<GenericEnvelope<InstitutionPublic>>(
      'academic/institutions',
      { params },
    );
    return data;
  },

  async getInstitution(id: string): Promise<InstitutionPublic> {
    const { data } = await apiAdmin.get<InstitutionPublic>(
      `academic/institutions/${id}`,
    );
    return data;
  },

  async createInstitution(payload: InstitutionCreate): Promise<InstitutionPublic> {
    const { data } = await apiAdmin.post<InstitutionPublic>(
      'academic/institutions',
      payload,
    );
    return data;
  },

  async updateInstitution(
    id: string,
    payload: InstitutionUpdate,
  ): Promise<InstitutionPublic> {
    const { data } = await apiAdmin.put<InstitutionPublic>(
      `academic/institutions/${id}`,
      payload,
    );
    return data;
  },

  async deleteInstitution(id: string): Promise<void> {
    await apiAdmin.delete(`academic/institutions/${id}`);
  },

  // ===================== PESQUISADORES =====================

  async getResearchers(
    params: ResearchersQueryParams = {},
  ): Promise<ResearcherSearchResponse> {
    const cleanParams: Record<string, unknown> = {};
    if (params.q) cleanParams.q = params.q;
    if (params.institution_id) cleanParams.institution_id = params.institution_id;
    if (params.page !== undefined) cleanParams.page = params.page;
    if (params.per_page !== undefined) cleanParams.per_page = params.per_page;
    if (params.sort_by) cleanParams.sort_by = params.sort_by;
    if (params.sort_order) cleanParams.sort_order = params.sort_order;

    const { data } = await apiAdmin.get<ResearcherSearchResponse>(
      'academic/researchers',
      { params: cleanParams },
    );
    return data;
  },

  async getResearcher(id: string): Promise<ResearcherDetail> {
    const { data } = await apiAdmin.get<ResearcherDetail>(
      `academic/researchers/${id}`,
    );
    return data;
  },

  async createResearcher(payload: ResearcherCreate): Promise<ResearcherItem> {
    const { data } = await apiAdmin.post<ResearcherItem>(
      'academic/researchers',
      payload,
    );
    return data;
  },

  async updateResearcher(
    id: string,
    payload: ResearcherUpdate,
  ): Promise<ResearcherDetail> {
    const { data } = await apiAdmin.put<ResearcherDetail>(
      `academic/researchers/${id}`,
      payload,
    );
    return data;
  },

  async deleteResearcher(id: string): Promise<void> {
    await apiAdmin.delete(`academic/researchers/${id}`);
  },

  // ===================== AFILIAÇÕES =====================

  async addAffiliation(
    researcherId: string,
    institutionId: string,
  ): Promise<Affiliation> {
    const { data } = await apiAdmin.post<Affiliation>(
      `academic/researchers/${researcherId}/institutions/${institutionId}`,
    );
    return data;
  },

  async removeAffiliation(
    researcherId: string,
    institutionId: string,
  ): Promise<void> {
    await apiAdmin.delete(
      `academic/researchers/${researcherId}/institutions/${institutionId}`,
    );
  },
};
