import {
  BookOpen,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  Presentation,
  type LucideIcon,
} from 'lucide-react';
import type { ProductionKind } from '@/entities/production/model';

export type ProductionTabKey =
  | 'articles'
  | 'books'
  | 'technical'
  | 'reports'
  | 'guidance'
  | 'events'
  | 'projects';

export interface ProductionTabItem {
  readonly key: ProductionTabKey;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly kinds: readonly ProductionKind[];
}

export const PRODUCTION_TAB_ITEMS: readonly ProductionTabItem[] = [
  { key: 'articles', label: 'Artigos', icon: FileText, kinds: ['article'] },
  {
    key: 'books',
    label: 'Livros e capítulos',
    icon: BookOpen,
    kinds: ['book', 'book_chapter'],
  },
  {
    key: 'technical',
    label: 'Produção técnica',
    icon: Lightbulb,
    kinds: ['patent', 'software', 'brand'],
  },
  {
    key: 'reports',
    label: 'Relatórios técnicos',
    icon: FileSpreadsheet,
    kinds: ['report'],
  },
  {
    key: 'guidance',
    label: 'Orientações',
    icon: GraduationCap,
    kinds: ['guidance'],
  },
  {
    key: 'events',
    label: 'Eventos',
    icon: Presentation,
    kinds: ['event', 'event_work'],
  },
  {
    key: 'projects',
    label: 'Projetos',
    icon: FolderKanban,
    kinds: ['research_project'],
  },
];

export const PRODUCTION_TAB_KINDS: Record<
  ProductionTabKey,
  readonly ProductionKind[]
> = {
  articles: ['article'],
  books: ['book', 'book_chapter'],
  technical: ['patent', 'software', 'brand'],
  reports: ['report'],
  guidance: ['guidance'],
  events: ['event', 'event_work'],
  projects: ['research_project'],
};
