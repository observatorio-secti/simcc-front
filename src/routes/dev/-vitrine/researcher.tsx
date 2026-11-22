import { ExternalLink, FileDown, MoreHorizontal } from 'lucide-react';
import type {
  ResearcherDetail,
  ResearcherSummary,
} from '@/entities/researcher/model';
import { PersonCard } from '@/entities/researcher/ui/person-card';
import { ResearcherAvatar } from '@/entities/researcher/ui/researcher-avatar';
import { ResearcherProfileHeader } from '@/entities/researcher/ui/researcher-profile-header';
import { ResearcherRef } from '@/entities/researcher/ui/researcher-ref';
import { Button } from '@/shared/ui/button';
import { Demo, Showcase } from './showcase';

const SAMPLE_PORTRAIT_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0%" stop-color="#559fb8"/><stop offset="100%" stop-color="#024a60"/>' +
      '</linearGradient></defs>' +
      '<rect width="240" height="320" fill="url(#g)"/>' +
      '<circle cx="120" cy="108" r="46" fill="#e3f0f4" fill-opacity="0.9"/>' +
      '<path d="M40 286c8-54 44-86 80-86s72 32 80 86z" fill="#e3f0f4" fill-opacity="0.9"/>' +
      '</svg>',
  );

const HELENA_RESEARCHER: ResearcherSummary = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Helena Duarte Ramos',
  image_url: SAMPLE_PORTRAIT_URL,
  graduation: 'Pós-Doutorado',
  classification: 'A',
  affiliations: [
    {
      institution: {
        id: 'inst-ufba',
        name: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
      },
      city: { id: 'city-ssa', name: 'Salvador' },
    },
  ],
  matches: { total: 37, by_type: { profile: 37 }, items: [] },
};

const CAIO_RESEARCHER: ResearcherSummary = {
  id: '00000000-0000-4000-8000-000000000002',
  name: 'Caio Menezes Barreto',
  image_url: '',
  graduation: 'Doutorado',
  classification: 'B+',
  affiliations: [
    {
      institution: {
        id: 'inst-uesc',
        name: 'Universidade Estadual de Santa Cruz',
        acronym: 'UESC',
      },
      city: { id: 'city-ilh', name: 'Ilhéus' },
    },
  ],
  matches: { total: 20, by_type: { article: 20 }, items: [] },
};

const JULIA_RESEARCHER: ResearcherSummary = {
  id: '00000000-0000-4000-8000-000000000003',
  name: 'Júlia Andrade Souto',
  image_url: '',
  graduation: 'Doutorado',
  classification: null,
  affiliations: [
    {
      institution: {
        id: 'inst-ufba',
        name: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
      },
    },
    {
      institution: {
        id: 'inst-uneb',
        name: 'Universidade do Estado da Bahia',
        acronym: 'UNEB',
      },
    },
  ],
  matches: { total: 1, by_type: { profile: 1 }, items: [] },
};

const RAFAEL_RESEARCHER: ResearcherSummary = {
  id: '00000000-0000-4000-8000-000000000004',
  name: 'Rafael Nunes Prado',
  image_url: SAMPLE_PORTRAIT_URL,
  graduation: 'Mestrado',
  classification: 'A+',
  affiliations: [
    {
      institution: {
        id: 'inst-ifba',
        name: 'Instituto Federal da Bahia',
        acronym: 'IFBA',
      },
    },
  ],
  matches: null,
};

const SAMPLE_DETAIL: ResearcherDetail = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Helena Duarte Ramos',
  image_url: SAMPLE_PORTRAIT_URL,
  graduation: 'Pós-Doutorado',
  classification: 'A',
  lattes_update: '2026-10-22T03:00:00Z',
  abstract:
    'Graduação e mestrado em Engenharia Elétrica, doutorado em Engenharia de Computação. ' +
    'Atua em robótica móvel, controle preditivo e visão computacional aplicada a veículos autônomos e inspeção de subestações elétricas. ' +
    'Coordena projetos de cooperação com a indústria e orienta estudantes de iniciação científica, mestrado e doutorado em sistemas autônomos e aprendizado de máquina embarcado.',
  affiliations: [
    {
      institution: {
        id: 'inst-ufba',
        name: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
      },
      city: { id: 'city-ssa', name: 'Salvador' },
    },
  ],
  identifiers: {
    lattes_id: '1234567890123456',
    orcid: '0000-0001-2345-6789',
    scopus: '57200012345',
    openalex: 'A1234567890',
  },
  graduate_programs: [],
  research_groups: [],
};

export function ResearcherShowcase() {
  return (
    <Showcase
      id="pesquisador"
      title="Pesquisador (entidade)"
      description="Componentes de src/entities/researcher/ui/: ResearcherRef, ResearcherAvatar, PersonCard (sc-person) e ResearcherProfileHeader."
      bare
    >
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-2 md:p-6">
          <Demo label="ResearcherRef">
            <ResearcherRef researcher={JULIA_RESEARCHER} />
            <ResearcherRef
              researcher={HELENA_RESEARCHER}
              showAvatar
              imageUrl={SAMPLE_PORTRAIT_URL}
              meta="UFBA"
            />
            <ResearcherRef
              researcher={CAIO_RESEARCHER}
              showAvatar
              meta="UESC"
            />
          </Demo>

          <Demo label="ResearcherAvatar (sm, md, lg)">
            <ResearcherAvatar
              name="Helena Duarte Ramos"
              imageUrl={SAMPLE_PORTRAIT_URL}
              size="sm"
            />
            <ResearcherAvatar name="Caio Menezes Barreto" size="sm" />
            <ResearcherAvatar
              name="Helena Duarte Ramos"
              imageUrl={SAMPLE_PORTRAIT_URL}
              size="md"
            />
            <ResearcherAvatar name="Caio Menezes Barreto" size="md" />
            <ResearcherAvatar
              name="Helena Duarte Ramos"
              imageUrl={SAMPLE_PORTRAIT_URL}
              size="lg"
            />
            <ResearcherAvatar name="Caio Menezes Barreto" size="lg" />
          </Demo>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            PersonCard (grade e lista)
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PersonCard researcher={HELENA_RESEARCHER} searchType="profile" />
            <PersonCard researcher={CAIO_RESEARCHER} searchType="article" />
            <PersonCard researcher={JULIA_RESEARCHER} searchType="profile" />
            <PersonCard researcher={RAFAEL_RESEARCHER} />
          </div>
          <PersonCard
            researcher={HELENA_RESEARCHER}
            searchType="profile"
            layout="list"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            ResearcherProfileHeader
          </p>
          <ResearcherProfileHeader
            researcher={SAMPLE_DETAIL}
            areas={['Ciências Exatas e da Terra', 'Engenharias', 'Outros']}
            active
            highlightQuery="robotica"
            searchType="profile"
            actions={
              <>
                <Button size="icon-sm" aria-label="Abrir em nova aba">
                  <ExternalLink aria-hidden />
                </Button>
                <Button size="icon-sm" aria-label="Baixar relatório">
                  <FileDown aria-hidden />
                </Button>
                <Button size="icon-sm" variant="ghost" aria-label="Mais ações">
                  <MoreHorizontal aria-hidden />
                </Button>
              </>
            }
          />
        </div>
      </div>
    </Showcase>
  );
}
