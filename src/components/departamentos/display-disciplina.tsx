import { ChevronLeft, ChevronRight, Copy, CreditCard, Hash, MoreVertical, Truck } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { Alert } from "../ui/alert";
import { Progress } from "../ui/progress";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import axios from 'axios';
import { useModal } from "../hooks/use-modal-store";
import { useNavigate } from "react-router-dom";
import { ChartBar } from "phosphor-react";

interface Disciplinas {
  semester: string;
  department: string;
  academic_activity_code: string;
  academic_activity_name: string;
  academic_activity_ch: number;
  demanding_courses: string;
  oft: string;
  id: string;
  available_slots: number;
  occupied_slots: string;
  percent_occupied_slots: number;
  schedule: string;
  language: string;
  researcher_id: (string | null)[];// Altere de string para string[] para refletir a lista de IDs
  researcher_name: string[]; // Altere de string para string[] para refletir a lista de nomes
  status: string;
  workload: number[];
}

interface ProfessorImageProps {
  name: string;
}

const ProfessorImage: React.FC<ProfessorImageProps> = ({ name }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const formatNameForUrl = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z-]/g, '');
    };

    const fetchImage = async () => {
      try {
        const formattedName = formatNameForUrl(name);
        const url = `https://somos.ufmg.br/professor/${formattedName}`;

        const response = await fetch(url, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*', // Este cabeçalho normalmente é configurado no servidor
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const html = await response.text(); // Obtendo o conteúdo HTML como texto

        // Regex para extrair a URL da imagem
        const imgRegex = /<img[^>]+src="([^">]+)"[^>]*style="width:\s*80%;\s*border-radius:\s*15px;"/i;
        const matches = imgRegex.exec(html);

        if (matches && matches[1]) {
          setImageUrl(matches[1]);
        } else {
          setError('Imagem não encontrada');
        }
      } catch (error) {
        setError('Erro ao carregar a imagem');
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [name]);

  if (loading) {
    return <p>Carregando imagem...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return <img src={imageUrl} alt={name} style={{ width: '80%', borderRadius: '15px' }} />;
};

