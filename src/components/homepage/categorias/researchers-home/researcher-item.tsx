import { useContext, useState, useEffect } from 'react';
import { Alert } from '../../../ui/alert';
import { UserContext } from '../../../../context/context';
import { MapPin, Plus, X } from 'phosphor-react';
import { Building2, GraduationCap } from 'lucide-react';
import { useModal } from '../../../hooks/use-modal-store';
import { Button } from '../../../ui/button';

import dt from '../../../../assets/dt.png';
import pq from '../../../../assets/pq.png';
import { CardTitle } from '../../../ui/card';
import { InfiniteMovingCards } from '../../../ui/infinite-moving-cards';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../ui/tooltip';

type Research = {
  among: number;
  articles: number;
  book: number;
  book_chapters: number;
  id: string;
  name: string;
  university: string;
  lattes_id: string;
  area: string;
  lattes_10_id: string;
  city: string;
  graduation: string;
  patent: string;
  speaker: string;
  status: boolean;
  h_index: string;
  relevance_score: string;
  works_count: string;
  cited_by_count: string;
  i10_index: string;
  scopus: string;
  openalex: string;
  departament?: string;
  departments: string;
  subsidy: Bolsistas[];
  graduate_programs: GraduatePrograms[];
};

interface Bolsistas {
  aid_quantity: string;
  call_title: string;
  funding_program_name: string;
  modality_code: string;
  category_level_code: string;
  institute_name: string;
  modality_name: string;
  scholarship_quantity: string;
}

interface GraduatePrograms {
  graduate_program_id: string;
  name: string;
}

const fallbackSiglas: Record<string, string> = {
  'Universidade Estadual Do Sudoeste Da Bahia': 'UESB',
  'Universidade Federal Do Sul Da Bahia': 'UFSB',
  'Universidade Federal Do Recôncavo Da Bahia': 'UFRB',
  'Universidade Do Estado Da Bahia': 'UNEB',
  'Fundação Oswaldo Cruz': 'FIOCRUZ',
  'Universidade Estadual De Feira De Santana': 'UEFS',
  'Escola Bahiana De Medicina E Saúde Pública': 'EBMSP',
  'Universidade Federal Do Oeste Da Bahia': 'UFOB',
  'Universidade Federal da Bahia': 'UFBA',
  'Instituto Federal De Educação, Ciência E Tecnologia Da Bahia': 'IFBA',
  'Universidade Estadual De Santa Cruz': 'UESC',
  'Universidade Externa a Plataforma': '---',
  'Centro Universitário Senai Cimatec': 'CIMATEC',
};

const fallbackSiglasLower: Record<string, string> = Object.fromEntries(
  Object.entries(fallbackSiglas).map(([nome, sigla]) => [
    nome.toLowerCase(),
    sigla,
  ]),
);

// Cache global: garante que o fetch seja feito apenas UMA vez por sessão
let institutionPromise: Promise<Record<string, string>> | null = null;

function getInstitutionMap(urlGeral: string): Promise<Record<string, string>> {
  if (!institutionPromise) {
    institutionPromise = fetch(`${urlGeral}institution`, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600',
        'Content-Type': 'text/plain',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Falha na resposta do servidor');
        return res.json();
      })
      .then((data) => {
        const map: Record<string, string> = {};
        data.forEach((inst: any) => {
          if (inst.name && inst.acronym) {
            map[inst.name.toLowerCase().trim()] = inst.acronym;
          }
        });
        return map;
      })
      .catch((err) => {
        institutionPromise = null;
        return {};
      });
  }
  return institutionPromise;
}

function useUniversitySigla(urlGeral: string, university: string) {
  const [sigla, setSigla] = useState<string>('');

  useEffect(() => {
    if (!university) {
      setSigla('');
      return;
    }

    getInstitutionMap(urlGeral).then((apiMap) => {
      const universitiesArray = university.split(/;/);

      const siglas = universitiesArray.map((uni) => {
        const nomeLimpo = uni.trim();
        const nomeLower = nomeLimpo.toLowerCase();
        if (!nomeLimpo) return '';

        if (apiMap[nomeLower]) {
          return apiMap[nomeLower];
        }

        if (fallbackSiglasLower[nomeLower]) {
          return fallbackSiglasLower[nomeLower];
        }

        return '';
      });

      setSigla(siglas.filter(Boolean).join(' / '));
    });
  }, [urlGeral, university]);

  return sigla;
}

