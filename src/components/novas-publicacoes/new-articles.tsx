import { Book, Briefcase, ChevronLeft, Code, Copyright, Hash, Maximize2, Minimize2, Plus, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Books, LinkBreak, MagnifyingGlass, Quotes, StripeLogo } from "phosphor-react";
import { Input } from "../ui/input";
import { UserContext } from "../../context/context";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Alert } from "../ui/alert";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import screenfull from 'screenfull';

interface Total {
  article:string
  book:string
  book_chapter:string
  brand:string 
  patent:string 
  researcher:string 
  software:string 
  work_in_event:string
  subsidy:string
}


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Label } from "../ui/label";
import { ArticleItem } from "../homepage/categorias/articles-home/article-item";
import { InfiniteMovingArticle } from "../ui/infinite-moving-article";
import { InfiniteMovingResearchers } from "../ui/infinite-moving-researcher";
import { PopUpAnuncio } from "./pop-up-anuncio";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { LogoConectee } from "../svg/LogoConectee";
import { LogoIaposWhite } from "../svg/LogoIaposWhite";
import { LogoConecteeWhite } from "../svg/LogoConecteeWhite";
import { LogoIapos } from "../svg/LogoIapos";
import { useTheme } from "next-themes";
import { InfiniteMovingProductions } from "../ui/infinite-moving-productions";
import { Helmet } from "react-helmet";


type Magazine = {
  id: string,
  issn: string,
  jcr_link: string,
  jif: string,
  magazine: string,
  qualis: string
}

type Publicacao = {
  id: string,
  doi: string,
  name_periodical: string,
  qualis: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "None" | "SQ",
  title: string,
  year: string,
  color: string,
  researcher: string,
  lattes_id: string,
  magazine: string,
  lattes_10_id: string,
  jif: string,
  jcr_link: string
  researcher_id: string
  distinct: boolean

  abstract:string,
  article_institution:string,
  authors:string
  authors_institution:string
  citations_count:string 
  issn:string 
  keywords:string 
  landing_page_url:string 
  language:string 
  pdf:string
  has_image:boolean
  relevance:boolean

}

interface Departamentos {
  dep_id:string
  org_cod: string
  dep_nom: string
  dep_des: string
  dep_email: string
  dep_site: string
  dep_tel: string
  img_data:string
  dep_sigla: string
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
  subsidy:Bolsistas[]
  graduate_programs:GraduatePrograms[]
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

  


export function NewsArticles() {
    const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }

    const [tab, setTab] = useState('all')

    const {urlGeral, version, urlGeralAdm} = useContext(UserContext)

    const [total, setTotal] = useState<Departamentos[]>([]);
    const [totalSelecionado, setTotalSelecionado] = useState<Departamentos | null>(null);

    const [pesquisaInput, setPesquisaInput] = useState('');

    let urlMagazine = `${urlGeral}magazine?initials=nat&issn=`
  
 
    if (pesquisaInput == "") {
      urlMagazine = `${urlGeral}magazine?initials=nat&issn=`
    }

else if (/^\d+$/.test(pesquisaInput)) {
// Se filterValue contiver apenas números
urlMagazine = `${urlGeral}magazine?initials=&issn=${pesquisaInput}`;
} else {
// Se filterValue contiver uma string
urlMagazine = `${urlGeral}magazine?initials=${pesquisaInput}&issn=`;
}

const [magazine, setMagazine] = useState<Magazine[]>([]);

useEffect(() => {
    const fetchData = async () => {
 
      try {
        const response = await fetch(urlMagazine, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain'
          }
        });
        const data = await response.json();
        if (data) {
          setMagazine(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
 
      }
    };
    fetchData();
  }, [urlMagazine]);

  let qualisColor = {
'A1': 'bg-[#006837]',
'A2': 'bg-[#8FC53E]',
'A3': 'bg-[#ACC483]',
'A4': 'bg-[#BDC4B1]',
'B1': 'bg-[#F15A24]',
'B2': 'bg-[#F5831F]',
'B3': 'bg-[#F4AD78]',
'B4': 'bg-[#F4A992]',
'B5': 'bg-[#F2D3BB]',
'C': 'bg-[#EC1C22]',
'None': 'bg-[#560B11]',
'SQ': 'bg-[#560B11]'
}

const [count, setCount] = useState(12)
const [gg, setGG] = useState('')
//

const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);

