import { useContext, useMemo, useState } from "react";
import { FilterYearTimeLine } from "../popup/filters-year-timeline";
import { TimeLineResearcher } from "../researcher/timeline-researcher";
import { UserContext } from "../../context/context";
import { TimeLineResearcherMinhaArea } from "./timeline-researcher-minha-area";


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
  
  
  
  

export function LinhaTempoMinhaArea(user:Research) {

    const {user:userAdm} = useContext(UserContext)
    const [researcher, setResearcher] = useState<Research[]>([]); 
    const [loading, isLoading] = useState(false)

    type Filter = {
        year: number[]
        qualis: string[]
      }
  
      const [filters, setFilters] = useState<Filter[]>([]);
  
      // Função para lidar com a atualização de researcherData
      const handleResearcherUpdate = (newResearcherData: Filter[]) => {
        setFilters(newResearcherData);
  
  
      };

      const yearString = filters.length > 0 ? filters[0].year.join(';') : '';


     

    return(
        <div>
            <div className=" pb-0">
                      <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                      Olá, {userAdm?.display_name}
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                           Linha do tempo
                        </h1>

                        <div className="my-6 border-b dark:border-b-neutral-800"></div>

                        <FilterYearTimeLine
                onFilterUpdate={handleResearcherUpdate}/>
                      </div>

                    
                  <div >
                    <TimeLineResearcherMinhaArea
                  among={user.among}
                    articles={user.articles}
                    book={user.book}
                    book_chapters={user.book_chapters}
                    id={user.id}
                    name={user.name}
                    university={user.university}
                    lattes_id={user.lattes_id}
                    area={user.area}
                    abstract={user.abstract}
                    lattes_10_id={user.lattes_10_id}
                    city={user.city}
                    orcid={user.orcid}
                    image={user.image}
                    graduation={user.graduation}
                    patent={user.patent}
                    software={user.software}
                    brand={user.brand}
                    lattes_update={user.lattes_update}

                    h_index={user.h_index}
                    relevance_score={user.relevance_score}
                    works_count={user.works_count}
                    cited_by_count={user.cited_by_count}
                    i10_index={user.i10_index}
                    scopus={user.scopus}
                    openalex={user.openalex}

                    subsidy={user.subsidy}
                    graduate_programs={user.graduate_programs}
                    departments={user.departments}
                    research_groups={user.research_groups}
                
                    cargo={user.cargo}
                    clas={user.clas}
                    classe={user.classe}
                    rt={user.rt}
                    situacao={user.situacao}

                    year_filter={yearString}
                    entradanaufmg={user.entradanaufmg}
                  />
                  </div>
                
        </div>
    )
}