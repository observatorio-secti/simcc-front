import logo_ufba from '../../assets/logo_ufba.png';
import logo_ebmsp from '../../assets/logo_ebmsp.png';
import logo_uesb from '../../assets/logo_uesb.png';
import logo_ufob from '../../assets/logo_ufob.png';
import logo_ufsb from '../../assets/logo_ufsb.png';
import logo_uefs from '../../assets/logo_uefs.png';
import logo_uesc from '../../assets/logo_uesc.png';
import logo_ufrb20 from '../../assets/logo_ufrb-20.png';
import logo_uneb from '../../assets/logo_uneb.png';
import logo_ifba from '../../assets/logo_ifba.png';
import logo_fiocruz from '../../assets/logo_fiocruz.png';

import campus_ebmsp from '../../assets/campus/campus_ebmsp.jpg';
import campus_uefs from '../../assets/campus/campus_uefs.jpg';
import campus_uesb from '../../assets/campus/campus_uesb.png';
import campus_ufob from '../../assets/campus/campus_UFOB.jpeg';
import campus_ufrb from '../../assets/campus/campus_ufrb.jpg';
import campus_ufsb from '../../assets/campus/campus_ufsb.jpeg';
import campus_uneb from '../../assets/campus/campus_uneb.jpg';
import campus_ufba from '../../assets/campus/ufba_campus.jpg';
import campus_uesc from '../../assets/campus/uesc_campus.jpg';
import campus_ifba from '../../assets/campus/ifba_campus.jpg';
import campus_fiocruz from '../../assets/campus/fiocruz_campus.jpg';

// Fallback pequeno e removível quando o back retornar.
// Usa apenas as imagens sem _dark, conforme solicitado.
// Mapeia por acronym normalizado (upper) e por id (uuid).

export const fallbackLogosByAcronym: Record<string, string> = {
  UFBA: logo_ufba,
  EBMSP: logo_ebmsp,
  UESB: logo_uesb,
  UFOB: logo_ufob,
  UFSB: logo_ufsb,
  UEFS: logo_uefs,
  UESC: logo_uesc,
  UFRB: logo_ufrb20,
  UNEB: logo_uneb,
  IFBA: logo_ifba,
  FIOCRUZ: logo_fiocruz,
};

// Ids vindos do carrossel descontinuado (src/components/homepage/components/carrossel-institution.tsx:47-125)
export const fallbackLogosById: Record<string, string> = {
  'f1ac00a8-15d9-4306-a893-c611636601d6': logo_ufba,
  'dc6b3b63-2ada-49cb-bbca-f888ff31d56b': logo_ebmsp,
  '36422e54-342b-4a4d-9879-edac6235343d': logo_uesb,
  'ecafd569-d31f-429b-ba33-26780f46b990': logo_ufob,
  '3c0594c8-ffbe-43e2-901a-b109e2e99985': logo_ufsb,
  'd752090d-8ecf-458f-a9fb-3e7b3659a9f0': logo_uefs,
  'f670bac4-e1ab-452c-af25-300e994759c3': logo_uesc,
  '73cdfd5f-e313-42c9-a90d-38ed38260d48': logo_ufrb20,
  '815f5ab1-3340-45b0-97d1-c16f93909caa': logo_uneb,
  'f1e4790b-5053-4aa2-89f4-37c2978d4086': logo_ifba,
  'd18e767a-72d4-43a9-beef-8999feb57266': logo_fiocruz,
};

// Fotos de capa locais (fallback pequeno - src/assets/campus/)
export const fallbackCoversByAcronym: Record<string, string> = {
  EBMSP: campus_ebmsp,
  UEFS: campus_uefs,
  UESB: campus_uesb,
  UFOB: campus_ufob,
  UFRB: campus_ufrb,
  UFSB: campus_ufsb,
  UNEB: campus_uneb,
  UFBA: campus_ufba,
  UESC: campus_uesc,
  IFBA: campus_ifba,
  FIOCRUZ: campus_fiocruz,
};

