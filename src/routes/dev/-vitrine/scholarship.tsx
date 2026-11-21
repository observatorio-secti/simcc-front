import type { Scholarship } from '@/entities/scholarship/model';
import {
  ScholarshipCard,
  ScholarshipModalityBadge,
} from '@/entities/scholarship/ui/scholarship-card';
import { Demo, Showcase } from './showcase';

const SCHOLARSHIPS: ReadonlyArray<Scholarship> = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    researcher: {
      id: '00000000-0000-4000-8000-000000000201',
      name: 'Ana Beatriz Santos',
    },
    modality: 'Produtividade em Pesquisa - 1A',
    category_level: '1A',
    call_title: 'Chamada CNPq 09/2023',
    funding_program: 'Bolsas no País',
    institute: 'Universidade Federal da Bahia - BA - Brasil',
    aid_quantity: null,
    scholarship_quantity: 1,
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    researcher: {
      id: '00000000-0000-4000-8000-000000000202',
      name: 'Carlos Henrique de Oliveira Sampaio',
    },
    modality: 'Produtividade Desen. Tec. e Extensão Inovadora - 2',
    category_level: '2',
    call_title: null,
    funding_program: null,
    institute: 'Universidade Estadual de Santa Cruz - BA - Brasil',
    aid_quantity: 2,
    scholarship_quantity: 1,
  },
  {
    id: '00000000-0000-4000-8000-000000000103',
    researcher: {
      id: '00000000-0000-4000-8000-000000000203',
      name: 'Joana Lima',
    },
    modality: null,
    category_level: null,
    call_title: null,
    funding_program: 'Auxílio à pesquisa',
    institute: null,
    aid_quantity: 1,
    scholarship_quantity: null,
  },
];

export function ScholarshipShowcase() {
  return (
    <Showcase
      id="bolsa"
      title="Bolsa (D1.4)"
      description="Bolsista de /v2/scholarship: borda lateral e Dot pela modalidade (bolsa-PQ, bolsa-DT ou neutra), nível, instituição, chamada e quantidades. O nome abre o perfil."
    >
      <Demo label="ScholarshipModalityBadge (PQ, DT e fora do dicionário)">
        {SCHOLARSHIPS.map((item) => (
          <ScholarshipModalityBadge key={item.id} modality={item.modality} />
        ))}
      </Demo>

      <Demo
        label="ScholarshipCard"
        className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {SCHOLARSHIPS.map((item) => (
          <ScholarshipCard key={item.id} scholarship={item} />
        ))}
      </Demo>
    </Showcase>
  );
}
