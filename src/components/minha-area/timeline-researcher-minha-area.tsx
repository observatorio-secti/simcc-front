import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { Alert } from '../ui/alert';
import { CalendarBlank, PuzzlePiece } from 'phosphor-react';
import { MapPin } from 'lucide-react';

import dt from '../../assets/dt.png';
import pq from '../../assets/pq.png';

type Dados = {
  count_article: number;
  count_book: number;
  count_book_chapter: number;
  count_guidance: number;
  count_patent: number;
  count_report: number;
  count_software: number;
  count_guidance_complete: number;
  count_guidance_in_progress: number;
  count_patent_granted: number;
  count_patent_not_granted: number;
  count_brand: number;
  graduantion: string;
  year: number;

  A1: number;
  A2: number;
  A3: number;
  A4: number;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
  C: number;
  SQ: number;
};

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
  abstract: string;
  city: string;
  orcid: string;
  image: string;
  graduation: string;
  patent: string;
  software: string;
  brand: string;
  lattes_update: Date;
  entradanaufmg: Date;

  h_index: string;
  relevance_score: string;
  works_count: string;
  cited_by_count: string;
  i10_index: string;
  scopus: string;
  openalex: string;

  subsidy: Bolsistas[];
  graduate_programs: GraduatePrograms[];
  departments: Departments[];
  research_groups: ResearchGroups[];

  cargo: string;
  clas: string;
  classe: string;
  rt: string;
  situacao: string;

  year_filter: string;
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

interface Departments {
  dep_des: string;
  dep_email: string;
  dep_nom: string;
  dep_id: string;
  dep_sigla: string;
  dep_site: string;
  dep_tel: string;
  img_data: string;
}

interface ResearchGroups {
  area: string;
  group_id: string;
  name: string;
}

