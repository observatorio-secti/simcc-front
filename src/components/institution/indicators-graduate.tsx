import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { useQuery } from "../dashboard/builder-page/tabelas/tabela-artigos";
import { ChartBar, Student } from "phosphor-react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function IndicatorsGraduate() {
    const { version } = useContext(UserContext)

    let url = 'https://app.powerbi.com/view?r=eyJrIjoiNTUwYTBmMGYtMDY0Mi00OTlmLWJjZDctODJhY2QyNTIyNTg1IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9'

    if (!version) {
        url = 'https://app.powerbi.com/view?r=eyJrIjoiZWYwOGJjZjctMjUwZi00MmViLTllYzQtNGI5OTgxMzVhMjFmIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9&pageName=ReportSection309e0a94f2ddc295a361'
    }

    let url2 = 'https://app.powerbi.com/view?r=eyJrIjoiN2FkNjkzMmMtYjZmNy00MjY1LWFjNDktNzE3MWFiNjljZDhkIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9'

    if (!version) {
        url2 = 'https://app.powerbi.com/view?r=eyJrIjoiMjA2NzFlMDEtNGQ2My00MzgzLTk5OTUtNjhmNzZkMmU1MGI4IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9'
    }

     const queryUrl = useQuery();
                    
    const tab = queryUrl.get('tab_ind');
    

    const tabs = [


        { id: "indicadores", label: "Indicadores de avaliação", icon: ChartBar, condition: !version, link: 'https://app.powerbi.com/view?r=eyJrIjoiYTk2YmEwNjctMGM5Zi00Mzg5LTlhNjItYzA1NWM1YWMxMjNjIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9' },
      
    
        
        { id: "indicadores_conectee", label: "Indicadores de avaliação", icon: ChartBar, condition: version, link: 'https://app.powerbi.com/view?r=eyJrIjoiNTUwYTBmMGYtMDY0Mi00OTlmLWJjZDctODJhY2QyNTIyNTg1IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9' },
 
    
        ];

        const [value, setValue] = useState(
            tab || tabs.find((tab) => tab.condition)?.id || tabs[0].id
          );
          
      
const navigate = useNavigate();

    const updateFilters = (category: string, values: any) => {
    if (values  ) {
        
        queryUrl.set(category, values);
        
    } else {
        queryUrl.delete(category)
    }
    
    };

    const location = useLocation();

    
                useEffect(() => {
                console.log("typeResult mudou para:", value);
                    updateFilters("tab_ind", value );
            
                    navigate({
                    pathname: location.pathname,
                    search: queryUrl.toString(),
                })
            
                }, [value]);

                const visibleTabs = tabs.filter(tab => tab.condition === undefined || tab.condition);

                const currentTab = visibleTabs.find(tab => tab.id === value);

    return (
        <main className=" ">


            <Tabs defaultValue="article" value={value} className="">
               
                 <div className="sticky top-[68px]  z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
                              <div className={`w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                              
                                <div className={`flex pt-2 gap-8 justify-between   `}>
                                  <div className="flex items-center gap-2">
                                  <div className="relative grid grid-cols-1">
                  <ScrollArea className="relative overflow-x-auto">
                  <TabsList className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
      {tabs.map(
        ({ id, label, icon: Icon, condition = true }) =>
          condition && (
            <div
              key={id}
              className={`pb-2 border-b-2 text-black dark:text-white transition-all ${
                value === id ? "border-b-[#719CB8]" : "border-b-transparent"
              }`}
              onClick={() => {
                setValue(id)
                queryUrl.set("page", '1');

    navigate({
      pathname: location.pathname,
      search: queryUrl.toString(),
    });

              }}
            >
              <Button variant="ghost" className="m-0">
                <Icon size={16} />
                {label}
              </Button>
            </div>
          )
      )}
    </TabsList>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                
                 
                </div>
                
                       
                                   
                                  </div>
                                  <div className="hidden xl:flex xl:flex-nowrap gap-2">
                                <div className="md:flex md:flex-nowrap gap-2">
                                
          {currentTab?.id != 'home' && (
           <Link target="_blank" to={currentTab?.link || ''}>
           <Button  variant={'ghost'}>
             <SquareArrowOutUpRight size={12} /> Abrir em outra página
           </Button>
         </Link>
         )}
                                
                                </div>
                
                               
                              </div>
                
                             
                
                                </div>
                              </div>
                            
                            </div>

              

                {visibleTabs.map((tab) => (
    <TabsContent key={tab.id} value={tab.id} className="w-full p-4 md:p-8">
  <div className="w-full h-screen flex rounded-md">
            <iframe
              title={tab.label}
              className="w-full h-screen rounded-md mb-8 border dark:border-neutral-800"
              src={tab.link}
            ></iframe>
          </div>
    </TabsContent>

))}
            

            </Tabs>
        </main>
    )
}