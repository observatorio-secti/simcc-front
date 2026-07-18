import { useContext, useEffect, useMemo, useState } from "react";

type Grafico = {
  id: string
}

interface PalavrasChaves {
  term: string;
  among: number;
}

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";
import HC_wordcloud from 'highcharts/modules/wordcloud';
import { Weight } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

HC_wordcloud(Highcharts);


export function NuvemPalavras(props: Grafico) {
  // gráfico
  const [words, setWords] = useState<PalavrasChaves[]>([]);
  const { urlGeral } = useContext(UserContext)
  const urlPalavrasChaves = useMemo(() =>
    `${urlGeral}lists_word_researcher?researcher_id=${props.id}`,
    [urlGeral, props.id]
  );


  // Memoize options para evitar recálculos desnecessários
  const options2 = useMemo(() => ({
    chart: {
      backgroundColor: 'transparent',
      height: '300px',
      display: 'flex',
      position: 'relative'
    },
    exporting: {
      enabled: false,
    },
    credits: {
      enabled: false
    },
    series: [
      {
        type: 'wordcloud',
        data: words.map((word) => ({
          name: word.term,
          weight: word.among,
        })),
        style: {
          fontFamily: 'Lexend, sans-serif',
          weight: '200',
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
  }), [words]);

  const [isLoading, setIsloading] = useState(false)

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {

      try {
        setIsloading(true)
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
        if (data && isMounted) {
          setWords(data);
          setIsloading(false)
        }
      } catch (err) {
        console.log(err);
        setIsloading(false)
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [urlPalavrasChaves]); // Dependência memoizada

  return (
    <div className="w-full">
      <div className="text-left mb-6 font-medium text-2xl">Palavras-chaves mais recorrentes</div>
      <Alert className="mb-6">
        {isLoading ? (
          <Skeleton className="h-[300px] rounded-md" />
        ) : (
          <HighchartsReact highcharts={Highcharts} options={options2} />
        )}
      </Alert>
    </div>
  )
}