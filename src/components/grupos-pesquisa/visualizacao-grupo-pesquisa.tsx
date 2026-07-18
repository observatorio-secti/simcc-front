import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "../ui/button";
import { Building, ChevronLeft, Eye, Plus, Shapes, SquareArrowOutUpRight, UserIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

import { Rows, SquaresFour, Users } from "phosphor-react";
import { ResearchersBloco } from "../homepage/categorias/researchers-home/researchers-bloco";
import { Skeleton } from "../ui/skeleton";
import { TableReseracherhome } from "../homepage/categorias/researchers-home/table-reseracher-home";
import { Alert } from "../ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useModal } from "../hooks/use-modal-store";
import { Helmet } from "react-helmet";
import { ResearchItem } from "../homepage/categorias/researchers-home/researcher-item";

import { InfiniteMovingResearchers } from "../ui/infinite-moving-researcher";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

interface Patrimonio {
  area: string,
  institution: string,
  first_leader: string,
  first_leader_id: string,
  second_leader: string,
  second_leader_id: string,
  name: string,
  id: string
}

type Research = {
  among: number,
  articles: number,
  book: number,
  book_chapters: number,
  id: string,
  name: string,
  university: string,
  lattes_id: string,
  area: string,
  lattes_10_id: string,
  abstract: string,
  city: string,
  orcid: string,
  image: string
  graduation: string,
  patent: string,
  software: string,
  brand: string,
  lattes_update: Date,

  h_index: string,
  relevance_score: string,
  works_count: string,
  cited_by_count: string,
  i10_index: string,
  scopus: string,
  openalex: string,

  subsidy: Bolsistas[]
  graduate_programs: GraduatePrograms[]
  departments: Departments[]
  research_groups: ResearchGroups[]

  cargo: string
  clas: string
  classe: string
  rt: string
  situacao: string
}


interface Bolsistas {
  aid_quantity: string
  call_title: string
  funding_program_name: string
  modality_code: string
  category_level_code: string
  institute_name: string
  modality_name: string
  scholarship_quantity: string
}

interface GraduatePrograms {
  graduate_program_id: string
  name: string
}

interface Departments {
  dep_des: string
  dep_email: string
  dep_nom: string
  dep_id: string
  dep_sigla: string
  dep_site: string
  dep_tel: string
  img_data: string
}

interface ResearchGroups {
  area: string
  group_id: string
  name: string
}


interface LinhasPesquisa {
  area: string
  keywords: string
  line: string
  major_area: string
  objective: string
}



export function VisualizacaoGrupo() {
  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  }

  const queryUrl = useQuery();
  const type_search = queryUrl.get('group_id');
  const { urlGeral } = useContext(UserContext)

  const [graduatePrograms, setGraduatePrograms] = useState<Patrimonio[]>([]);
  const [linhasPesquisa, setLinhasPesquisa] = useState<LinhasPesquisa[]>([]);

  const urlGraduateProgram = `${urlGeral}research_group?group_id=${type_search}`;

  console.log(urlGraduateProgram)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlGraduateProgram, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });
        const data = await response.json();
        if (data) {
          setGraduatePrograms(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlGraduateProgram]);


  //linhas pesquisa

  const urlLinhasPequisa = `${urlGeral}research_group_lines?group_id=${type_search}`;



  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlLinhasPequisa, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });
        const data = await response.json();
        if (data) {
          setLinhasPesquisa(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlLinhasPequisa]);

  console.log(urlLinhasPequisa)

  //
  const [researcher, setResearcher] = useState<Research[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeVisu, setTypeVisu] = useState('block');

  // Estado separado para todos os pesquisadores do grupo (para o carrossel)
  const [allResearchers, setAllResearchers] = useState<Research[]>([]);
  const [loadingAllResearchers, setLoadingAllResearchers] = useState(false);

  // Buscar todos os pesquisadores do grupo para o carrossel
  useEffect(() => {
    const fetchAllResearchers = async () => {
      if (!type_search) return;

      setLoadingAllResearchers(true);

      try {
        const response = await fetch(`${urlGeral}researcher?group_id=${type_search}`, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });

        const data = await response.json();
        setAllResearchers(data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingAllResearchers(false);
      }
    };

    fetchAllResearchers();
  }, [type_search, urlGeral]);

  // Filtrar pesquisadores do carrossel para excluir os líderes
  const filteredResearchers = allResearchers.filter(researcher => {
    if (graduatePrograms.length === 0) return true;

    const { first_leader, second_leader } = graduatePrograms[0];
    return researcher.name !== first_leader && researcher.name !== second_leader;
  });


  useEffect(() => {
    const fetchResearchers = async () => {
      if (graduatePrograms.length === 0) return;

      const { first_leader, second_leader } = graduatePrograms[0];
      setLoading(true);

      try {
        // Fetch data for first_leader
        const firstResponse = await fetch(`${urlGeral}researcherName?name=${first_leader}`, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });

        const firstData = await firstResponse.json();

        // Fetch data for second_leader if exists
        let secondData = [];
        if (second_leader) {
          const secondResponse = await fetch(`${urlGeral}researcherName?name=${second_leader}`, {
            mode: "cors",
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET",
              "Access-Control-Allow-Headers": "Content-Type",
              "Access-Control-Max-Age": "3600",
              "Content-Type": "text/plain",
            },
          });

          secondData = await secondResponse.json();
        }

        // Combine results
        setResearcher([...firstData, ...secondData]);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResearchers();
  }, [graduatePrograms]);



  const items = Array.from({ length: 2 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  const qualisColor: { [key: string]: string } = {
    "ASTRONOMIA": "bg-red-200",
    "FÍSICA": "bg-blue-200",
    "GEOCIÊNCIAS": "bg-green-200",
    "MATEMÁTICA": "bg-yellow-200",
    "OCEANOGRAFIA": "bg-teal-200",
    "PROBABILIDADE E ESTATÍSTICA": "bg-purple-200",
    "QUÍMICA": "bg-orange-200",
    "AGRONOMIA": "bg-red-800",
    "CIÊNCIA E TECNOLOGIA DE ALIMENTOS": "bg-blue-800",
    "ENGENHARIA AGRÍCOLA": "bg-green-800",
    "MEDICINA VETERINÁRIA": "bg-yellow-800",
    "RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL": "bg-teal-800",
    "RECURSOS PESQUEIROS E ENGENHARIA DE PESCA": "bg-purple-800",
    "ZOOTECNIA": "bg-orange-800",
    "BIOFÍSICA": "bg-red-600",
    "BIOLOGIA GERAL": "bg-blue-600",
    "BIOQUÍMICA": "bg-green-600",
    "BIOTECNOLOGIA": "bg-yellow-600",
    "BOTÂNICA": "bg-teal-600",
    "ECOLOGIA": "bg-purple-600",
    "FARMACOLOGIA": "bg-orange-600",
    "FISIOLOGIA": "bg-red-400",
    "GENÉTICA": "bg-blue-400",
    "IMUNOLOGIA": "bg-green-400",
    "MICROBIOLOGIA": "bg-yellow-400",
    "MORFOLOGIA": "bg-teal-400",
    "PARASITOLOGIA": "bg-purple-400",
    "ZOOLOGIA": "bg-orange-400",
    "EDUCAÇÃO FÍSICA": "bg-red-300",
    "ENFERMAGEM": "bg-blue-300",
    "FARMÁCIA": "bg-green-300",
    "FISIOTERAPIA E TERAPIA OCUPACIONAL": "bg-yellow-300",
    "FONOAUDIOLOGIA": "bg-teal-300",
    "MEDICINA": "bg-purple-300",
    "NUTRIÇÃO": "bg-orange-300",
    "ODONTOLOGIA": "bg-red-100",
    "SAÚDE COLETIVA": "bg-blue-100",
    "ANTROPOLOGIA": "bg-green-100",
    "ARQUEOLOGIA": "bg-yellow-100",
    "CIÊNCIA POLÍTICA": "bg-teal-100",
    "EDUCAÇÃO": "bg-purple-100",
    "FILOSOFIA": "bg-orange-100",
    "GEOGRAFIA": "bg-red-900",
    "HISTÓRIA": "bg-blue-900",
    "PSICOLOGIA": "bg-green-900",
    "SOCIOLOGIA": "bg-yellow-900",
    "TEOLOGIA": "bg-teal-900",
    "CIÊNCIA DA COMPUTAÇÃO": "bg-purple-900",
    "DESENHO INDUSTRIAL": "bg-orange-900",
    "ENGENHARIA AEROESPACIAL": "bg-red-500",
    "ENGENHARIA BIOMÉDICA": "bg-blue-500",
    "ENGENHARIA CIVIL": "bg-green-500",
    "ENGENHARIA DE ENERGIA": "bg-yellow-500",
    "ENGENHARIA DE MATERIAIS E METALÚRGICA": "bg-teal-500",
    "ENGENHARIA DE MINAS": "bg-purple-500",
    "ENGENHARIA DE PRODUÇÃO": "bg-orange-500",
    "ENGENHARIA DE TRANSPORTES": "bg-red-700",
    "ENGENHARIA ELÉTRICA": "bg-blue-700",
    "ENGENHARIA MECÂNICA": "bg-green-700",
    "ENGENHARIA NAVAL E OCEÂNICA": "bg-yellow-700",
    "ENGENHARIA NUCLEAR": "bg-teal-700",
    "ENGENHARIA QUÍMICA": "bg-purple-700",
    "ENGENHARIA SANITÁRIA": "bg-orange-700",
    "ARTES": "bg-red-50",
    "LETRAS": "bg-blue-50",
    "LINGÜÍSTICA": "bg-green-50",
    "BIOÉTICA": "bg-yellow-50",
    "CIÊNCIAS AMBIENTAIS": "bg-teal-50",
    "DEFESA": "bg-purple-50",
    "DIVULGAÇÃO CIENTÍFICA": "bg-orange-50",
    "MICROELETRÔNICA": "bg-red-700",
    "ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO": "bg-blue-700",
    "SEGURANÇA CONTRA INCÊNDIO": "bg-green-700",
    "ADMINISTRAÇÃO": "bg-yellow-700",
    "ARQUITETURA E URBANISMO": "bg-teal-700",
    "CIÊNCIA DA INFORMAÇÃO": "bg-purple-700",
    "COMUNICAÇÃO": "bg-orange-700",
    "DEMOGRAFIA": "bg-red-100",
    "DIREITO": "bg-blue-100",
    "ECONOMIA": "bg-green-100",
    "ECONOMIA DOMÉSTICA": "bg-yellow-100",
    "MUSEOLOGIA": "bg-teal-100",
    "PLANEJAMENTO URBANO E REGIONAL": "bg-purple-100",
    "SERVIÇO SOCIAL": "bg-orange-100",
    "TURISMO": "bg-red-200",
  };

  const normalizeArea = (area: string): string => {
    return area

      .toUpperCase(); // Converte para maiúsculas
  };


  const [count, setCount] = useState(12)
  const { onOpen } = useModal()
  const { version } = useContext(UserContext)

  return (
    <main className="flex flex-1 flex-col gap-4 md:gap-8 ">
      <Helmet>
        <title>{graduatePrograms[0]?.name ? `${graduatePrograms[0].name} | ${version ? 'Conectee' : 'Simcc'}` : `${version ? 'Conectee' : 'Simcc'} | ${version ? 'Escola de Engenharia UFMG' : 'SECTI-BA'}`}</title>
        <meta
          name="description"
          content={graduatePrograms[0]?.name ? `${graduatePrograms[0].name} | Conectee` : `${version ? 'Conectee' : 'Simcc'} | ${version ? 'Escola de Engenharia UFMG' : 'SECTI-BA'}`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="w-full  gap-4 md:p-8 p-4 pb-0 md:pb-0">
        <div className="flex items-center gap-4">

          <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Voltar</span>
          </Button>

          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Grupo de pesquisa
          </h1>

          <div className="hidden items-center gap-2 md:ml-auto md:flex">

            <Button size="sm"><SquareArrowOutUpRight size={16} />Visitar página do grupo no DGP CNPq</Button>
          </div>
        </div>

      </div>

      <div className="md:p-8 p-4 py-0 md:py-0 ">


        <h1 className=" max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]  md:block mb-3 ">
          {graduatePrograms.map((props) => (
            <>{props.name}</>
          ))}
        </h1>

        {graduatePrograms.map((props) => (
          <div className="flex flex-wrap gap-4 ">
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Shapes size={12} />{props.area}</div>
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center capitalize"><Building size={12} />{props.institution}</div>

          </div>
        ))}



      </div>

      <div className="px-4 md:px-8">
        <div>
          <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
              <div className="flex mb-2">
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-2xl font-medium">Líderes</h3>
                  <div className="flex gap-3 mr-3">
                    <Button className="hidden md:flex" onClick={() => setTypeVisu('rows')} variant={typeVisu === 'block' ? 'ghost' : 'outline'} size={'icon'}>
                      <Rows size={16} className="whitespace-nowrap" />
                    </Button>
                    <Button onClick={() => setTypeVisu('block')} variant={typeVisu === 'block' ? 'outline' : 'ghost'} size={'icon'}>
                      <SquaresFour size={16} className="whitespace-nowrap" />
                    </Button>
                  </div>
                </div>
                <AccordionTrigger />
              </div>
              <AccordionContent>
                {typeVisu === 'block' ? (
                  loading ? (
                    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                      <Masonry gutter="16px">{items.map((item, index) => <div key={index}>{item}</div>)}</Masonry>
                    </ResponsiveMasonry>
                  ) : (
                    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 4, 1200: 6, 1500: 6, 1700: 7 }}>
                      <Masonry gutter="16px">
                        {researcher.slice(0, count).map((item: any) => (
                          <ResearchItem
                            key={item.id}
                            among={item.among}
                            articles={item.articles}
                            book={item.book}
                            book_chapters={item.book_chapters}
                            id={item.id}
                            name={item.name}
                            university={item.university}
                            lattes_id={item.lattes_id}
                            area={item.area}
                            lattes_10_id={item.lattes_10_id}
                            city={item.city}
                            graduation={item.graduation}
                            patent={item.patent}
                            speaker={item.speaker}
                            h_index={item.h_index}
                            relevance_score={item.relevance_score}
                            works_count={item.works_count}
                            cited_by_count={item.cited_by_count}
                            i10_index={item.i10_index}
                            scopus={item.scopus}
                            openalex={item.openalex}
                            departament={item.departament}
                            departments={item.departaments}
                            subsidy={item.subsidy}
                            status={item.status}
                            graduate_programs={item.graduate_programs}
                          />
                        ))}
                      </Masonry>
                    </ResponsiveMasonry>
                  )
                ) : (
                  loading ? <Skeleton className="w-full rounded-md h-[400px]" /> : <TableReseracherhome researcher={researcher} />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mt-6">
          <div className="py-4">
            <HeaderResultTypeHome title="Pesquisadores" icon={<Users size={24} className="text-gray-400" />} />
          </div>

          <InfiniteMovingResearchers items={filteredResearchers} direction="right" speed="normal" pauseOnHover={true} className="custom-class" />
        </div>

      </div>

      {linhasPesquisa.length != 0 && (
        <div className="px-4 md:px-8">
          <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
              <div className="flex mb-2">
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-2xl font-medium">Linhas de pesquisa</h3>
                </div>
                <AccordionTrigger />
              </div>
              <AccordionContent>
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 1, 900: 1, 1200: 1 }}>
                  <Masonry gutter="16px">
                    {linhasPesquisa.slice(0, count).map((props) => (
                      <div className="flex w-full" key={`${props.line}-${props.area}`}>
                        <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[120px] border-neutral-200 border-r-0 ${qualisColor[normalizeArea(props.area || '')]} min-h-full relative`} />
                        <Alert className="rounded-l-none">
                          <p className="text-xs text-gray-500 mb-2 flex items-center gap-2 justify-between">{props.area}</p>
                          <h5 className="font-semibold mb-4">{props.line}</h5>
                          <div className="flex flex-wrap gap-3 mt-4">
                            {props.keywords.split(';').map((item, index) => (
                              <div className="text-xs" key={String(index)}>{item}</div>
                            ))}
                          </div>
                        </Alert>
                      </div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>

                {linhasPesquisa.length > count && (
                  <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 12)}><Plus size={16} />Mostrar mais</Button></div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}

    </main>
  )
}