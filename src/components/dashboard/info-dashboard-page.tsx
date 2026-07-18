import { ChevronLeft, Download, File } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useNavigate } from "react-router-dom";
import { Alert } from "../ui/alert";
import { Helmet } from "react-helmet";
import { useContext } from "react";
import { UserContext } from "../../context/context";

export function InfoDashboardPage() {
    const history = useNavigate();

    const handleVoltar = () => {
      history(-1);
    }

    const docs = [
      {
        name:'Modelo - importação pesquisadores xls',
        des:'Importar os pesquisadores com nome e Id Lattes na página PESQUISADORES para realizar a rotina de extração dos dados',
        doc:'importar-pesquisadores.xls'
      },
      {
        name:'Modelo - importação de dados dos docentes',
        des:'Importar os pesquisadores com nome e Id Lattes na página PESQUISADORES para realizar a rotina de extração dos dados',
        doc:'importar-pesquisadores.xls'
      },
      {
        name:'Modelo - importação de dados dos técnicos',
        des:'Importar os pesquisadores com nome e Id Lattes na página PESQUISADORES para realizar a rotina de extração dos dados',
        doc:'importar-pesquisadores.xls'
      }
    ]
    const {version} = useContext(UserContext)
    return(
        <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-8 p-4">
            <Helmet>
          <title>Informações | Módulo administrativo | {version ? ('Conectee'):('Simcc')} </title>
          <meta name="description" content={`Informações | Módulo administrativo | ${version ? ('Conectee'):('Simcc')}`} />
          <meta name="robots" content="index, follow" />
        </Helmet>
            <Tabs defaultValue={'all'} className="h-full" >
            <div className="w-full mb-8  gap-4  pb-0 md:pb-0">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Informações dashboard
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList >
              <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">Sobre a plataforma</TabsTrigger>
              <TabsTrigger value="doc" className="text-zinc-600 dark:text-zinc-200">Dicionário de dados </TabsTrigger>
                </TabsList>
                <Button size="sm">Button</Button>
              </div>
            </div>

            </div>

            <TabsContent value="all" className="flex flex-col gap-4 md:gap-8">


            </TabsContent>

            <TabsContent value="doc" className="flex flex-col gap-4 md:gap-8">
            <h3 className="text-2xl font-medium ">Modelo de documentos </h3>

             <div className="flex flex-col gap-4 md:gap-8">
              {docs.map((props) => (
                <Alert className="flex w-full justify-between items-center">

                <div className="flex items-center gap-3"><div className="w-12 flex items-center justify-center">
                <File size={16}/>
                </div>
                <div className="flex flex-col">
                <p className="font-medium">{props.name}</p>
                <p className="text-gray-500 text-sm">{props.des}</p>
                </div>
                </div>

                <div>
                  <Button className="w-8 h-8" size={'icon'} variant={'ghost'}><Download size={16}/></Button>
                </div>
              </Alert>
              ))}
             </div>
            </TabsContent>
            </Tabs>
        </main>
    )
}