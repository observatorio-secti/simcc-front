import { useContext, useEffect, useState } from "react";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { useQuery } from "../tabelas/tabela-artigos";
import { PalavrasChaves } from "../../../graduate-program/homepage-program";
import { UserContext } from "../../../../context/context";
import { Alert } from "../../../ui/alert";
import { CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import { Info } from "lucide-react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HC_wordcloud from 'highcharts/modules/wordcloud';

HC_wordcloud(Highcharts);

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function NuvemPalavraSection (props:Props) {
  const queryUrl = useQuery();

  const graduate_program_id = queryUrl.get('graduate_program_id');
  const group_id = queryUrl.get('group_id');
  const dep_id = queryUrl.get('dep_id');
const {urlGeral} = useContext(UserContext)
    //palavars
    const [words, setWords] = useState<PalavrasChaves[]>([]);
    let urlPalavrasChaves = `${urlGeral}lists_word_researcher?graduate_program_id=${graduate_program_id || ''}&researcher_id=&dep_id=${dep_id || ''}`
  
    useEffect(() => {
      const fetchData = async () => {
  
        try {
          const response = await fetch(urlPalavrasChaves, {
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
            setWords(data);
          }
        } catch (err) {
          console.log(err);
        } finally {
  
        }
      };
      fetchData();
    }, []);
  
    const options = {
      chart: {
        backgroundColor: 'transparent',
        height: '300px',
        display: 'flex',
        position: 'relative'
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: false, // Remove a opção de menu para baixar o gráfico
      },
      series: [
        {
          type: 'wordcloud',
          data: words.map((word) => ({
            name: word.term,
            weight: word.among,
          })),
  
          style: {
            fontFamily: 'Ubuntu, sans-serif',
          },
        },
      ],
      title: {
        text: '',
      },
      plotOptions: {
        wordcloud: {
          borderRadius: 3,
          borderWidth: "1px",
          borderColor: 'blue',
          BackgroundColor: 'red',
          colors: ['#9CBCCE', '#284B5D', '#709CB6'],
  
        },
      },
    };
    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
             
             <Alert className="h-full min-w-[40%]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium">
                  Nuvem de palavras
                </CardTitle>
                <CardDescription>Termos mais presentes nos artigos</CardDescription>
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>
                    <p>Fonte: Plataforma Lattes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

            </CardHeader>
            <div id="nuveeeem" className="flex w-full justify-center items-center">
              <HighchartsReact highcharts={Highcharts} options={options} className={'h-full'} />
            </div>
          </Alert>
        </Base>
    )
}