export function TimeLineResearcherMinhaArea(props: Research) {
  const [loading, isLoading] = useState(false);

  const [dados, setDados] = useState<Dados[]>([]);

  const { urlGeral } = useContext(UserContext);

  const urlDados = `${urlGeral}researcher/DadosGerais?researcher_id=${props.id}&year=${props.year_filter}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        isLoading(true);
        const response = await fetch(urlDados, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });
        const data = await response.json();
        if (data) {
          setDados(data);
          isLoading(false);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlDados]);

  console.log(urlDados);

  const filteredDados = dados
    .filter((item) =>
      Object.entries(item).some(
        ([key, value]) => key !== 'year' && value !== 0 && value !== '',
      ),
    )
    .sort((a, b) => b.year - a.year); // Sort in descending order by year

  console.log(filteredDados);
  return (
    <div className="w-full">
      <div className="">
        <ScrollArea className="relative pb-4 whitespace-nowrap p-8 pt-0 ">
          <div className=" flex flex-col  justify-center">
            <div className={`flex gap-2   rounded-md `}>
              <div className="flex items-center gap-3 h-fit">
                <p
                  className={`text-sm min-w-[63.5px] w-[63.5px]  font-medium h-8 items-center flex p-4   `}
                ></p>
              </div>

              <div className="flex flex-col justify-center items-center">
                <div
                  className="rounded-md w-8 h-8 bg-cover bg-center bg-no-repeat group-hover:rounded-l-lg group-hover:rounded-r-none whitespace-nowrap"
                  style={{
                    backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${props.id})`,
                  }}
                ></div>
                <div className="h-full border-l flex flex-1 dark:border-l-neutral-400 border-neutral-400"></div>
              </div>

              <div className={`flex p-4 pt-0 flex-1   flex-col  gap-3 z-[1]  `}>
                <div>
                  <div className="font-medium text-xl flex items-center gap-3 ">
                    {props.name}
                  </div>

                  <div className="flex flex-wrap flex-1 items-center gap-3 mt-2">
                    {props.area != null &&
                      props.area.split(';').map((value, index) => (
                        <li
                          key={index}
                          className={`py-2 whitespace-nowrap px-4 rounded-md text-xs font-bold flex gap-2 text-white items-center ${value.includes('CIENCIAS AGRARIAS') ? 'bg-red-400' : value.includes('CIENCIAS EXATAS E DA TERRA') ? 'bg-green-400' : value.includes('CIENCIAS DA SAUDE') ? 'bg-[#20BDBE]' : value.includes('CIENCIAS HUMANAS') ? 'bg-[#F5831F]' : value.includes('CIENCIAS BIOLOGICAS') ? 'bg-[#EB008B]' : value.includes('ENGENHARIAS') ? 'bg-[#FCB712]' : value.includes('CIENCIAS SOCIAIS APLICADAS') ? 'bg-[#009245]' : value.includes('LINGUISTICA LETRAS E ARTES') ? 'bg-[#A67C52]' : value.includes('OUTROS') ? 'bg-[#1B1464]' : 'bg-[#000]'}
                                  `}
                        >
                          <PuzzlePiece size={12} className="text-white" />{' '}
                          {value.trim()}
                        </li>
                      ))}

                    {props.city != 'None' && (
                      <div className="bg-blue-700 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center">
                        <MapPin size={12} className="textwhite" /> {props.city}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {filteredDados.map((item, index) => (
              <div
                className={`flex gap-2   rounded-md ${index % 2 != 0 ? '' : 'bg-neutral-100  dark:bg-neutral-800 '}`}
              >
                <div className="flex items-center gap-3 h-fit">
                  <p
                    className={`text-sm  font-medium h-8 items-center flex p-4 pt-8  ${index == 0 ? '' : ''}`}
                  >
                    {item.year}
                  </p>
                </div>
                <div className="flex flex-col justify-center items-center">
                  <div className="h-4 border-l dark:border-l-neutral-400 border-neutral-400"></div>
                  <div className="w-8 h-8 rounded-full border whitespace-nowrap dark:border-neutral-400 border-neutral-400 flex items-center justify-center">
                    <CalendarBlank size={16} />
                  </div>
                  <div
                    className={`h-full border-l flex flex-1 border-neutral-400  ${index % 2 == 0 ? 'border-neutral-400 dark:border-l-neutral-400' : 'dark:border-l-neutral-400'}`}
                  ></div>
                </div>

                <div
                  className={`flex w-full p-4   flex-col  gap-3 z-[1] pt-4  ${index == 0 ? '' : 'pt-4'}`}
                >
                  {(item.A1 != 0 ||
                    '' ||
                    item.A2 != 0 ||
                    '' ||
                    item.A3 != 0 ||
                    '' ||
                    item.A4 != 0 ||
                    '' ||
                    item.B1 != 0 ||
                    '' ||
                    item.B2 != 0 ||
                    '' ||
                    item.B3 != 0 ||
                    '' ||
                    item.B4 != 0 ||
                    '' ||
                    item.C != 0 ||
                    '' ||
                    item.count_book != 0 ||
                    '' ||
                    item.count_book_chapter != 0 ||
                    '') && (
                    <div className="font-medium text-xl">
                      Produção bibliográfica
                    </div>
                  )}

                  {item.A1 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#34663C] `}
                      ></div>
                      <Alert className="rounded-l-none p-2  flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.A1} </strong>{' '}
                          {item.A1 == 1 ? 'artigo' : 'artigos'} A1
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.A2 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#9DC356] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.A2} </strong>{' '}
                          {item.A2 == 1 ? 'artigo' : 'artigos'} A2
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.A3 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#B1C38A] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.A3} </strong>{' '}
                          {item.A3 == 1 ? 'artigo' : 'artigos'} A3
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.A4 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#BEC4B3] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.A4} </strong>{' '}
                          {item.A4 == 1 ? 'artigo' : 'artigos'} A4
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.B1 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#D56438] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.B1} </strong>{' '}
                          {item.B1 == 1 ? 'artigo' : 'artigos'} B1
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.B2 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#DD883D] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.B2} </strong>{' '}
                          {item.B2 == 1 ? 'artigo' : 'artigos'} B2
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.B3 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#E3B081] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.B3} </strong>{' '}
                          {item.B3 == 1 ? 'artigo' : 'artigos'} B3
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.B4 > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#E3AC96] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.B4} </strong>{' '}
                          {item.B4 == 1 ? 'artigo' : 'artigos'} B4
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.C > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#CE3830] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.C} </strong>{' '}
                          {item.C == 1 ? 'artigo' : 'artigos'} C
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.SQ > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#4A1314] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.SQ} </strong>{' '}
                          {item.SQ == 1 ? 'artigo' : 'artigos'} sem qualis
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.count_book > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#792F4C] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.count_book} </strong>{' '}
                          {item.count_book == 1 ? 'livro' : 'livros'}
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.count_book_chapter > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#DBAFD0] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.count_book_chapter} </strong>{' '}
                          {item.count_book == 1
                            ? 'capítulo de livro'
                            : 'capítulos de livro'}
                        </p>
                      </Alert>
                    </div>
                  )}

                  {(item.count_brand != 0 ||
                    '' ||
                    item.count_patent != 0 ||
                    '' ||
                    item.count_software != 0 ||
                    '') && (
                    <div className="font-medium text-xl ">Produção técnica</div>
                  )}
                  {item.count_brand > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#1B1464] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.count_brand} </strong>{' '}
                          {item.count_brand == 1 ? 'marca' : 'marcas'}
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.count_patent > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#66B4D0] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.count_patent} </strong>{' '}
                          {item.count_patent == 1 ? 'patente' : 'patentes'}
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.count_software > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#096670] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.count_software} </strong>{' '}
                          {item.count_software == 1 ? 'software' : 'softwares'}
                        </p>
                      </Alert>
                    </div>
                  )}

                  {item.count_guidance > 0 && (
                    <div className="flex w-full group">
                      <div
                        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 bg-[#8BFBD3] `}
                      ></div>
                      <Alert className="rounded-l-none p-2 flex flex-col justify-between  ">
                        <p className="text-xs  text-gray-500 dark:text-gray-300 font-normal">
                          <strong>{item.count_guidance} </strong>{' '}
                          {item.count_guidance == 1
                            ? 'orientação'
                            : 'orientações'}
                        </p>
                      </Alert>
                    </div>
                  )}

                  {new Date(props.entradanaufmg).getFullYear().toString() ===
                    item.year.toString() && (
                    <div>
                      <div className="font-medium text-xl mb-2 pr-12">
                        Entrada na UFMG
                      </div>

                      <div className="flex">
                        <div
                          className={`w-2 min-w-[8px] min-h-[70px] flex flex-1 h-full rounded-l-lg bg-[#C80F2E] border border-r-0 border-neutral-200 dark:border-neutral-800 `}
                        ></div>

                        <Alert className="flex justify-center items-center  rounded-l-none gap-8 ">
                          <div className="flex flex-col flex-1 justify-center h-full">
                            <p className="text-sm font-medium">
                              {Array.isArray(props.entradanaufmg)
                                ? props.entradanaufmg.map((entry, index) => (
                                    <div key={index}>
                                      {typeof entry === 'string'
                                        ? entry
                                        : new Date(entry).toLocaleDateString()}
                                    </div>
                                  ))
                                : new Date(
                                    props.entradanaufmg,
                                  ).toLocaleDateString()}
                            </p>
                          </div>
                          <img
                            src={
                              'https://upload.wikimedia.org/wikipedia/commons/c/c3/Logo_UFMG.png'
                            }
                            className=" relative  h-[32px]"
                            alt=""
                          />
                        </Alert>
                      </div>
                    </div>
                  )}

                  {props.subsidy.length > 0 &&
                    props.subsidy.some((sub) =>
                      sub.call_title.includes(item.year.toString()),
                    ) &&
                    props.subsidy.slice(0, 1).map((item) => (
                      <div>
                        <div className="font-medium text-xl mb-2 pr-12">
                          Bolsa CNPq
                        </div>
                        <div className="flex">
                          <div
                            className={`w-2 min-w-[8px] min-h-[125px] flex flex-1 h-full rounded-l-lg ${item.modality_code == 'DT' ? 'bg-[#183EFF]' : 'bg-[#00D000]'} border border-r-0 border-neutral-200 dark:border-neutral-800 `}
                          ></div>

                          <Alert className="flex justify-center  rounded-l-none gap-8 ">
                            <div className="flex flex-col flex-1 justify-center h-full">
                              <p className="mb-2 font-medium whitespace-normal">
                                {item.modality_name} - Nível{' '}
                                {item.category_level_code}
                              </p>

                              <div className="text-xs text-gray-500 flex whitespace-normal items-center gap-2">
                                {item.call_title}
                              </div>
                            </div>

                            {props.subsidy.slice(0, 1).map((item) => (
                              <img
                                src={item.modality_code == 'PQ' ? pq : dt}
                                className="w-8 relative -top-4 h-[52px]"
                                alt=""
                              />
                            ))}
                          </Alert>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </div>
  );
}
