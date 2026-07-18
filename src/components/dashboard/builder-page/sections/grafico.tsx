import { BarChart, Book, BookOpen, Plus, Stamp } from "lucide-react";
import { Button } from "../../../ui/button";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { useLocation } from "react-router-dom";
import { Alert } from "../../../ui/alert";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../../context/context";
import { GraficoProducaoGeralSection } from "../graficos/grafico-producao-geral";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/dropdown-menu";
import { ChartBar } from "phosphor-react";
import { GraficoLivrosCapitulosSection } from "../graficos/grafico-livros-capitulos";
import { GraficoProducaoTecnicaSection } from "../graficos/grafico-producao-tecnica";

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export type Dados = {
    count_article: number
    count_book: number
    count_book_chapter: number,
    count_guidance: number
    count_patent: number
    count_report: number
    count_software: number
    count_guidance_complete: number
    count_guidance_in_progress: number
    count_patent_granted: number
    count_patent_not_granted: number
    count_brand: number
    graduantion: string
    year: number
  
    A1: number
    A2: number
    A3: number
    A4: number
    B1: number
    B2: number
    B3: number
    B4: number
    C: number
    SQ: number
  }

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function GraficoSection (props:Props) {

    const queryUrl = useQuery();

    const graduate_program_id = queryUrl.get('graduate_program_id');
    const group_id = queryUrl.get('group_id');
    const dep_id = queryUrl.get('dep_id');

    const [dados, setDados] = useState<Dados[]>([]);
      const [year, setYear] = useState(new Date().getFullYear() - 4);

      const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear; i > currentYear - 30; i--) {
    years.push(i);
  }

   const {urlGeral} = useContext(UserContext)

          let urlDados= ''
        if(dep_id) {
            urlDados =`${urlGeral}departamentos?dep_id=${dep_id}`;
        } else if (group_id) {
            urlDados =`${urlGeral}research_group?group_id=${group_id}`;
        } else if (graduate_program_id) {
            urlDados =`${urlGeral}ResearcherData/DadosGerais?year=${year}&graduate_program_id=${graduate_program_id}`
        }


  useEffect(() => {
      const fetchData = async () => {
        try {
  
          const response = await fetch(urlDados, {
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
            setDados(data);
  
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData();
    }, [urlDados]);

    const [showDropdown, setShowDropdown] = useState(false);

   const items = [
        { titulo: "Produção geral", desc: "Gráfico de barras", icon: <BarChart size={16} />, type:'producao-geral' },
        { titulo: "Livros e capítulos", desc: "Gráfico de barras", icon: <BookOpen size={16} />, type:'livro-capitulo' },
        { titulo: "Produção técnica", desc: "Gráfico de barras", icon: <Stamp size={16} />, type:'producao-tecnica' },
       
      ];

      const addSocialItem = (name: string,  index: number) => {
        props.setKeepoData((prev) => {
          const updatedContent = [...prev.content];
      
          // Verifica se o índice especificado é válido
          if (updatedContent[index] && updatedContent[index].type === "grafico") {
            // Se o item social já existir no índice, adiciona o novo item
            updatedContent[index].items.push({ name, url:'', title: "", image: "" });
          } else {
            // Caso contrário, cria um novo item social no índice especificado
            updatedContent.splice(index, 0, {
              type: "grafico",
              title: "Gráficos",
              emoji: "",
              url: "",
              order: props.index,
              description: '',
              items: [{ name, url:'', title: "", image: "" }]
            });
          }
      
          return { ...prev, content: updatedContent };
        });
      
        setShowDropdown(false)
      };
    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
            <div className="flex flex-col gap-2">
            <DropdownMenu open={showDropdown} onOpenChange={() => setShowDropdown(!showDropdown)}>
        <DropdownMenuTrigger className="h-fit w-fit">
        <Button variant={'outline'} className="h-8 px-2">
            <Plus size={16}/>Adicionar gráfico
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
       {items.map((item, index) => (
       <div 
       className="cursor-pointer rounded-md " 
       onClick={() => addSocialItem(item.type, props.index)}
       >
       <DropdownMenuItem className="flex items-start gap-2">
         {item.icon}
        <div>
           <p className="">{item.titulo}</p>
           <p className="text-gray-500 text-xs">{item.desc}</p>
        </div>
           </DropdownMenuItem>
       </div>
       ))}
          </DropdownMenuContent>
          </DropdownMenu>
          

            {props.contentItem.items.map((item, idx) => (
                <div>
                     {(() => {
                    switch (item.name) {
                        case 'producao-geral':
                            return <GraficoProducaoGeralSection dados={dados} year={year} setYear={setYear}/>
                        case 'livro-capitulo':
                            return <GraficoLivrosCapitulosSection dados={dados} year={year} setYear={setYear}/>
                          case 'producao-tecnica':
                              return <GraficoProducaoTecnicaSection dados={dados} year={year} setYear={setYear}/>
                        default:
                        return null;
                    }
                })()}
                </div>
            ))}
            </div>
        </Base>
    )
}