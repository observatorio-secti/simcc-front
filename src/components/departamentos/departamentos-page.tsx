import { Link, useLocation, useNavigate } from "react-router-dom";
import { VisualizacaoDepartamento } from "./visualizacao-departamento";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";
import { MagnifyingGlass, Rows, SquaresFour } from "phosphor-react";
import { Input } from "../ui/input";
import { ArrowRight, Building, ChevronDown, ChevronUp, Download, File, GraduationCap, Hash, Info, Mail, Phone, SlidersHorizontal } from "lucide-react";
import { cn } from "../../lib"
import { Button } from "../ui/button";
import bg_graduate from '../../assets/bg_graduate.png'
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Helmet } from "react-helmet";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { DataTable } from "../popup/columns/popup-data-table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
interface Departamentos {
  dep_id: string
  org_cod: string
  dep_nom: string
  dep_des: string
  dep_email: string
  dep_site: string
  dep_tel: string
  img_data: string
  dep_sigla: string
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

export function DepartamentPage() {
  const [total, setTotal] = useState<Departamentos[]>([]);
  const [totalSelecionado, setTotalSelecionado] = useState<Departamentos | null>(null);

  const queryUrl = useQuery();
  const type_search = queryUrl.get('dep_id');
  const [, setIsLoading] = useState(false)


  let departamentoSelecionado = type_search || ''

  const { urlGeralAdm, urlGeral } = useContext(UserContext)

  const [search, setSearch] = useState('')

  const urlPatrimonioInsert = `${urlGeralAdm}departamentos`
  const [jsonData, setJsonData] = useState<any[]>([]);


  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () => {

      try {

        const response = await fetch(urlPatrimonioInsert, {
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
          setJsonData(data)
          setIsLoading(false)
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData()


  }, [urlPatrimonioInsert]);

  const filteredTotal = Array.isArray(total) ? total.filter(item => {
    // Normaliza a string do item e da busca para comparação
    const normalizeString = (str: any) => str
      .normalize("NFD") // Decompõe os caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos
      .toLowerCase(); // Converte para minúsculas

    const searchString = normalizeString(item.dep_nom);
    const normalizedSearch = normalizeString(search);

    return searchString.includes(normalizedSearch);
  }) : [];


  const navigate = useNavigate();

  const handlePesquisaFinal = (dep_id: string) => {
    queryUrl.set('dep_id', dep_id);
    navigate({
      pathname: '/departamentos',
      search: queryUrl.toString(),
    });
  }

  const [isOn, setIsOn] = useState(true);

  const { version } = useContext(UserContext)



  const convertJsonToCsv = (json: any[]): string => {
    const items = json;
    const replacer = (_: string, value: any) => (value === null ? '' : value); // Handle null values
    const header = Object.keys(items[0]);
    const csv = [
      '\uFEFF' + header.join(';'), // Add BOM and CSV header
      ...items.map((item) =>
        header.map((fieldName) => JSON.stringify(item[fieldName], replacer)).join(';')
      ) // CSV data
    ].join('\r\n');

    return csv;
  };

  const handleDownloadJson = async () => {
    try {
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], { type: 'text/csv;charset=windows-1252;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `dados.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

   const items = Array.from({ length: 12 }, (_, index) => (
      <Skeleton key={index} className="w-full rounded-md h-[300px]" />
    ));

    const [loading, setLoading] = useState(false);


    const [typeVisu, setTypeVisu] = useState('block');


  return (
    <>
      {departamentoSelecionado.length == 0 ? (
        <div className="w-full">
          <Helmet>
            <title>Departamentos | {version ? ('Conectee') : ('Simcc')}</title>
            <meta name="description" content={`Departamentos | ${version ? ('Conectee') : ('Simcc')}`} />
            <meta name="robots" content="index, follow" />
          </Helmet>
          <main className="  ">

          <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
<div className={`w-full px-8  border-b border-b-neutral-200 dark:border-b-neutral-800`}>


          {isOn && (
           <div className="w-full   flex justify-between items-center">
 
                      <div className="w-full pt-4  flex justify-between items-center">
                          <Alert className="h-14 mt-4 mb-2  p-2 flex items-center justify-between  w-full">
          <div className="flex items-center gap-2 w-full flex-1">
            <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
            <Input onChange={(e) => setSearch(e.target.value)} value={search} type="text" className="border-0 w-full " />
          </div>
        </Alert>
                      </div>
                         </div>
                    )}

<div className={`flex w-full flex-wrap pt-2 pb-3 justify-between `}>
                    <div>

                    </div>

                    <div className="hidden xl:flex xl:flex-nowrap gap-2">
                <div className="md:flex md:flex-nowrap gap-2">
                  <Link to={`${urlGeral}dictionary.pdf`} target="_blank">
                  <Button variant="ghost" className="">
                    <File size={16} className="" />
                    Dicionário de dados
                  </Button>
                  </Link>
                  <Button onClick={() => handleDownloadJson()} variant="ghost" className="">
                    <Download size={16} className="" />
                    Baixar resultado
                  </Button>
                </div>

                <div>

                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOn(!isOn)}>
                  {isOn ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
                  </div>

                  </div>

                  </div>

                  <div className="mt-8 px-4 md:px-8">
                  <Alert className={`p-0 mb-6 bg-cover bg-no-repeat bg-center `}  >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de departamentos
                  </CardTitle>
                  <Building className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{filteredTotal.length}</div>
                  <p className="text-xs text-muted-foreground">
                    encontrados na busca
                  </p>
                </CardContent>
              </Alert>

              <Accordion defaultValue="item-1" type="single" collapsible>
                <AccordionItem value="item-1">
                  <div className="flex mb-2">
                    <HeaderResultTypeHome title="Programas de pós-graduação" icon={<GraduationCap size={24} className="text-gray-400" />}>
                      <div className="hidden md:flex gap-3 mr-3">
                        <Button onClick={() => setTypeVisu('rows')} variant={typeVisu === 'block' ? 'ghost' : 'outline'} size={'icon'}>
                          <Rows size={16} className="whitespace-nowrap" />
                        </Button>
                        <Button onClick={() => setTypeVisu('block')} variant={typeVisu === 'block' ? 'outline' : 'ghost'} size={'icon'}>
                          <SquaresFour size={16} className="whitespace-nowrap" />
                        </Button>
                      </div>
                    </HeaderResultTypeHome>
                    <AccordionTrigger>

                    </AccordionTrigger>
                  </div>
                  <AccordionContent>
                    {typeVisu === 'block' ? (
                      loading ? (
                        <ResponsiveMasonry
                          columnsCountBreakPoints={{
                            350: 2,
                            750: 3,
                            900: 4,
                            1200: 6,
                            1500: 6,
                            1700: 7
                          }}
                        >
                          <Masonry gutter="16px">
                            {items.map((item, index) => (
                              <div className="w-full" key={index}>{item}</div>
                            ))}
                          </Masonry>
                        </ResponsiveMasonry>
                      ) : (
                        <ResponsiveMasonry
              columnsCountBreakPoints={{
                350: 1,
                750: 2,
                900: 2,
                1200: 3,
                1700: 4
              }}
            >
              <Masonry gutter="16px" className="w-full">
                {filteredTotal.map((item) => (
                  <div className="flex" onClick={() => handlePesquisaFinal(item.dep_id)} >
                    <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 bg-center  bg-[#719CB8]  bg-no-repeat backdrop-blur-xl  border min-h-[120px]  border-neutral-200 border-r-0 bg-  relative `} ></div>

                    <button

                      className={cn(
                        `flex flex-col rounded-lg w-full rounded-l-none  dark:border-neutral-700 items-start gap-2  border p-3 text-left text-sm transition-all hover:bg-accent`,
                      )}

                    >

                      <div className="flex justify-between items-center w-full">
                        <div className="text-xs font-medium mb-2 flex items-center gap-2">{item.dep_id}
                        </div>
                        <Building size={16} />
                      </div>

                      <div className="flex justify-between w-full items-center">
                        <div className="flex w-full flex-col">
                          <div className="flex w-full flex-col gap-1">
                            <div>
                              <img className="h-12 mix-blend-multiply" src={`data:image/jpeg;base64,${item.img_data}`} />
                            </div>
                            <div className="flex items-center">
                              <div className="flex items-center gap-2">
                                <div className="font-semibold text-lg">{item.dep_sigla} - {item.dep_nom}</div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap line-clamp-2 text-xs text-muted-foreground gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Hash size={12} />{item.org_cod}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Mail size={12} />{item.dep_email}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Phone size={12} />{item.dep_tel}</div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
                      )
                    ) : (
                      loading ? (
                        <Skeleton className="w-full rounded-md h-[400px]" />
                      ) : (
                      <div>

                      </div>
                      )
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
                  </div>

           

          </main>
        </div>
      ) : (

        <VisualizacaoDepartamento />
      )}
    </>
  )
}