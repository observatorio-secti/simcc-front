import { Building2, FlaskConical, GraduationCap, Users } from 'lucide-react';
import { EntityCard } from '@/shared/ui/entity-card';
import type { VitrineSection } from '../showcase';
import { Showcase } from '../showcase';

function EntityCardShowcase() {
  return (
    <Showcase
      id="entity-card"
      title="EntityCard"
      description="Card de instituição, programa ou grupo (sc-entity). Sem conhecer a entidade: ícone, nome e metadados vêm de quem usa."
      bare
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <EntityCard
          icon={Building2}
          name="Universidade Estadual de Santa Cruz"
          meta={[
            { icon: Users, label: '812 pesquisadores' },
            { icon: GraduationCap, label: '34 programas' },
          ]}
        />
        <EntityCard
          icon={GraduationCap}
          name="Programa de pós-graduação em ciência da computação"
          meta={[{ icon: Users, label: '27 pesquisadores' }]}
        />
        <EntityCard icon={FlaskConical} name="Grupo sem metadados" />
      </div>
    </Showcase>
  );
}

export const section: VitrineSection = {
  id: 'entity-card',
  label: 'EntityCard',
  Component: EntityCardShowcase,
};
