import { useContext, useEffect, useState } from "react";

import { UserContext } from "../../context/context";

import { ScrollArea } from "../ui/scroll-area";

interface PesquisadorProps {
    message:string
}
export function ApacheViewDashboard() {
    const { urlGeralAdm} = useContext(UserContext);
    const [researcher, setResearcher] = useState<PesquisadorProps[]>([]);
    const urlGetApache = urlGeralAdm + `s/hop`;

    const fetchData = async () => {
      try {
        const response = await fetch(urlGetApache, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });

        const data = await response.json();
  
        // Ensure data is an array
        const dataArray = Array.isArray(data) ? data : [data];
  
        if (dataArray && dataArray.length > 0) {
          setResearcher((prevResearcher) => {
            // Check if the last item of the current researcher array is different from the new data
            const lastItem = prevResearcher[prevResearcher.length - 1];
            const newItem = dataArray[dataArray.length - 1];
  
            if (JSON.stringify(lastItem) !== JSON.stringify(newItem)) {
              return [...prevResearcher, ...dataArray];
            }
  
            return prevResearcher;
          });
          console.log('data', researcher);
        }
      } catch (err) {
        console.log(err);
      }
    };
  
    useEffect(() => {
      fetchData(); // Initial fetch
      console.log(researcher);
      const intervalId = setInterval(fetchData, 2000); // Fetch every 2 seconds
  
      return () => clearInterval(intervalId); // Cleanup on component unmount
    }, []);

    


    return(
      <div className="grid gap-4">
      <div className=" bg-neutral-800 rounded-b-xl p-6 ">
        <pre>
    
        

        <ScrollArea className="h-[300px]">
       <code className="grid gap-1 text-sm text-muted-foreground [&_span]:h-4">
       <span className="text-gray-500 text-sm text-muted-foreground">conectee: ~ <span className="text-sky-500">(apachehop)</span>$</span>
        {researcher.map((props) => {
                  return(
                      <span className="text-gray-500 text-sm">conectee: ~ <span className="text-sky-500">(apachehop)</span>$ {props.message}</span>
                  )
              })}
       </code>
         

        </ScrollArea>

           
      
      </pre>
      </div>
      </div>
    )
}