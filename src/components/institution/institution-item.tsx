import { GraduationCapIcon, Landmark, User, Users } from 'lucide-react';

import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useModal } from '../hooks/use-modal-store';
import { useContext, useMemo } from 'react';
import { UserContext } from '../../context/context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { useInstitutionResearchers } from './hooks/use-institution-queries';

interface GraduateProgram {
  id: string;
  avatar?: string;
  image?: string | null;
  cover?: string | null;
  name: string;
  count_r: string;
  count_gp: string;
  count_gpr: string;
  count_gps: string;
  count_d: string;
  count_t: string;
  researchers: string[];
  acronym: string;
  url: string;
}

// Lista de áreas com cores associadas
export const areasComCores: [string, string][] = [
  // Ciências Exatas e da Terra
  ['MATEMÁTICA / PROBABILIDADE E ESTATÍSTICA', 'bg-red-200'],
  ['ASTRONOMIA / FÍSICA', 'bg-red-300'],
  ['QUÍMICA', 'bg-red-400'],
  ['GEOCIÊNCIAS', 'bg-red-500'],
  ['CIÊNCIA DA COMPUTAÇÃO', 'bg-red-600'],

  // Ciências Biológicas
  ['BIODIVERSIDADE', 'bg-green-200'],
  ['CIÊNCIAS BIOLÓGICAS I', 'bg-green-300'],
  ['CIÊNCIAS BIOLÓGICAS II', 'bg-green-400'],
  ['CIÊNCIAS BIOLÓGICAS III', 'bg-green-500'],

  // Engenharias
  ['ENGENHARIA I', 'bg-blue-200'],
  ['ENGENHARIA II', 'bg-blue-300'],
  ['ENGENHARIA III', 'bg-blue-400'],
  ['ENGENHARIA IV', 'bg-blue-500'],

  // Ciências da Saúde
  ['MEDICINA I', 'bg-yellow-200'],
  ['MEDICINA II', 'bg-yellow-300'],
  ['MEDICINA III', 'bg-yellow-400'],
  ['NUTRIÇÃO', 'bg-yellow-500'],
  ['ODONTOLOGIA', 'bg-yellow-600'],
  ['FARMÁCIA', 'bg-yellow-700'],
  ['ENFERMAGEM', 'bg-yellow-800'],
  ['SAÚDE COLETIVA', 'bg-yellow-900'],
  ['EDUCAÇÃO FÍSICA', 'bg-yellow-950'],
  ['FISIOTERAPIA, FONOAUDIOLOGIA E TERAPIA OCUPACIONAL', 'bg-orange-200'],
  [
    'EDUCAÇÃO FÍSICA, FISIOTERAPIA, FONOAUDIOLOGIA E TERAPIA OCUPACIONAL',
    'bg-yellow-950',
  ],
  // Ciências Agrárias
  ['CIÊNCIAS AGRÁRIAS I', 'bg-green-600'],
  ['ZOOTECNIA / RECURSOS PESQUEIROS', 'bg-green-700'],
  ['MEDICINA VETERINÁRIA', 'bg-green-800'],
  ['CIÊNCIA DE ALIMENTOS', 'bg-green-900'],

  // Ciências Sociais Aplicadas
  ['DIREITO', 'bg-purple-200'],
  [
    'ADMINISTRAÇÃO PÚBLICA E DE EMPRESAS, CIÊNCIAS CONTÁBEIS E TURISMO',
    'bg-purple-300',
  ],
  ['ECONOMIA', 'bg-purple-400'],
  ['ARQUITETURA, URBANISMO E DESIGN', 'bg-purple-500'],
  ['PLANEJAMENTO URBANO E REGIONAL / DEMOGRAFIA', 'bg-purple-600'],
  ['COMUNICAÇÃO, INFORMAÇÃO E MUSEOLOGIA', 'bg-purple-700'],
  ['SERVIÇO SOCIAL', 'bg-purple-800'],

  // Ciências Humanas
  ['FILOSOFIA', 'bg-pink-200'],
  ['CIÊNCIAS DA RELIGIÃO E TEOLOGIA', 'bg-pink-300'],
  ['SOCIOLOGIA', 'bg-pink-400'],
  ['ANTROPOLOGIA / ARQUEOLOGIA', 'bg-pink-500'],
  ['HISTÓRIA', 'bg-pink-600'],
  ['GEOGRAFIA', 'bg-pink-700'],
  ['PSICOLOGIA', 'bg-pink-800'],
  ['EDUCAÇÃO', 'bg-pink-900'],
  ['CIÊNCIA POLÍTICA E RELAÇÕES INTERNACIONAIS', 'bg-pink-950'],

  // Linguística, Letras e Artes
  ['LETRAS / LINGUÍSTICA', 'bg-orange-400'],
  ['ARTES / MÚSICA', 'bg-orange-500'],

  // Multidisciplinar
  ['INTERDISCIPLINAR', 'bg-teal-200'],
  ['ENSINO', 'bg-teal-300'],
  ['MATERIAIS', 'bg-teal-400'],
  ['BIOTECNOLOGIA', 'bg-teal-500'],
  ['CIÊNCIAS AMBIENTAIS', 'bg-teal-600'],
  ['CIÊNCIAS E HUMANIDADES PARA A EDUCAÇÃO BÁSICA', 'bg-teal-700'],
];

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export function InstitutionItem(props: GraduateProgram) {
  const normalizeArea = (area: string): string =>
    area
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^A-Z0-9 ]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um único espaço
      .trim();

  // Criamos o Map normalizando as chaves antes
  const qualisColor = new Map(
    areasComCores.map(([area, color]) => [normalizeArea(area), color]),
  );

  const getColorByArea = (area: string): string =>
    qualisColor.get(normalizeArea(area)) || 'bg-gray-500';

  const queryUrl = useQuery();
  const navigate = useNavigate();

  // Calcula a diferença em dias entre a data atual e a data do item

  const handlePesquisaFinal = () => {
    const targetIdentifier = props.acronym?.trim() || props.id;
    navigate(`/instituicao/${encodeURIComponent(targetIdentifier)}`);
  };

  const { onOpen } = useModal();
  const { urlGeral } = useContext(UserContext);

  const buildAssetUrl = (path?: string | null) => {
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    const base = (urlGeral || '').replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const rawLogo = (props as any).image ?? props.avatar ?? null;
  const rawCover = (props as any).cover ?? null;
  const logoUrl = buildAssetUrl(rawLogo);
  const coverUrl = buildAssetUrl(rawCover);

  // Cada card faz 1 request para buscar fotos reais dos docentes dessa instituição específica
  const { data: docentesData = [] } = useInstitutionResearchers(props.id);
  const normalizeName = (str: string) =>
    (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  // props.researchers são lattes_id (16 dígitos), não nomes - mapeia por lattes_id/id/lattes_10_id/nome
  const enrichedResearchers = useMemo(() => {
    const mapById = new Map<string, any>();
    const mapByLattesId = new Map<string, any>();
    const mapByLattes10 = new Map<string, any>();
    const mapByName = new Map<string, any>();
    (docentesData as any[]).forEach((d: any) => {
      if (d?.id) mapById.set(String(d.id), d);
      if (d?.lattes_id) mapByLattesId.set(String(d.lattes_id), d);
      if (d?.lattes_10_id) mapByLattes10.set(String(d.lattes_10_id), d);
      if (d?.name) mapByName.set(normalizeName(d.name), d);
    });
    return props.researchers.map((raw) => {
      const str = String(raw).trim();
      const found = mapByLattesId.get(str) || mapById.get(str) || mapByLattes10.get(str) || mapByName.get(normalizeName(str)) || null;
      const displayName = found?.name || str;
      return { raw, name: displayName, data: found };
    });
  }, [docentesData, props.researchers]);

  const getResearcherImageUrl = (item: { raw: string; name: string; data: any | null }) => {
    const img = item.data?.image;
    if (img && typeof img === 'string' && img.trim() !== '') {
      if (img.startsWith('data:') || /^https?:\/\//.test(img)) return img;
      if (img.length > 100 && !img.includes('/')) return `data:image/jpeg;base64,${img}`;
    }
    // Se encontrou o docente, usa o nome real (endpoint ?name=) que retorna 200; senão tenta researcher_id com UUID
    if (item.data?.name) {
      return `${urlGeral}ResearcherData/Image?name=${encodeURIComponent(item.data.name)}`;
    }
    if (item.data?.id) {
      return `${urlGeral}ResearcherData/Image?researcher_id=${encodeURIComponent(String(item.data.id))}`;
    }
    // Fallback: raw é lattes_id numérico - tenta por nome (vai 404) mas evita 422 de researcher_id numérico
    return `${urlGeral}ResearcherData/Image?name=${encodeURIComponent(item.name)}`;
  };

  return (
    <div
      onClick={() => handlePesquisaFinal()}
      className="flex w-full cursor-pointer group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      key={props.id}
    >
      <Alert
        className="flex flex-col items-center bg-no-repeat bg-center bg-cover"
        style={{
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
        }}
      >
        <Avatar
          style={{ backgroundColor: 'white' }}
          className="cursor-pointer z-[1] top-12 rounded-md relative border dark:border-neutral-800 h-20 w-20 flex-shrink-0 bg-white dark:bg-white"
        >
          <AvatarImage
            style={{ backgroundColor: 'white' }}
            className="rounded-md object-contain bg-white dark:bg-white p-1"
            src={logoUrl || undefined}
          />
          <AvatarFallback
            style={{ backgroundColor: 'white' }}
            className="flex items-center justify-center bg-white dark:bg-white"
          >
            <Landmark size={16} />
          </AvatarFallback>
        </Avatar>

        <Alert className="flex flex-col items-center pt-16 whitespace-normal">
          <div className="flex gap-3">
            {/* <<<<<< ESTE PAI PRECISA PODER ENCOLHER >>>>>> */}
            <div className="items-center flex flex-col w-full min-w-0">
              {/* largura do bloco do título */}
              <div className="font-semibold text-lg w-full text-center">
                {/* texto com ellipsis */}
                {props.name} ({props.acronym})
              </div>

              <TooltipProvider>
                <div className="flex gap-2 flex-wrap mt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-gray-500 text-sm flex gap-1 items-center">
                        <Users size={12} className="flex-shrink-0" />
                        <span className="truncate">{props.count_r}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Docentes</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-gray-500 text-sm flex gap-1 items-center">
                        <GraduationCapIcon size={12} className="flex-shrink-0" />
                        <span className="truncate">{props.count_gp}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Pós-graduações</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="text-gray-500 text-sm flex gap-1 items-center">
                        <Users size={12} className="flex-shrink-0" />
                        <span className="truncate">{props.count_gps}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Grupos de pesquisa</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>

          {enrichedResearchers.length > 0 && (
            <div className="flex  items-center mt-8">
              <div className="flex items-center">
                {enrichedResearchers.slice(0, 5).map((item, index) => (
                  <Avatar
                    key={item.raw}
                    onClick={(event) => {
                      event.stopPropagation();
                      // Usa nome real quando encontrado, senão o raw (id) - modal resolve por nome
                      onOpen('researcher-modal', { name: item.name });
                    }}
                    className="cursor-pointer rounded-full relative border dark:border-neutral-800 h-8 w-8 hover:z-10 transition-transform hover:scale-110"
                    style={{ marginLeft: index > 0 ? '-10px' : '0px' }}
                  >
                    <AvatarImage
                      className="rounded-md h-8 w-8 object-cover"
                      src={getResearcherImageUrl(item)}
                    />
                    <AvatarFallback className="flex items-center justify-center">
                      <User size={16} />
                    </AvatarFallback>
                  </Avatar>
                ))}

                {enrichedResearchers.length > 5 && (
                  <div
                    onClick={(event) => {
                      event.stopPropagation();
                      const targetIdentifier = props.acronym?.trim() || props.id;
                      navigate(
                        `/instituicao/${encodeURIComponent(targetIdentifier)}?pagina=docentes&institution_id=${encodeURIComponent(props.id)}`,
                      );
                    }}
                    className="h-8 w-8 flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-neutral-800 rounded-full border dark:border-neutral-700 text-xs font-medium cursor-pointer hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                    style={{ marginLeft: '-10px' }}
                    title={`Ver todos os ${enrichedResearchers.length} docentes - clique para abrir página de docentes`}
                  >
                    +{enrichedResearchers.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}
        </Alert>
      </Alert>
    </div>
  );
}