export const fallbackCoversById: Record<string, string> = {
  'dc6b3b63-2ada-49cb-bbca-f888ff31d56b': campus_ebmsp,
  'd752090d-8ecf-458f-a9fb-3e7b3659a9f0': campus_uefs,
  '36422e54-342b-4a4d-9879-edac6235343d': campus_uesb,
  'ecafd569-d31f-429b-ba33-26780f46b990': campus_ufob,
  '73cdfd5f-e313-42c9-a90d-38ed38260d48': campus_ufrb,
  '3c0594c8-ffbe-43e2-901a-b109e2e99985': campus_ufsb,
  '815f5ab1-3340-45b0-97d1-c16f93909caa': campus_uneb,
  'f1ac00a8-15d9-4306-a893-c611636601d6': campus_ufba,
  'f670bac4-e1ab-452c-af25-300e994759c3': campus_uesc,
  'f1e4790b-5053-4aa2-89f4-37c2978d4086': campus_ifba,
  'd18e767a-72d4-43a9-beef-8999feb57266': campus_fiocruz,
};

export function getFallbackInstitutionCover(params: {
  id?: string;
  acronym?: string;
  name?: string;
}): string | null {
  const { id, acronym, name } = params;
  if (id && fallbackCoversById[id]) return fallbackCoversById[id];
  if (id) {
    const lower = id.toLowerCase();
    const foundById = Object.entries(fallbackCoversById).find(([k]) => k.toLowerCase() === lower);
    if (foundById) return foundById[1];
  }
  const acrNorm = normalizeAcronym(acronym);
  if (acrNorm && fallbackCoversByAcronym[acrNorm]) return fallbackCoversByAcronym[acrNorm];
  if (acrNorm.startsWith('FIOCRUZ')) return fallbackCoversByAcronym['FIOCRUZ'] || null;
  if (name) {
    const upper = name.toUpperCase();
    const found = Object.keys(fallbackCoversByAcronym).find((key) => upper.includes(key));
    if (found) return fallbackCoversByAcronym[found];
    const m = upper.match(/^([A-Z]{2,6})\b/);
    if (m && fallbackCoversByAcronym[m[1]]) return fallbackCoversByAcronym[m[1]];
  }
  return null;
}

const normalizeAcronym = (value?: string) =>
  (value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

export function getFallbackInstitutionLogo(params: {
  id?: string;
  acronym?: string;
  name?: string;
}): string | null {
  const { id, acronym, name } = params;

  // 1) por id exato
  if (id && fallbackLogosById[id]) return fallbackLogosById[id];
  if (id) {
    const lower = id.toLowerCase();
    const foundById = Object.entries(fallbackLogosById).find(([k]) => k.toLowerCase() === lower);
    if (foundById) return foundById[1];
  }

  // 2) por acronym normalizado
  const acrNorm = normalizeAcronym(acronym);
  if (acrNorm && fallbackLogosByAcronym[acrNorm]) return fallbackLogosByAcronym[acrNorm];

  // alias FIOCRUZ-IGM / FIOCRUZ_* -> FIOCRUZ
  if (acrNorm.startsWith('FIOCRUZ')) return fallbackLogosByAcronym['FIOCRUZ'];

  // 3) tenta extrair sigla do nome (ex: "UFBA - Universidade Federal...")
  if (name) {
    const upper = name.toUpperCase();
    // procura sigla conhecida dentro do nome
    const found = Object.keys(fallbackLogosByAcronym).find((key) => upper.includes(key));
    if (found) return fallbackLogosByAcronym[found];
    // fallback: pega primeira sigla do nome (ex: "UESB - ...")
    const m = upper.match(/^([A-Z]{2,6})\b/);
    if (m && fallbackLogosByAcronym[m[1]]) return fallbackLogosByAcronym[m[1]];
  }

  return null;
}