export function DisplayDisciplina(props: Disciplinas) {

  const { urlGeral } = useContext(UserContext)


  const { onOpen } = useModal();

  const navigate = useNavigate()

  const formatNameForUrl = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^a-z-]/g, '');
  };




  const handleSubmit = (researcher_id: string, index: number, item: string) => {
    const formattedName = formatNameForUrl(item);
    const urlSomos = `https://somos.ufmg.br/professor/${formattedName}`;

    if (item) {
      onOpen('researcher-modal', { name: item })
    } else (


      window.open(urlSomos, '_blank')
    )
  }

  // Crie um array de objetos contendo nome, id e carga horária
  const researchers = props.researcher_name.map((name, index) => ({
    name,
    id: props.researcher_id[index],
    workload: props.workload[index],
  }));

  // Use um Set para garantir unicidade com base no nome do pesquisador
  const uniqueResearchers = [
    ...new Map(researchers.map((item) => [item.name, item])).values(),
  ];



  // Calcule a soma total do workload
  const totalWorkload = uniqueResearchers.reduce((sum, researcher) => sum + researcher.workload, 0);

  // Verifique se a soma do workload é diferente de academic_activity_ch
  if (totalWorkload !== props.academic_activity_ch) {
    // Divida o academic_activity_ch pela quantidade de pesquisadores
    const equalWorkload = props.academic_activity_ch / uniqueResearchers.length;

    // Atualize o workload de cada pesquisador
    uniqueResearchers.forEach((researcher) => {
      researcher.workload = equalWorkload;
    });
  }

  return (
    <div className=" sticky top-8">
      <div
        className={`h-3 w-full rounded-t-md dark:border-neutral-800 border border-neutral-200 border-b-0 ${(props.occupied_slots === "" || props.occupied_slots === "0") ? "bg-red-500" : "bg-green-500"
          } `}
      ></div>
      <Alert
        className="p-0 rounded-t-none" x-chunk="dashboard-05-chunk-4"
      >
        <CardHeader className="flex flex-row items-start bg-neutral-100 dark:bg-neutral-800">
          <div className="grid gap-0.5">
            <CardTitle className="group flex items-center w-fit gap-2 text-lg">
              <div className="w-fit">{props.academic_activity_name}</div>
              <Button
                size="icon"
                variant="outline"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy Order ID</span>
              </Button>
            </CardTitle>
            <CardDescription className="flex gap-2 items-center"><Hash size={12} />{props.academic_activity_code}</CardDescription>
          </div>
          <div className="ml-auto flex items-center gap-1">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2 items-center"><ChartBar size={16} />Porcentagem de vagas ocupadas por semestre </DropdownMenuItem>
                <DropdownMenuItem>Export</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Trash</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </CardHeader>

        <CardContent className="p-6 text-sm">
          <div className="flex items-center gap-4 mb-6">
            <Progress
              className={`h-2  `}
              max={100}
              value={((Number(props.occupied_slots) / props.available_slots) * 100) >= 100 ? 100 : ((Number(props.occupied_slots) / props.available_slots) * 100)}
            />
            <p className="text-xs">
              {((Number(props.occupied_slots) / props.available_slots) * 100).toFixed(1)}%
            </p>

          </div>

          <div className="grid gap-3">
            <div className="font-semibold">Detalhes da disciplina</div>
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Carga horária
                </span>
                <span>{props.academic_activity_ch}h</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Status
                </span>
                <span>{props.status}</span>
              </li>

              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Departamento
                </span>
                <span className="text-right">{props.department}</span>
              </li>
            </ul>
            {props.schedule != "" && (
              <div>
                <div className="my-6 border-b dark:border-b-neutral-800" />
                <ul className="grid gap-3">
                  {props.schedule.split("\n").map((course, i) => {
                    // Verifique se a linha não está vazia
                    if (!course.trim()) return null;

                    // Expressão regular para capturar um ou mais horários seguidos do dia
                    const match = course.match(/((?:\d{2}:\d{2} ?)+)\((\w{3})\)/);

                    if (match) {
                      const times = match[1].trim().replace(/ /g, " - ");
                      const day = match[2];

                      return (
                        <li key={i} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{day}</span>
                          <span>{times}</span>
                        </li>
                      );
                    }

                    return null;
                  })}


                </ul>
              </div>
            )}
          </div>
          <div className="my-6 border-b dark:border-b-neutral-800" />
          <div className="grid  gap-4">
            <div className="grid gap-3">
              <div className="font-semibold">Cursos demandantes</div>
              <address className="grid gap-0.5 not-italic text-muted-foreground">

                {
                  [...new Set(props.demanding_courses.split(",").map(course => course.trim()))].map((course, i) => (
                    <div
                      key={i}
                      className="flex gap-1 text-sm items-center text-gray-500 font-medium"
                    >
                      <span>{course}</span>
                    </div>
                  ))
                }
              </address>
            </div>

          </div>

          {uniqueResearchers.filter((researcher) => researcher.name.trim() !== "").length != 0 && (
            <div className="my-6 border-b dark:border-b-neutral-800" />
          )}



          <div className="grid gap-3">
            {uniqueResearchers.filter((researcher) => researcher.name.trim() !== "").length != 0 && (
              <div className="font-semibold">Docentes</div>
            )}
            <dl className="grid gap-3">
              {
                uniqueResearchers
                  .filter((researcher) => researcher.name.trim() !== "") // Filtra nomes não vazios
                  .map((researcher, index) => (
                    <div
                      onClick={() => {
                        if (researcher.name) {
                          handleSubmit(researcher.id || "", index, researcher.name);
                        }
                      }}
                      key={index}
                      className={`flex items-center gap-6 ${researcher.name.length != 0 && "cursor-pointer"
                        }  justify-between`}
                    >
                      <dt className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-8 h-8">
                          <img src={`${urlGeral}ResearcherData/Image?name=${researcher}`} alt="" className="w-full h-full object-cover rounded-md " />
                        </div>
                        <dd>{researcher.name}</dd>
                      </dt>
                      <dd className="text-right">
                        {(researcher.workload / 15) || 0}h/aula (semanal)
                      </dd>
                    </div>
                  ))
              }
            </dl>
          </div>
        </CardContent>
        <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            Ano e semestre: {props.semester}
          </div>



        </CardFooter>
      </Alert>
    </div>
  )
}