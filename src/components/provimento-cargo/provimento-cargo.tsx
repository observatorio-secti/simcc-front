import { ArrowRight, ChevronLeft, Filter, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../ui/alert";
import { Input } from "../ui/input";
import { MagnifyingGlass } from "phosphor-react";
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";
import { toast } from "sonner"
import { InfoPavimentoCargo } from "./info-provimento-cargo";
import { Skeleton } from "../ui/skeleton";
import { Helmet } from "react-helmet";

interface Post {
    nome: string,
    cpf: string,
    classe: number,
    nivel: number,
    inicio: string,
    fim: string,
    tempo_nivel: number,
    tempo_acumulado: number,
    arquivo: string
}


export function ProvimentoCargo() {
    const history = useNavigate();
const [loading, setLoading] = useState(false)
    const {urlGeral} = useContext(UserContext)

    const handleVoltar = () => {
      history(-1);
    }

    const [search, setSearch] = useState('')
    const [cpf, setCpf] = useState('')

    const [info, setInfo] = useState<Post[]>([]);

    const formatCpf = (value: string) => {
        // Remove qualquer caractere não numérico
        const numericValue = value.replace(/\D/g, "");
    
        // Adiciona os pontos e o traço no formato de CPF
        return numericValue
          .replace(/^(\d{3})(\d)/, "$1.$2")
          .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
          .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4")
          .slice(0, 14); // Limita o número de caracteres no formato correto
      };

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCpf(e.target.value);
        setCpf(formattedValue);
      };

    let urlPatrimonio = `${urlGeral}ufmg/researcher?cpf=${cpf}&name=${search}`;
    console.log(urlPatrimonio)
const fetchData = async () => {
  setLoading(true)
  try {
   
    const response = await fetch( urlPatrimonio, {
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
      setInfo(data);
      setSearch('')
      setCpf('')

      setLoading(false)
   
    } else {
      toast("Erro: Nenhuma infomração encontrada", {
        description: "Revise o número",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });

      setLoading(false)
    }
  } catch (err) {
    console.log(err);
  }
};

const onClickBuscaPatrimonio = () => {
    fetchData()
    
  }

  const intersticio_tabela = {
    "4": {1: 730, 2: 365},  
    "5": {1: 730, 2: 730},  
    "6": {1: 730, 2: 730, 3: 730, 4: 730},  
    "7": {1: 730, 2: 730, 3: 730, 4: 730},  
    "8": {1: 730}, 
    }
    
    console.log(info)
    return(
        <main className="flex flex-1 flex-col gap-4 md:gap-8  ">
           <Helmet>
          <title>Provimento de cargo | Conectee</title>
          <meta name="description" content={`Provimento de cargo | Conectee`} />
          <meta name="robots" content="index, follow" />
        </Helmet>
           <div className="bg-cover bg-center bg-no-repeat" >
           <div className="justify-center md:px-8 px-4 w-full mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >
       <Link to={'/informacoes'}  className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2  px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12}/></Link>
       
       <h1 className="z-[2] text-center max-w-[700px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
             Digite seus dados e{" "}
             <strong className="bg-eng-blue  rounded-md px-3 pb-2 text-white font-medium">
               {" "}
              analise
             </strong>{" "}
           seu provimento de cargo
           </h1>



     
          <Alert  className="h-14 mt-8 p-2 flex items-center justify-between lg:max-w-[60vw] lg:w-[60vw] w-full ">
           <div className="flex items-center gap-2 w-full flex-1">
           <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
          <div className="flex w-full flex-1">
          <Input placeholder="Nome completo"    onChange={(e) => setSearch(e.target.value)} value={search}  type="text" className="border-0 w-full "/>
          <Input placeholder="CPF" onChange={handleChange}  value={cpf}  type="text" className="border-0 w-full "/>
          </div>
               </div>

               <div className="w-fit">
      
          <Button onClick={onClickBuscaPatrimonio} size={'icon'}><Filter size={16}/></Button>
           </div>
               </Alert>
        

          
            
         </div>
           </div>


          

          {loading ? (
            <div>
                <Skeleton className="w-full rounded-md h-[300px]">

                </Skeleton>
            </div>
          ):(
info.length > 0 && (
  <div className="px-8">
  <InfoPavimentoCargo name={info[0]?.nome || ''}dados={info}/>
 </div>
)
          )}
        </main>
    )
}