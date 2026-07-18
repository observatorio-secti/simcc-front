import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ResearchItem } from "../homepage/categorias/researchers-home/researcher-item";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";

interface GraduateProgram {
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
   
    h_index:string,
    relevance_score:string,
    works_count:string,
    cited_by_count:string,
    i10_index:string,
    scopus:string,
    openalex:string,
    departament:string
    subsidy:Bolsistas[]
    graduate_programs:GraduatePrograms[]
    departments:string
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

    
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

export function DocentesDepartamento() {
    const { urlGeral } = useContext(UserContext)

    const queryUrl = useQuery();

    const type_search = queryUrl.get('dep_id');

    const urlGraduateProgram = `${urlGeral}researcherName?name=&dep_id=${type_search}`

    console.log(urlGraduateProgram)

    const [graduatePrograms, setGraduatePrograms] = useState<GraduateProgram[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true)
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
            setIsLoading(false)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData();
    }, [urlGraduateProgram]);


    const [count, setCount] = useState(12)

    return (
        <div className="px-4 md:px-8">
              <div className=" mt-2 pb-4 md:pb-8">
                 
        
                 <h1 className=" max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]  md:block mb-3 ">
                 Docentes do departamento
                 </h1>
                 <p className="max-w-[750px]  text-lg font-light text-foreground">Todos os pesquisadores que fazem parte do programa de pós-graduação </p>
                           <div className="flex gap-3 mt-3">
                             <Button size={'sm'} 
                            >Importar dados dos docentes</Button>
                            
                           </div>
         
                           </div>

            {isLoading ? (
                <div className="mb-4 md:mb-8 w-full">
  <ResponsiveMasonry
             columnsCountBreakPoints={{
                 350: 1,
                 750: 2,
                 900: 3,
                 1200:  3,
                 1500: 4,
                 1700: 5
             }}
         >
         
                              <Masonry gutter="16px">
                              {Array.from({ length: 12 }).map((_, index) => (
                                    <Skeleton key={index} className="w-full rounded-md h-[250px]" />
                                ))}
                              </Masonry>

                              </ResponsiveMasonry>

                </div>
            ):(
                <div className="mb-4 md:mb-8">
                <ResponsiveMasonry
             columnsCountBreakPoints={{
                 350: 1,
                 750: 2,
                 900: 3,
                 1200:  3,
                 1500: 4,
                 1700: 5
             }}
         >
         
                              <Masonry gutter="16px">
                      {graduatePrograms.slice(0, count).map((item: any) => {
         
                         return (
                             <ResearchItem
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
                             subsidy={item.subsidy}
                             graduate_programs={item.graduate_programs}
                             departments={item.departments}
                             status={item.status}
                             />
                         );
                     })}
                 </Masonry>
                 </ResponsiveMasonry>
         
                 {graduatePrograms.length > count && (
                     <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 12)}><Plus size={16} />Mostrar mais</Button></div>
                 )}
                </div>
            )}
        </div>
    )
}