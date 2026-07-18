import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { LinksPaineis } from "./components/links-paineis";
import { useContext } from "react";
import { UserContext } from "../../context/context";
import { Helmet } from "react-helmet";
import { Button } from "../ui/button";
import { ChevronLeft, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

export function PaineisDadosExternos() {

    const {version} = useContext(UserContext)

    const links = [
        {
        title:"Painel Lattes",
        description:"CNPq",
        link:"http://bi.cnpq.br/painel/formacao-atuacao-lattes/"
        },
     
        {
            title:"Plataforma Sucupira",
            description:"Capes",
            link:"https://sucupira.capes.gov.br/#busca_observatorio"
            },
            {
                title:"Bolsistas CNPq",
                description:"CNPq",
                link:"http://bi.cnpq.br/painel/fomento-cti/index.html"
                },
                {
                    title:"OpenAlex",
                    description:"OpenAlex",
                    link:"https://openalex.org/"
                    },
                    {
                        title:"Currículo Lattes",
                        description:"CNPq",
                        link:"https://buscatextual.cnpq.br/buscatextual/busca.do?metodo=apresentar"
                        },
        
            
                        {
                            title:"Portal de Periódicos da CAPES",
                            description:"CAPES",
                            link:"https://www-periodicos-capes-gov-br.ez27.periodicos.capes.gov.br/index.php/acesso-cafe.html"
                            },
                            
                            {
                                title:"Web of Science",
                                description:"Clarivate",
                                link:"https://access.clarivate.com/login?app=wos&alternative=true&shibShireURL=https:%2F%2Fwww.webofknowledge.com%2F%3Fauth%3DShibboleth&shibReturnURL=https:%2F%2Fwww.webofknowledge.com%2F&roaming=true"
                                },

                                {
                                    title:"Diretório de grupos de pesquisa",
                                    description:"CNPq",
                                    link:"https://lattes.cnpq.br/web/dgp"
                                    },
            
    ]


    const plataformas = [
       

            {
                title:"Propriedade Intelectual",
                description:"INPI",
                link:"https://busca.inpi.gov.br/pePI/servlet/LoginController?action=login"
                },
                ...(version
                    ? [
                        {
                            title:"Somos UFMG",
                            description:"UFMG",
                            link:"https://somos.ufmg.br/"
                            },
                      ]
                    : []),

                   

                        {
                            title:"Scopus",
                            description:"Start exploring",
                            link:"https://www.scopus.com/"
                            },

                            


                                    {
                                        title:"ResearchGate",
                                        description:"Discover scientific",
                                        link:"https://www.researchgate.net/"
                                        },
    ]

       const history = useNavigate();
    
          const handleVoltar = () => {
            history(-1);
          }

    return(
        <main className="flex flex-1 flex-col relative  p-4 md:p-8 ">
 <Helmet>
          <title>Painéis de dados externos | {version ? ('Conectee'):('Simcc')}</title>
          <meta name="description" content={`Painéis de dados externos | ${version ? ('Conectee'):('Simcc')}`} />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <div className="w-full  gap-4 mb-8">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Painéis de dados externos
              </h1>
             

                
            
            </div>

            </div>

           <div className="relative ">
        
<div className="bg-neutral-100 mb-8 flex gap-3 dark:bg-neutral-800 w-full px-8 py-4 rounded-md">
                <div>
                <Info className="h-4 w-4" />
                </div>

                <div>
                <AlertTitle>Atenção!</AlertTitle>
  <AlertDescription>
    Estes são alguns links de fontes de dados públicos que a plataforma acessa de forma autorizada, além de links para outras plataformas com objetivos semelhantes.
  </AlertDescription>

                </div>

              </div>


           <div className="w-full rounded-lg absolute bg-eng-blue h-[270px]"></div>
           </div>


            <div className="md:p-16 p-4 z-[1]">
                <p className="flex-1 mb-8 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 text-white">Base de dados da plataforma</p>

                <div className="relative">
                <ResponsiveMasonry
    columnsCountBreakPoints={{
        350: 1,
        750: 2,
        900: 2,
        1200:  3,
        1500: 4,
        1700: 5
    }}
>

                     <Masonry gutter="16px">
                            {links.map((props) => (
                                <LinksPaineis
                                title={props.title}
                                    description={props.description}
                                    link={props.link}
                                />
                            ))}

                        </Masonry>

                        </ResponsiveMasonry>
                </div>
            </div>

            <div className="md:p-16 p-4 z-[1] pt-0 md:pt-0">
                <p className="flex-1 mb-8 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 ">Outras plataformas</p>

                <div className="relative">
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
                            {plataformas.map((props) => (
                                <LinksPaineis
                                title={props.title}
                                    description={props.description}
                                    link={props.link}
                                />
                            ))}

                        </Masonry>

                        </ResponsiveMasonry>
                </div>
            </div>
        </main>
    )
}