export function ResearchItem(props: Research) {
  const { onOpen } = useModal();
  const {
    urlGeral,
    setPesquisadoresSelecionados,
    permission,
    pesquisadoresSelecionados,
  } = useContext(UserContext);

  const universitySigla = useUniversitySigla(urlGeral, props.university);

  const hasBaremaAvaliacao = permission.some(
    (perm) => perm.permission === 'criar_barema_avaliacao',
  );

  return (
    <div
      onClick={() => onOpen('researcher-modal', { name: props.name })}
      className="flex group min-h-[300px] w-full cursor-pointer"
    >
      <Alert
        className="flex p-0 flex-col flex-1 gap-4 bg-cover bg-no-repeat bg-center"
        style={{
          backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${props.id}) `,
        }}
      >
        <div className="bg-[#000000] rounded-md bg-opacity-30 hover:bg-opacity-70 transition-all absolute w-full h-full rounded-t-md ">
          <div className="flex flex-col justify-between h-full">
            <div className="z-[1] w-full  p-4 flex gap-3 justify-end">
              <div className="mr-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={(event) => {
                          event.stopPropagation(); // Impede a propagação do evento de clique para o contêiner pai

                          if (
                            pesquisadoresSelecionados.some(
                              (pesquisador) => pesquisador.name === props.name,
                            )
                          ) {
                            setPesquisadoresSelecionados((prev) =>
                              prev.filter(
                                (pesquisador) =>
                                  pesquisador.name !== props.name,
                              ),
                            );
                          } else {
                            setPesquisadoresSelecionados((prev) => [
                              ...prev,
                              {
                                id: props.id,
                                name: props.name,
                                university: props.university,
                                lattes_id: props.lattes_id,
                                city: props.city,
                                area: props.area,
                                graduation: props.graduation,
                              },
                            ]);
                          }
                        }}
                        size={'icon'}
                        className={`hidden group-hover:flex transition-all h-8 w-8 ${pesquisadoresSelecionados.some((pesquisador) => pesquisador.name === props.name) && 'bg-red-500 hover:bg-red-600 text-white'}`}
                      >
                        {pesquisadoresSelecionados.some(
                          (pesquisador) => pesquisador.name === props.name,
                        ) ? (
                          <X size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {' '}
                      {pesquisadoresSelecionados.some(
                        (pesquisador) => pesquisador.name === props.name,
                      )
                        ? 'Remover pesquisador(a) do barema'
                        : 'Adicionar pesquisador(a) ao barema'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <div className="flex group-hover:hidden">
                  <div className="flex text-white gap-2 items-center">
                    <div
                      className={` rounded-md h-4 w-4 ${props.status ? 'bg-green-500' : 'bg-red-500'}`}
                    ></div>
                    <div className="flex-1 flex">
                      {props.status ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>
              </div>

              {props.subsidy &&
                props.subsidy.length != 0 &&
                props.subsidy
                  .slice(0, 1)
                  .map((item) => (
                    <img
                      src={item.modality_code == 'DT' ? dt : pq}
                      className="w-8 relative -top-4"
                      alt=""
                    />
                  ))}
            </div>

            <div className="flex gap-2 px-6 flex-col pb-6  w-full h-full text-white justify-end  ">
              <div className="flex gap-1 flex-col">
                <CardTitle className="text-lg font-medium">
                  {props.name}
                </CardTitle>

                {universitySigla && (
                  <div className="flex gap-1 text-sm items-center mt-1 text-gray-200">
                    <Building2 size={14} className="min-w-[14px]" />
                    <span>{universitySigla}</span>
                  </div>
                )}
                <div className="group-hover:flex hidden items-center flex-wrap gap-1  mb-2">
                  <div className="flex gap-1 text-sm  items-center ">
                    <GraduationCap size={12} />
                    {props.graduation}
                  </div>

                  {props.city != '' && props.city != 'None' && (
                    <div className="flex gap-1 text-sm  items-center">
                      <MapPin size={12} />
                      {props.city}
                    </div>
                  )}
                </div>
              </div>

              {props.area && props.area.length !== 0 && (
                <div className="flex gap-3 flex-wrap">
                  {props.area !== '' && (
                    <InfiniteMovingCards
                      items={[
                        ...new Set(
                          props.area.split(';').map((item) => item.trim()),
                        ),
                      ]
                        .filter((item) => item !== '')
                        .map((item) => ({ value: item }))}
                      direction="right"
                      speed="fast"
                      pauseOnHover={true}
                      className="custom-class"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Alert>
    </div>
  );
}
