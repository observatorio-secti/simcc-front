import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../context/context"
import { MagnifyingGlass, Trash } from "phosphor-react"
import { Button } from "../ui/button"
import { ArrowRight, ChevronsUpDown, Info, Plus, X } from "lucide-react"
import { Link } from "react-router-dom"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input"

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


export function HeaderBarema() {
  const { pesquisadoresSelecionados, urlGeral, urlGeralAdm, setPesquisadoresSelecionados } = useContext(UserContext)

  const [input, setInput] = useState('')
  //listar todos os pesquisadores popover
  const [pesquisadoreSelecionado, setPesquisadorSelecionado] = useState<Research | undefined>();


  const [researcherSearch, setResearcherSearch] = useState<Research[]>([]);

  const urlGetResearcherSearch = urlGeral + `researcherName?name=`;

  console.log(urlGetResearcherSearch)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlGetResearcherSearch, {
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
          setResearcherSearch(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();


  }, []);

  const [openPopo2, setOpenPopo2] = useState(false)

  const normalizeString = (str: any) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredList = researcherSearch.filter((framework) =>
    normalizeString(framework.name).includes(normalizeString(input))
  );

  return (
    <div className="">
      <div className="flex  gap-6 w-full flex-col  ">
        <div>
          <h1 className=" max-w-[450px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]  md:block mb-3 ">
            Criar  <strong className="bg-[#719CB8]   rounded-md px-3 pb-2 text-white font-medium">barema</strong> de avaliação dos pesquisadores
          </h1>
          <p className="max-w-[500px]  text-lg font-light text-foreground">O sistema de classificação, é uma estrutura criada para avaliar e classificar pesquisadores com base em critérios específicos.</p>
        </div>

        <div className="flex items-center gap-3">
          {pesquisadoresSelecionados.slice(0, 8).map(props => {

            return (
              <div key={props.id} className="group flex transition-all">
                <div className=" rounded-md w-10 h-10 bg-cover bg-center bg-no-repeat group-hover:rounded-l-lg group-hover:rounded-r-none" style={{ backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${props.id}) ` }}></div>
                <div
                  onClick={() => {
                    // Verifica se o pesquisador já está selecionado pelo nome
                    if (pesquisadoresSelecionados.some(pesquisador => pesquisador.name === props.name)) {
                      // Remove o pesquisador selecionado com o nome correspondente
                      setPesquisadoresSelecionados(prev => prev.filter(pesquisador => pesquisador.name !== props.name));
                    } else {
                      // Adiciona o novo pesquisador selecionado
                      setPesquisadoresSelecionados(prev => [
                        ...prev,
                        {
                          id: props.id,
                          name: props.name,
                          university: props.university,
                          lattes_id: props.lattes_id,
                          city: props.city,
                          area: props.area,
                          graduation: props.graduation,
                        }
                      ]);
                    }
                  }}
                  className="h-10 w-10  hidden group-hover:flex items-center justify-center transition-all hover:text-neutral-900 dark:bg-neutral-950 bg-white hover:bg-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-neutral-50  text-gray-500 dark:text-white rounded-r-md cursor-pointer" ><X size={16} className="" /></div>

              </div>
            )

          })}

          {pesquisadoresSelecionados.length > 0 && (
            <Button variant={'secondary'} onClick={() => { setPesquisadoresSelecionados([]); }} size={'icon'}><Trash size={16} /></Button>

          )}
          <Dialog open={openPopo2} onOpenChange={setOpenPopo2}>
            <DialogTrigger >
              <Button className="" size={'icon'}><Plus size={16} /></Button>
            </DialogTrigger>
            <DialogContent className="z-[9999]" >
              <DialogHeader>
                <DialogTitle>Escolher pesquisador</DialogTitle>
                <DialogDescription>
                  Todos os docentes cadastrado no Módulo Administrativo da instituição
                </DialogDescription>
              </DialogHeader>

              <div className="border rounded-md px-6 h-12 flex items-center gap-1 border-neutral-200 dark:border-neutral-800">
                <MagnifyingGlass size={16} />
                <Input
                  className="border-0"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Buscar pesquisador"
                />
              </div>

              <div className={'max-h-[350px] overflow-y-auto elementBarra'}>

                <div className="flex flex-col gap-1 p-2">
                  {filteredList.length > 0 ? (
                    filteredList.map((props, index) => (
                      <Button
                        variant={'ghost'}
                        key={index}
                        className="text-left justify-start"
                        onClick={() => {
                          // Verifica se o pesquisador já está selecionado pelo nome
                          if (pesquisadoresSelecionados.some(pesquisador => pesquisador.name === props.name)) {
                            // Remove o pesquisador selecionado com o nome correspondente
                            setPesquisadoresSelecionados(prev => prev.filter(pesquisador => pesquisador.name !== props.name));
                          } else {
                            // Adiciona o novo pesquisador selecionado
                            setPesquisadoresSelecionados(prev => [
                              ...prev,
                              {
                                id: props.id,
                                name: props.name,
                                university: props.university,
                                lattes_id: props.lattes_id,
                                city: props.city,
                                area: props.area,
                                graduation: props.graduation,
                              }
                            ]);
                          }

                          setOpenPopo2(false);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3 font-medium">
                            <div className="bg-cover bg-center bg-no-repeat h-6 w-6  rounded-md  " style={{ backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${props.id}) ` }}></div>
                            {props.name}
                          </div>

                          <div>
                            {pesquisadoresSelecionados.some(pesquisador => pesquisador.name === props.name) ? (
                              <X size={16} className="" />
                            ) : (
                              <Plus size={16} className="" />
                            )}
                          </div>
                        </div>
                      </Button>
                    ))
                  ) : (
                    <div className="text-center w-full text-sm">Nenhum pesquisador encontrado</div>
                  )}
                </div>
              </div>
            </DialogContent>

          </Dialog>
        </div>


      </div>
    </div>
  )
}