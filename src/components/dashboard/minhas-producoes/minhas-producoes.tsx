import { BookOpen, ChevronDown, ChevronUp, Copyright, File, Files, FolderKanban, Stamp, Ticket } from "lucide-react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Button } from "../../ui/button";
import { MagnifyingGlass, Quotes, Student } from "phosphor-react";
import { useContext, useMemo, useState } from "react";
import { ResultProvider } from "../../provider/result-provider";
import { useModalResult } from "../../hooks/use-modal-result";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { UserContext } from "../../../context/context";
import { Alert } from "../../ui/alert";
import { Input } from "../../ui/input";
import { ArticlesResearcherPopUp } from "../../popup/articles-researcher";
import { DashboardMinhasProducoes } from "./dashboard-mhas-producoes";

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
  entradanaufmg:Date
 
  h_index:string,
  relevance_score:string,
  works_count:string,
  cited_by_count:string,
  i10_index:string,
  scopus:string,
  openalex:string,

  subsidy:Bolsistas[]
  graduate_programs:GraduatePrograms[]
  departments:Departments[]
  research_groups:ResearchGroups[]

  cargo:string
  clas:string
  classe:string
  rt:string
  situacao:string
}

interface Bolsistas {
  aid_quantity:string
  call_title:string
  funding_program_name:string
  modality_code:string
  category_level_code:string
  institute_name:string
  modality_name:string
  scholarship_quantity:string
  }

  interface  GraduatePrograms {
    graduate_program_id:string
    name:string
  }

  interface Departments {
    dep_des:string
    dep_email:string
    dep_nom:string
    dep_id:string
    dep_sigla:string
    dep_site:string
    dep_tel:string
    img_data:string
  }

  interface ResearchGroups {
    area:string
    group_id:string
    name:string
  }


export function MinhasProducoes() {

    const [isOn, setIsOn] = useState(true);
 
    const [value, setValue] = useState('article')

    const [search, setSearch] = useState('')

    const [loading, isLoading] = useState(false)

    const [researcher, setResearcher] = useState<Research[]>([]); 

    const {user, urlGeral} = useContext(UserContext)

    let urlTermPesquisadores = urlGeral + `researcher/${user?.lattes_id}`;

    useMemo(() => {
      const fetchData = async () => {
          try {
            isLoading(true)
            const response = await fetch(urlTermPesquisadores, {
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
              setResearcher(data);
              isLoading(false)
            } 
        

          } catch (err) {
            console.log(err);
          }
        };
        fetchData();
      }, [urlTermPesquisadores]);

    return(
        <main className="h-full w-full flex flex-col">
          <DashboardMinhasProducoes/>
          
           <Tabs defaultValue="articles" value={value} className="">
             <div>
              <div className={`w-full ${isOn ? 'px-8' : 'px-4'} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                {isOn && (
                  <div className="w-full pt-4  flex justify-between items-center">
                    <Alert  className="h-14 mt-4 mb-2  p-2 flex items-center justify-between w-full ">
           <div className="flex items-center gap-2 w-full flex-1">
           <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
           <Input  onChange={(e) => setSearch(e.target.value)} value={search}  type="text" className="border-0 w-full "/>
               </div>

               <div className="w-fit">
      
          
           </div>
               </Alert>
                  </div>
                )}
                <div className={`flex pt-2 gap-8 justify-between  ${isOn ? '' : ''} `}>
                  <div className="flex items-center gap-2">
                  <div className=" grid grid-cols-1 ">
                  <ScrollArea className="">
                  <TabsList className="p-0 flex h-auto bg-transparent dark:bg-transparent">
                  <div className={`pb-2 border-b-2 text-black dark:text-white  transition-all ${value == 'article' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`} onClick={() => setValue('article')}>
                      <Button variant={value == 'article' ? ('ghost'):('ghost')}  className="m-0" >
                      <File size={16} className="" />
                      Artigos
                      </Button>
                      </div>

                      <div className={`pb-2 border-b-2 text-black dark:text-white  transition-all ${value == 'book' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`} onClick={() => setValue('book')}>
                      <Button variant={value == 'book' ? ('ghost'):('ghost')}  className="m-0" >
                      <BookOpen size={16} className="" />
                      Livros e capítulos
                      </Button>
                      </div>

                      <div className={`pb-2 border-b-2 text-black dark:text-white  transition-all ${value == 'producao-tecnica' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`} onClick={() => setValue('producao-tecnica')}>
                      <Button variant={value == 'producao-tecnica' ? ('ghost'):('ghost')}  className="m-0" >
                      <Copyright size={16} className="" />
                      Patentes
                      </Button>
                      </div>

                      <div className={`pb-2 border-b-2 text-black dark:text-white  transition-all ${value == 'relatorio-tecnico' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`} onClick={() => setValue('relatorio-tecnico')}>
                      <Button variant={value == 'relatorio-tecnico' ? ('ghost'):('ghost')}  className="m-0" >
                      <Files size={16} className="" />
                      Relatório técnico
                      </Button>
                      </div>

                      <div className={`pb-2 border-b-2 text-black dark:text-white  transition-all ${value == 'orientacoes' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`} onClick={() => setValue('orientacoes')}>
                      <Button variant={value == 'orientacoes' ? ('ghost'):('ghost')}  className="m-0" >
                      <Student size={16} className="" />
                      Orientações
                      </Button>
                      </div>

                      <div className={`pb-2 border-b-2 text-black dark:text-white  transition-all ${value == 'speaker' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`} onClick={() => setValue('speaker')}>
                      <Button variant={value == 'speaker' ? ('ghost'):('ghost')}  className="m-0" >
                      <Ticket size={16} className="" />
                      Participação em eventos
                      </Button>
                      </div>

                      <div className={`pb-2 border-b-2 text-black dark:text-white  transition-all ${value == 'research-project' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`} onClick={() => setValue('research-project')}>
                      <Button variant={value == 'research-project' ? ('ghost'):('ghost')}  className="m-0" >
                      <FolderKanban size={16} className="" />
                    Projetos de pesquisa
                      </Button>
                      </div>
                  </TabsList>

                  <ScrollBar orientation="horizontal"/>
                  </ScrollArea>
                  </div>
       
                   
                  </div>
                  <div className="flex flex-1 gap-3 justify-end">
                  

             
                    <Button variant="ghost"  size="icon" onClick={() => setIsOn(!isOn)}>
                      {isOn ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            
            </div>

            <ScrollArea className="h-full">
            <div className="px-8">
            <TabsContent value="article">
  {researcher.slice(0, 1).map((user) => {
                return(
                  <ArticlesResearcherPopUp name={String(user.id)}/>
                  )
                })}
  </TabsContent>
              </div>
           
          </ScrollArea>
          </Tabs>
        </main>
    )
}