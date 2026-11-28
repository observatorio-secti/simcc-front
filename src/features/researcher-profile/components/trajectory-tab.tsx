import { Award, Briefcase, GraduationCap } from 'lucide-react';
import {
  formatDegreeLabel,
  formatEducationStatus,
  type ResearcherDetail,
} from '@/entities/researcher/model';
import { scholarshipColor, statusColor } from '@/shared/lib/design-tokens';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { SectionHeader } from '@/shared/ui/section-header';

export interface TrajectoryTabProps {
  researcher: ResearcherDetail;
}

function formatYearSpan(
  startYear?: number | null,
  endYear?: number | null,
): string | null {
  if (startYear == null && endYear == null) return null;
  if (startYear != null && endYear != null) return `${startYear} – ${endYear}`;
  if (startYear != null) return `${startYear} – Atual`;
  return `Até ${endYear}`;
}

/**
 * Aba de Formação e Atuação: exibe `education`, `experience` e `foment`
 * vindos de `/v2/researcher/{id}?include=education,experience,foment`.
 */
export function TrajectoryTab({ researcher }: TrajectoryTabProps) {
  const education = researcher.education ?? [];
  const experience = researcher.experience ?? [];
  const foment = researcher.foment ?? [];

  if (
    education.length === 0 &&
    experience.length === 0 &&
    foment.length === 0
  ) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Sem dados de trajetória disponíveis"
        description="Não há registros de formação acadêmica, atuação profissional ou fomento para este pesquisador."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {education.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title={
              <span className="inline-flex items-center gap-2">
                <span>Formação acadêmica</span>
                <Tag variant="neutral" className="tabular-nums">
                  {education.length}
                </Tag>
              </span>
            }
            icon={GraduationCap}
          />
          <div className="flex flex-col gap-3">
            {education.map((item, idx) => {
              const span = formatYearSpan(item.start_year, item.end_year);
              const degree = formatDegreeLabel(item.degree);
              const status = formatEducationStatus(item.status);
              const stColor = item.status ? statusColor(item.status) : null;
              return (
                <Card
                  key={`${item.degree}-${item.course ?? ''}-${idx}`}
                  className="gap-2 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {degree ?? item.degree}
                      {item.course ? ` em ${item.course}` : ''}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {span && <Tag variant="outline">{span}</Tag>}
                      {status && stColor && (
                        <Badge size="sm" className={stColor.bg}>
                          {status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {item.institution && (
                    <p className="text-sm text-muted-foreground">
                      {item.institution}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {experience.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title={
              <span className="inline-flex items-center gap-2">
                <span>Atuação profissional</span>
                <Tag variant="neutral" className="tabular-nums">
                  {experience.length}
                </Tag>
              </span>
            }
            icon={Briefcase}
          />
          <div className="flex flex-col gap-3">
            {experience.map((item, idx) => {
              const span = formatYearSpan(item.start_year, item.end_year);
              return (
                <Card key={`${item.organization}-${idx}`} className="gap-2 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {item.organization}
                    </span>
                    {span && <Tag variant="outline">{span}</Tag>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.employment_type && (
                      <Tag variant="neutral">{item.employment_type}</Tag>
                    )}
                    {item.functional_classification && (
                      <Tag variant="neutral">
                        {item.functional_classification}
                      </Tag>
                    )}
                    {item.workload_hours_weekly != null && (
                      <Tag variant="neutral">
                        {item.workload_hours_weekly}h semanais
                      </Tag>
                    )}
                    {item.exclusive_dedication && (
                      <Tag variant="neutral">Dedicação exclusiva</Tag>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {foment.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader
            title={
              <span className="inline-flex items-center gap-2">
                <span>Fomento e auxílios (Lattes)</span>
                <Tag variant="neutral" className="tabular-nums">
                  {foment.length}
                </Tag>
              </span>
            }
            icon={Award}
          />
          <div className="flex flex-col gap-3">
            {foment.map((item, idx) => {
              const color = scholarshipColor(
                item.modality ?? item.funding_program,
              );
              const title = [item.modality, item.category_level]
                .filter(Boolean)
                .join(' – ');
              return (
                <Card
                  key={`${item.modality_code ?? ''}-${item.call_title ?? ''}-${idx}`}
                  className="gap-2 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Dot className={color.bg} />
                      <span>{title || item.funding_program || 'Fomento'}</span>
                    </span>
                    {item.institute && (
                      <Tag variant="outline">{item.institute}</Tag>
                    )}
                  </div>
                  {item.call_title && (
                    <p className="text-sm text-muted-foreground">
                      {item.call_title}
                    </p>
                  )}
                  {item.funding_program && title && (
                    <p className="text-xs text-muted-foreground">
                      {item.funding_program}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
