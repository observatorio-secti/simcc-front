import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { SquareArrowOutUpRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";

export function IndicatorsGraduate() {
    const { version } = useContext(UserContext)

    let url = 'https://app.powerbi.com/view?r=eyJrIjoiNTUwYTBmMGYtMDY0Mi00OTlmLWJjZDctODJhY2QyNTIyNTg1IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9'

    if (!version) {
        url = 'https://app.powerbi.com/view?r=eyJrIjoiZWYwOGJjZjctMjUwZi00MmViLTllYzQtNGI5OTgxMzVhMjFmIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9&pageName=ReportSection309e0a94f2ddc295a361'
    }
    const [value, setValue] = useState('article')
    let url2 = 'https://app.powerbi.com/view?r=eyJrIjoiN2FkNjkzMmMtYjZmNy00MjY1LWFjNDktNzE3MWFiNjljZDhkIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9'

    if (!version) {
        url2 = 'https://app.powerbi.com/view?r=eyJrIjoiMjA2NzFlMDEtNGQ2My00MzgzLTk5OTUtNjhmNzZkMmU1MGI4IiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9'
    }
    return (
        <main className="flex flex-1 flex-col gap-4  px-4 md:px-8 ">


            <div className="lg:max-w-[900px]  mt-2">


                <h1 className="max-w-[550px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block mb-3">
                    Confira as {" "}
                    <strong className="bg-[#709CB6] rounded-md px-3 pb-2 text-white font-medium">
                        estatísticas de produção
                    </strong>{" "}
                    do programa
                </h1>
                <p className="max-w-[600px] text-lg font-light text-foreground">
                    Produção bibliográfica e técnica, grupos de pesquisa, bolsistas de proatividade e dados sociais da Escola.
                </p>

            </div>

            <Tabs defaultValue="article" value={value} className="pb-4 md:pb-8">
                <div className="flex w-full justify-between items-center mb-4 mt-8">
                    <TabsList className="">
                        <TabsTrigger
                            value="article"
                            onClick={() => setValue('article')}
                            className="flex gap-2 items-center"
                        >
                            Produção geral
                        </TabsTrigger>

                        <TabsTrigger
                            value="2"
                            onClick={() => setValue('2')}
                            className=" gap-2 items-center"
                        >
                            Discentes
                        </TabsTrigger>
                    </TabsList>


                    <div>
                        <Link target="_blank" to={value == 'article' ? url : url2}> <Button size={'sm'}><SquareArrowOutUpRight size={12} /> Abrir em outra página</Button></Link>
                    </div>
                </div>
                <TabsContent value="article">
                    <div className="w-full h-screen flex  rounded-md">
                        <iframe
                            title="Report Section"
                            className="w-full h-screen rounded-md mb-8 border dark:border-neutral-800 "
                            src={url}
                        ></iframe>
                    </div>
                </TabsContent>

                <TabsContent value="2">
                    <div className="w-full h-screen flex  rounded-md">
                        <iframe
                            title="Report Section"
                            className="w-full h-screen rounded-md mb-8 border dark:border-neutral-800 "
                            src={url2}
                        ></iframe>
                    </div>
                </TabsContent>
            </Tabs>
        </main>
    )
}