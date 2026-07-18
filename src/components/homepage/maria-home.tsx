import { Sparkles } from "lucide-react";
import { Alert } from "../ui/alert";
import { CardContent, CardHeader } from "../ui/card";
import { SymbolEEWhite } from "../svg/SymbolEEWhite";
import { SymbolEE } from "../svg/SymbolEE";
import { useTheme } from "next-themes";
import { Skeleton } from "../ui/skeleton";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";

interface Query {
    query:string
    researcher:Research[]
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
  

export function MariaHome() {
    const {theme} = useTheme()

    const {mode, searchType, urlGeral} = useContext(UserContext)

    let question = mode

    let urlTermPesquisadores = ``;

    if (searchType === 'name') {
      urlTermPesquisadores = `${urlGeral}maria/researcher?query=${question}`;
    } else if (searchType === 'article') {
      urlTermPesquisadores = `${urlGeral}maria/researcher/article?query=${question}`;
    } else if (searchType === 'book') {
      urlTermPesquisadores = `${urlGeral}maria/researcher/book?query=${question}`; //
    } else if (searchType === 'area') {
      urlTermPesquisadores = `${urlGeral}maria/researcher/area?query=${question}`;
    } else if (searchType === 'speaker') {
      urlTermPesquisadores = `${urlGeral}maria/researcher/event?query=${question}`; //
    } else if (searchType === 'patent') {
      urlTermPesquisadores = `${urlGeral}maria/researcher/patent?query=${question}`;
    } else if (searchType === 'abstract') {
      urlTermPesquisadores = `${urlGeral}maria/researcher/abstract?query=${question}`;
    }

    const [load, setLoad] = useState(false)
    const [maria, setMaria] = useState<Query| null>(null);;


    const fetchData = async () => {
        try {
          setLoad(true);
         
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
         
            console.log(data)
            setMaria(data)
    
            setLoad(false)
          } 
         
        } catch (err) {
          console.log(err);
          setLoad(false);
        }
      };
    
      
      useEffect(() => {
       fetchData()
    }, [mode]);
    

    return(
       <>
       {mode != '' && (
         <Alert className="backgroundMaria w-full dark:bg-transparent p-6  border dark:border-neutral-800 rounded-md my-4 md:my-8">
         <CardHeader className="flex flex-row mb-4 items-center justify-between space-y-0 pb-2">
         <div className="flex gap-3  items-center">
                <div className="h-4">{theme == 'dark' ? (<SymbolEEWhite/>):(<SymbolEE/>)}</div>
              <h2 className="font-bold text-lg ">Visão geral criada pela MarIA</h2>
             
              </div>
                           <Sparkles className="h-4 w-4 text-muted-foreground" />
                         </CardHeader>
 
                         <CardContent>
                        {load ? (
                             <div className="flex flex-col gap-4">
                             <Skeleton className="h-4 rounded-md w-full"/>
                             <Skeleton className="h-4 rounded-md w-[90%]"/>
                             <Skeleton className="h-4 rounded-md w-[95%]"/>
                             <Skeleton className="h-4 rounded-md w-1/2"/>
                         </div>
                        ):(
                            <p>{maria?.query}</p>
                        )}
                         </CardContent>
        
         </Alert>
       )}
       </>
    )
}