const urlTermPublicacoes = urlGeral + `recently_updated?year=2024&university=&dep_id=${totalSelecionado != null ? (totalSelecionado?.dep_id):('')}`
console.log(urlTermPublicacoes)
useMemo(() => {
    const fetchData = async () => {
        try {

          const response = await fetch( urlTermPublicacoes, {
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
          
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData();
    }, [ urlTermPublicacoes]);

    const containerRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
      const handleFullscreenChange = () => {
        if (screenfull.isEnabled) {
          setIsFullscreen(screenfull.isFullscreen);
        }
      };

      if (screenfull.isEnabled) {
        screenfull.on('change', handleFullscreenChange);
      }

      return () => {
        if (screenfull.isEnabled) {
          screenfull.off('change', handleFullscreenChange);
        }
      };
    }, []);

    const handleFullscreen = () => {
      if (containerRef.current && screenfull.isEnabled) {
        screenfull.toggle(containerRef.current);
      }
    };

    const urlPatrimonioInsert = `${urlGeralAdm}departamentos`

    useEffect(() => {
 
    const fetchData = async () => {
     
      try {
          
        const response = await fetch(urlPatrimonioInsert , {
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
            setTotal(data)
 
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData()

   
  }, [urlPatrimonioInsert]);

console.log(totalSelecionado?.dep_nom || '')


// pesquisadores

const [researcher, setResearcher] = useState<Research[]>([]);

  let urlTermPesquisadores = `${urlGeral}researcherName?name=`

useMemo(() => {
  const fetchData = async () => {
      try {
     
        const response = await fetch(  urlTermPesquisadores, {
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
       
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermPesquisadores]);

  const {theme} = useTheme()


    //

    const [totalProducao, setTotalProducao] = useState<Total[]>([]);

    const urlTotalProgram = `${urlGeral}graduate_program_production?graduate_program_id=&year=1900`;
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(urlTotalProgram, {
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
            setTotalProducao(data);
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData();
    }, [urlTotalProgram]);


    const producoes = [
        {
          name: "Artigos",
          icon: Quotes, // Certifique-se de que Quotes é um componente ou valor válido
          number: totalProducao.slice(0, 1)[0]?.article, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Livros",
            icon: Book, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.book, // Corrigido para acessar o primeiro item e a propriedade `article`
          },
          {
            name: "Capítulos de livro",
            icon: Books, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.book_chapter, // Corrigido para acessar o primeiro item e a propriedade `article`
          },
          {
            name: "Patentes",
            icon: Copyright, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.patent, // Corrigido para acessar o primeiro item e a propriedade `article`
          },
          {
            name: "Marcas",
            icon: StripeLogo, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.brand, // Corrigido para acessar o primeiro item e a propriedade `article`
          },
          {
            name: "Softwares",
            icon: Code, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.software, // Corrigido para acessar o primeiro item e a propriedade `article`
          },
          {
            name: "Trabalhos em eventos",
            icon: Briefcase, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.work_in_event, // Corrigido para acessar o primeiro item e a propriedade `article`
          },
          {
            name: "Bolsistas CNPq",
            icon: Copyright, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.subsidy, // Corrigido para acessar o primeiro item e a propriedade `article`
          }
      
      ];


    return(
        <main ref={containerRef} className="  bg-neutral-50 dark:bg-neutral-900 w-full">
            <Helmet>
          <title>Produções recentes | {version ? ('Conectee'):('Simcc')}</title>
          <meta name="description" content={`Produções recentes | ${version ? ('Conectee'):('Simcc')}`} />
          <meta name="robots" content="index, follow" />
        </Helmet>

          <Tabs defaultValue={tab}  value={tab} className="h-full" >
          <div className="w-full  gap-4 p-4 md:p-8">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" className="h-8 w-8" size={'icon'} >
                <ChevronLeft className="h-4 w-4" />
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Produções recentes
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <Button className="h-8 w-8" variant={'outline'} size={'icon'} >ds</Button>
              <Button className="h-8 w-8"onClick={handleFullscreen} variant="outline" size={'icon'}>
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
          
              </div>
            </div>

            </div>

            <TabsContent value="all" className="h-full ">
           
 <div className="flex  flex-col  h-full ">
 <div className="  px-4 md:px-8 mb-4">
            
 {theme == 'dark' ? (
         <div className="h-6 mb-4">{version?(<LogoConecteeWhite/>):(<LogoIaposWhite/>)}</div>
       ):(
        <div className="h-6 mb-4">{version?(<LogoConectee/>):(<LogoIapos/>)}</div>
       )}
                        <h1 className={`  ${totalSelecionado != null ? ('max-w-[800px]'):('max-w-[500px]')} text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block mb-3`}>
                          Todos os artigos mais{" "}
                            <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
                            recentes
                            </strong>{" "}
                            {totalSelecionado != null ? (totalSelecionado.dep_nom):('da instituição')}
                        </h1>

                    </div>


                  <div className="flex flex-col gap-8">
                  <div>

                  <div className=" px-4 md:px-8 py-4">
                 <HeaderResultTypeHome title="Artigos mais recentes" icon={<Quotes size={24} className="text-gray-400" />}>
                 </HeaderResultTypeHome>
                 </div>
<InfiniteMovingProductions
        items={producoes} // Formata cada item como um objeto
        direction="right"
        speed='normal'
        pauseOnHover={false}
        className="custom-class"
      />

</div>

                  <div>
                 <div className=" px-4 md:px-8 py-4">
                 <HeaderResultTypeHome title="Pesquisadores" icon={<Users size={24} className="text-gray-400" />}>
                 </HeaderResultTypeHome>
                 </div>
                  
                   </div>

<div>

<div className="px-4 md:px-8 py-4">
                 <HeaderResultTypeHome title="Artigos mais recentes" icon={<Quotes size={24} className="text-gray-400" />}>
                 </HeaderResultTypeHome>
                 </div>


</div>
                  </div>
     
 </div>

                  
            </TabsContent>

           
          </Tabs>

          {isFullscreen && (
            <PopUpAnuncio/>
          )}
        </main>
    )
}