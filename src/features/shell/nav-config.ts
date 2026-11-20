import {
  AArrowUp,
  BarChart3,
  Building2,
  Download,
  GraduationCap,
  Home,
  Landmark,
  Link2,
  MoreHorizontal,
  PanelsTopLeft,
  SearchCheck,
  Sparkles,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

export const OBSERVATORIO_URL = 'https://observatoriocti.secti.ba.gov.br/';
export const GOV_BA_URL = 'https://www.ba.gov.br/secti/';

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type NavSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  items: readonly NavItem[];
};

/** Itens principais ("Acesso rápido") da barra lateral pública. */
export const QUICK_NAV_ITEMS: readonly NavItem[] = [
  { title: 'Página inicial', url: '/', icon: Home },
  { title: 'Pesquisar', url: '/busca', icon: SearchCheck },
  { title: 'Pesquisar com IA', url: '/maria', icon: Sparkles },
];

/** Seções colapsáveis ("Plataforma") com ícones de design-kit/reference/icons.md. */
export const PLATFORM_NAV_SECTIONS: readonly NavSection[] = [
  {
    id: 'ferramentas',
    title: 'Ferramentas',
    icon: Wrench,
    defaultOpen: true,
    items: [
      { title: 'Listagens', url: '/listagens', icon: Download },
      { title: 'Dados', url: '/paineis-dados-externos', icon: Link2 },
    ],
  },
  {
    id: 'paginas',
    title: 'Páginas',
    icon: PanelsTopLeft,
    defaultOpen: true,
    items: [
      { title: 'Grupos de pesquisa', url: '/grupos-pesquisa', icon: Users },
      { title: 'Indicadores', url: '/indicadores', icon: BarChart3 },
      { title: 'Instituições', url: '/instituicoes', icon: Building2 },
      { title: 'Institutos de CT&I', url: '/incites', icon: Landmark },
      { title: 'Pós-graduação', url: '/pos-graduacao', icon: GraduationCap },
    ],
  },
  {
    id: 'outros',
    title: 'Outros',
    icon: MoreHorizontal,
    defaultOpen: true,
    items: [
      {
        title: 'Índice do pesquisador',
        url: '/indice-pesquisador',
        icon: AArrowUp,
      },
    ],
  },
];

function normalizePath(path: string): string {
  const withoutQuery = path.split(/[?#]/)[0] ?? '/';
  if (withoutQuery.length > 1) {
    return withoutQuery.replace(/\/+$/, '') || '/';
  }
  return withoutQuery || '/';
}

/**
 * Regra única de item ativo na navegação lateral: a raiz exige igualdade exata;
 * as demais rotas ativam também suas subrotas (ex.: `/instituicoes/ufba`).
 */
export function isActive(url: string, pathname: string): boolean {
  const normalizedUrl = normalizePath(url);
  const normalizedPathname = normalizePath(pathname);

  if (normalizedUrl === '/') {
    return normalizedPathname === '/';
  }

  return (
    normalizedPathname === normalizedUrl ||
    normalizedPathname.startsWith(`${normalizedUrl}/`)
  );
}
