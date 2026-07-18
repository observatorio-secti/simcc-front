import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { useContext, useState } from "react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Alert } from "../../ui/alert";
import { UserContext } from "../../../context/context";
import { Helmet } from "react-helmet";

export function ParametrosPesquisa() {
     const history = useNavigate();
        
            const handleVoltar = () => {
              history(-1);
            }
    
            
            const [tab, setTab] = useState('all')
            const {version} = useContext(UserContext)

    return(
        <main className="flex flex-1 flex-col gap-4  md:gap-8 ">
           <Helmet>
          <title>Parâmetros de pesquisa | Módulo administrativo | {version ? ('Conectee'):('Simcc')} </title>
          <meta name="description" content={`Parâmetros de pesquisa | Módulo administrativo | ${version ? ('Conectee'):('Simcc')}`} />
          <meta name="robots" content="index, follow" />
        </Helmet>
        <Tabs defaultValue={tab} value={tab} className="h-full" >
        <div className="w-full mb-8  gap-4">
       <div className="flex items-center gap-4 p-4 md:p-8 pb-0 md:pb-0">
     
       <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
           <ChevronLeft className="h-4 w-4" />
           <span className="sr-only">Voltar</span>
         </Button>
     
         <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
           Parâmetros de pesquisa
         </h1>
        

           
       
         <div className="hidden items-center gap-2 md:ml-auto md:flex">
         <TabsList >
           
       

        
           </TabsList>
          
     
        
         </div>
       </div>

       </div>

       <TabsContent value="all" className="px-8">
       <Alert className="p-0">
       <CardHeader>
                    <CardTitle>Gerenciamento de Parâmetros</CardTitle>
                    <CardDescription>
                    Veja e edite os filtros de pesquisas habilitados na plataforma
                    </CardDescription>
                  </CardHeader>
               
               <CardContent className="flex mt-6 flex-col gap-4">
                <Button className="w-fit"><Plus size={16}/> Adicionar parâmetro</Button>
               </CardContent>
             </Alert>
       </TabsContent>
        </Tabs>
   </main>
    )
}