import type { IndexLevelKey } from '@/shared/lib/design-tokens';

export interface ResearcherIndexLevelRow {
  level: IndexLevelKey;
  phdYears: string;
  academicProduction: string;
  pgExperience: string;
  combinedRule: string;
}

/**
 * Parâmetros multicritério para classificação dos pesquisadores nos níveis
 * de E a A+ (referência: legado-v1 e Edital CNPq 04/2021).
 */
export const RESEARCHER_INDEX_LEVELS: readonly ResearcherIndexLevelRow[] = [
  {
    level: 'A+',
    phdYears: '≥ 10',
    academicProduction: 'A + L + CL ≥ 5 (mínimo 2 A1)',
    pgExperience: '≥ 4 doutorados',
    combinedRule: '≥ 1 A1 + ≥ 1 patente',
  },
  {
    level: 'A',
    phdYears: '≥ 10',
    academicProduction: 'A + L + CL ≥ 5 (mínimo 1 A1)',
    pgExperience: '≥ 2 doutorados',
    combinedRule: '≥ 1 patente',
  },
  {
    level: 'B+',
    phdYears: '≥ 8',
    academicProduction: 'A + L + CL ≥ 4 (mínimo 2 AA)',
    pgExperience: '≥ 2 mestrados ou ≥ 1 doutorado',
    combinedRule: '≥ 1 A* + (≥ 1 patente ou ≥ 3 softwares)',
  },
  {
    level: 'B',
    phdYears: '≥ 8',
    academicProduction: 'A + L + CL ≥ 4 (mínimo 1 AA)',
    pgExperience: '≥ 2 mestrados ou ≥ 1 doutorado',
    combinedRule: '≥ 1 patente ou ≥ 3 softwares',
  },
  {
    level: 'C+',
    phdYears: '≥ 6',
    academicProduction: 'A + L + CL ≥ 3 (mínimo 2 AA)',
    pgExperience: '≥ 1 mestrado ou 1 doutorado',
    combinedRule: '≥ 1 A* + (≥ 1 patente ou ≥ 3 softwares)',
  },
  {
    level: 'C',
    phdYears: '≥ 6',
    academicProduction: 'A + L + CL ≥ 3 (mínimo 1 AA)',
    pgExperience: '≥ 1 mestrado ou ≥ 1 doutorado',
    combinedRule: '≥ 1 patente ou ≥ 3 softwares',
  },
  {
    level: 'D+',
    phdYears: '≥ 3',
    academicProduction: 'A + L + CL ≥ 2 (mínimo 1 AA)',
    pgExperience: '—',
    combinedRule: '≥ 1 patente ou ≥ 3 softwares',
  },
  {
    level: 'D',
    phdYears: '≥ 3',
    academicProduction: 'A + L + CL ≥ 2 (mínimo 1 AA)',
    pgExperience: '—',
    combinedRule: '≥ 1 patente ou ≥ 3 softwares',
  },
  {
    level: 'E+',
    phdYears: '< 3',
    academicProduction: 'A + L + CL ≥ 1',
    pgExperience: '—',
    combinedRule: '≥ 1 A* ou ≥ 1 patente ou ≥ 3 softwares',
  },
  {
    level: 'E',
    phdYears: '—',
    academicProduction: '—',
    pgExperience: '—',
    combinedRule: 'Todos os demais pesquisadores não classificados acima',
  },
];

export const RESEARCHER_INDEX_LEGEND =
  '(A – Artigo) · (AB – Qualquer artigo Qualis B) · (AA – Qualquer artigo Qualis A) · (A1 – Artigo Qualis A1) · (L – Livro) · (CL – Capítulo de livro)';
