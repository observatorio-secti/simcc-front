import { Building2, GraduationCap } from 'lucide-react';
import { useModal } from '../../../hooks/use-modal-store';
import { Alert } from '../../../ui/alert';
import { CardTitle } from '../../../ui/card';
import { resolveApiUrl } from '../../../../services/researchers-v2';
import {
  ResearcherCountsV2,
  ResearcherV2,
} from '../../../../types/researcher-v2';
import { formatSourceType } from './facets/facet-registry';

const COUNT_LABELS: { key: keyof ResearcherCountsV2; label: string }[] = [
  { key: 'articles', label: 'Artigos' },
  { key: 'books', label: 'Livros' },
  { key: 'book_chapters', label: 'Capítulos' },
  { key: 'patents', label: 'Patentes' },
  { key: 'software', label: 'Softwares' },
  { key: 'brands', label: 'Marcas' },
];

// Mesmas cores usadas pelos tipos de busca equivalentes na barra de pesquisa.
const SOURCE_TYPE_COLORS: Record<string, string> = {
  ARTICLE: 'bg-blue-500',
  BOOK: 'bg-pink-500',
  BOOK_CHAPTER: 'bg-pink-500',
  PATENT: 'bg-cyan-500',
  ABSTRACT: 'bg-yellow-500',
  EVENT: 'bg-orange-500',
};

interface ProfileResearcherCardProps {
  researcher: ResearcherV2;
}

// Segue a estrutura do card da busca antiga (ResearchItem): foto como fundo,
// nome e instituição em destaque e o restante só no hover.
export function ProfileResearcherCard({
  researcher,
}: ProfileResearcherCardProps) {
  const { onOpen } = useModal();

  const institutions = researcher.affiliations.map(
    (affiliation) => affiliation.institution,
  );
  const matches = researcher.matches;
  const counts = COUNT_LABELS.filter(({ key }) => researcher.counts[key] > 0);

  return (
    <div
      onClick={() => onOpen('researcher-modal', { name: researcher.name })}
      className="flex group min-h-[360px] w-full cursor-pointer"
    >
      <Alert
        className="flex p-0 flex-col flex-1 gap-4 bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: `url(${resolveApiUrl(researcher.image)})`,
        }}
      >
        <div className="bg-[#000000] rounded-md bg-opacity-30 hover:bg-opacity-70 transition-all absolute w-full h-full rounded-t-md">
          <div className="flex flex-col justify-between h-full">
            <div className="z-[1] w-full p-4 flex gap-3 justify-between items-start">
              {researcher.classification && (
                <span className="rounded-md bg-white/20 backdrop-blur px-2 py-0.5 text-xs font-semibold text-white">
                  {researcher.classification}
                </span>
              )}

              {matches && matches.total > 0 && (
                <span className="ml-auto rounded-md bg-indigo-500 px-2 py-0.5 text-xs font-medium text-white">
                  {matches.total.toLocaleString('pt-BR')}{' '}
                  {matches.total === 1 ? 'evidência' : 'evidências'}
                </span>
              )}
            </div>

            <div className="flex gap-2 px-6 flex-col pb-6 w-full h-full text-white justify-end">
              {/* Estado normal: só nome e instituição. */}
              <div className="group-hover:hidden flex gap-1 flex-col">
                <CardTitle className="text-lg font-medium">
                  {researcher.name}
                </CardTitle>

                {institutions.length > 0 && (
                  <div className="flex gap-1 text-sm items-center mt-1 text-gray-200">
                    <Building2 size={14} className="min-w-[14px]" />
                    <span>
                      {institutions
                        .map(
                          (institution) =>
                            institution.acronym || institution.name,
                        )
                        .join(' / ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover: o nome sai e entram os detalhes do perfil. */}
              <div className="group-hover:flex hidden flex-col gap-3 text-sm">
                {institutions.length > 0 && (
                  <div className="flex gap-1 items-start">
                    <Building2 size={14} className="min-w-[14px] mt-0.5" />
                    <span>
                      {institutions
                        .map((institution) => institution.name)
                        .join(' / ')}
                    </span>
                  </div>
                )}

                {(researcher.graduation || researcher.classification) && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 items-center">
                    {researcher.graduation && (
                      <span className="flex gap-1 items-center">
                        <GraduationCap size={14} />
                        {researcher.graduation}
                      </span>
                    )}
                    {researcher.classification && (
                      <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold">
                        Classificação {researcher.classification}
                      </span>
                    )}
                  </div>
                )}

                {counts.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {counts.map(({ key, label }) => (
                      <span
                        key={key}
                        className="rounded-md bg-white/20 px-2 py-0.5 text-xs"
                      >
                        <span className="font-semibold">
                          {researcher.counts[key].toLocaleString('pt-BR')}
                        </span>{' '}
                        {label}
                      </span>
                    ))}
                  </div>
                )}

                {matches && matches.total > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-gray-200">Evidências na busca</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(matches.by_type).map(([type, total]) => (
                        <span
                          key={type}
                          className={`rounded-md px-2 py-0.5 text-xs text-white ${SOURCE_TYPE_COLORS[type] ?? 'bg-blue-700'}`}
                        >
                          {formatSourceType(type)} · {total}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
}
