import { MagnifyingGlass } from "phosphor-react";
import { Input } from "../../ui/input";
import { useContext, useMemo, useState } from "react";
import { Alert } from "../../ui/alert";
import { UserContext } from "../../../context/context";
import { Skeleton } from "../../ui/skeleton";
import { Calendar, Mail, Star, Trash } from "lucide-react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Button } from "../../ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Separator } from "../../ui/separator";
interface Feedback {
    created_at:string
    description:string
    email:string
    id:string
    name:string
    rating:string
}

export function Feedbacks() {
    const [pesquisaInput, setPesquisaInput] = useState('');
 const [publicacoes, setPublicacoes] = useState<Feedback[]>([]);
    const [count, setCount] = useState(100)
const {urlGeralAdm} = useContext(UserContext)
const [loading, isLoading] = useState(false)

let urlMagazine = urlGeralAdm+ 's/feedback'
    console.log(urlMagazine)
    const fetchData = async () => {
        try {
          isLoading(true)
          const response = await fetch( urlMagazine, {
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
            setPublicacoes(data);
            isLoading(false)
          }
        } catch (err) {
          console.log(err);
        }
      };
      
    useMemo(() => {
       
          fetchData();
        }, [ urlMagazine]);

        const items = Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="w-full rounded-md h-[170px]" />
          ));


          const handleDelete= (id: string) => {

  
    
    
            const urlDeleteProgram =  urlGeralAdm + `s/feedback?feedback_id=${id}`
            
          
            const fetchDataDelete = async () => {
             
              try {
                const response = await fetch(urlDeleteProgram, {
                  mode: 'cors',
                  method: 'DELETE',
                  headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'DELETE',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '3600',
                    'Content-Type': 'text/plain'
                  }
                });
                if (response.ok) {
                  toast("Dados deletados com sucesso!", {
                    description: "Feedback removido da base de dados",
                    action: {
                      label: "Fechar",
                      onClick: () => { },
                    },
                  })
                  fetchData();
                }

                
              } catch (err) {
                console.log(err);
                toast("Erro ao deletar dados", {
                    description: "Tente novamente",
                    action: {
                      label: "Fechar",
                      onClick: () => { },
                    },
                  })
              } 
            };
            
            fetchDataDelete()
          
          }


          const filteredTotal = Array.isArray(publicacoes) ? publicacoes.filter(item => { 
            const normalizeString = (str) => str
              .normalize("NFD")
              .replace(/[̀-ͯ]/g, "")
              .toLowerCase();
            
            const searchString = normalizeString(item.name);
            const normalizedSearch = normalizeString(pesquisaInput);
            
            return (
              searchString.includes(normalizedSearch) 
            );
          }) : [];
        
      

    return(
        <div>
           <Alert className="h-14  p-2 flex items-center justify-between  w-full ">
                <div className="flex items-center gap-2 w-full flex-1">
                  <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
                  <Input value={pesquisaInput} onChange={(e) => setPesquisaInput(e.target.value)}  type="text" className="border-0 w-full " />
                </div>

                <div className="w-fit">


                </div>
              </Alert>
            

                            <div className="w-full my-4 h-[0.5px] border-neutral-200 border-b dark:border-neutral-800"></div>


<div>
  <p className="font-medium text-sm my-4">Mais recentes</p>

<ScrollArea className="h-[250px]">
<div className="flex flex-col gap-4">
{filteredTotal
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .map((props) => {
    const formattedDate = format(new Date(props.created_at), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });

    // Definição da cor com base no rating
    const getColor = (rating: number) => {
      if (rating <= 2) return "bg-red-500";
      if (rating <= 4) return "bg-orange-500";
      if (rating <= 6) return "bg-yellow-500";
      if (rating <= 8) return "bg-green-500";
      return "bg-blue-500";
    };

    return (
      <div className="flex" key={props.id}>
        <Alert className={`rounded-r-none border-r-0 w-2 min-w-2 p-0 ${getColor(Number(props.rating))}`} />
        <Alert className="rounded-l-none">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1>{props.name}</h1>
              <div className="flex gap-2 flex-wrap mt-2">
                <div className="text-gray-500 text-sm flex gap-1 items-center">
                  <Mail size={12} />
                  <p>{props.email}</p>
                </div>
                <div className="text-gray-500 text-sm flex gap-1 items-center">
                  <Star size={12} />
                  <p>{props.rating}</p>
                </div>
                <div className="text-gray-500 text-sm flex gap-1 items-center">
                  <Calendar size={12} />
                  <p>{formattedDate}</p>
                </div>
              </div>
            </div>

            <Button onClick={() => handleDelete(props.id)} className="h-8 w-8 whitespace-nowrap min-w-8" size={'icon'} variant={'destructive'}>
              <Trash size={16} />
            </Button>
          </div>
            <Separator className="my-4"/>
          <div className="">
            <p className="text-gray-500 text-sm">{props.description}</p>
          </div>
        </Alert>
      </div>
    );
  })}


  {filteredTotal.length == 0 && (
    <p className="text-center text-gray-500 text-sm py-12">Nenhum resultado encontrado</p>
  )}

</div>
<ScrollBar orientation="vertical"/>
</ScrollArea>
</div>
        </div>
    )
}