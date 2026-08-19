export interface Departments {
  dep_des: string;
  dep_email: string;
  dep_nom: string;
  dep_id: string;
  dep_sigla: string;
  dep_site: string;
  dep_tel: string;
  img_data: string;
}

export interface Bolsistas {
  aid_quantity: string;
  call_title: string;
  funding_program_name: string;
  modality_code: string;
  category_level_code: string;
  institute_name: string;
  modality_name: string;
  scholarship_quantity: string;
}

export interface GraduatePrograms {
  graduate_program_id: string;
  name: string;
}

export interface Research {
  among: number;
  status: boolean;
  articles: number;
  classe: string;
  cargo: string;
  rt: string;
  progressao: string;
  genero: string;
  entradanaufmg: string;
  book: number;
  book_chapters: number;
  id: string;
  name: string;
  university: string;
  lattes_id: string;
  area: string;
  lattes_10_id: string;
  abstract: string;
  city: string;
  orcid: string;
  image: string;
  graduation: string;
  patent: string;
  software: string;
  brand: string;
  lattes_update: Date;
  h_index: string;
  relevance_score: string;
  works_count: string;
  cited_by_count: string;
  i10_index: string;
  scopus: string;
  openalex: string;
  subsidy: Bolsistas[];
  graduate_programs: GraduatePrograms[];
  departments: Departments[];
  speaker?: string;
}

export interface SummaryStats {
  h_index: string;
  i10_index: string;
}

export interface Ids {
  scopus: string;
}

export interface ResearchOpenAlex {
  display_name: string;
  id: string;
  orcid: string;
  works_count: string;
  works_api_url: string;
  relevance_score: string;
  cited_by_count: string;
  summary_stats: SummaryStats;
  ids: Ids;
}

export interface CityData {
  nome: string;
  latitude: number;
  longitude: number;
  pesquisadores: number;
  professores: string[];
  lattes_10_id: string;
}

export interface ResearcherFilterValues {
  areas: string[];
  graduations: string[];
  cities: string[];
  universities: string[];
  subsidies: string[];
  graduatePrograms: string[];
  departments: string[];
}
