import { useQuery } from '@tanstack/react-query';
import {
  programDetailFixture,
  programSummaryFixture,
} from '@/entities/graduate-program/fixtures';
import { graduateProgramQueries } from '@/entities/graduate-program/queries';
import { ProgramCard } from '@/entities/graduate-program/ui/program-card';
import { ProgramFacts } from '@/entities/graduate-program/ui/program-facts';
import { ProgramRef } from '@/entities/graduate-program/ui/program-ref';
import { ResearchLineList } from '@/entities/graduate-program/ui/research-line-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Skeleton } from '@/shared/ui/skeleton';
import type { VitrineSection } from '../showcase';
import { Demo, Showcase } from '../showcase';

/** Três programas da Bahia vindos da API configurada no .env. */
function LivePrograms() {
  const { data, error, isPending } = useQuery(
    graduateProgramQueries.list({ state: ['BA'], per_page: 3 }),
  );

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-48 rounded-lg" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar da API: {error.message}
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.data.map((program) => (
        <ProgramCard key={program.id} program={program} />
      ))}
    </div>
  );
}

function GraduateProgramShowcase() {
  return (
    <Showcase
      id="graduate-program"
      title="Programa de pós-graduação"
      description="Entidade graduate-program: ProgramRef, ProgramCard (sobre o EntityCard), ResearchLineList e ProgramFacts. Os links levam a /pos-graduacao/:id, rota da T5."
      bare
    >
      <Card>
        <CardContent className="flex flex-col gap-6 p-4 md:p-6">
          <Demo label="ProgramRef">
            <ProgramRef program={programSummaryFixture} className="text-sm" />
          </Demo>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          ProgramCard: item da lista, detalhe e programa sem sigla
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProgramCard program={programSummaryFixture} />
          <ProgramCard program={programDetailFixture} />
          <ProgramCard
            program={{
              ...programSummaryFixture,
              id: '00000000-0000-4000-8000-000000000003',
              name: 'ADMINISTRAÇÃO PÚBLICA E DE EMPRESAS',
              acronym: null,
              area: 'ADMINISTRAÇÃO PÚBLICA E DE EMPRESAS, CIÊNCIAS CONTÁBEIS E TURISMO',
              modality: 'PROFISSIONAL',
              rating: null,
            }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Linhas de pesquisa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ResearchLineList
              lines={programDetailFixture.research_lines ?? []}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Dados do programa</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgramFacts program={programDetailFixture} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sem linhas de pesquisa</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchLineList lines={[]} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          Da API (graduateProgramQueries.list)
        </p>
        <LivePrograms />
      </div>
    </Showcase>
  );
}

export const section: VitrineSection = {
  id: 'graduate-program',
  label: 'Programa de pós-graduação',
  Component: GraduateProgramShowcase,
};
