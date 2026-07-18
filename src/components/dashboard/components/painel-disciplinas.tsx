import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";


import { Alert } from "../../ui/alert";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Plus, Hash, Clock } from "lucide-react";
import { Progress } from "../../ui/progress";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { MagnifyingGlass } from "phosphor-react";
import { useModal } from "../../hooks/use-modal-store";

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
  researcher_id: string[];  // Alterado para string[]
  researcher_name: string[]; // Alterado para string[]
  status: string;
  workload: number[]; // Alterado para number[]
  turmas_juntas?: string; // Novo campo
}


interface Props {
  dep_id: string;
}

export function PainelDisciplinas(props: Props) {
  const [data, setData] = useState<Disciplinas[]>([]);
  const { urlGeralAdm, urlGeral } = useContext(UserContext);
  const [dataSelecionado, setDataSelecionado] = useState<Disciplinas | null>(null);

  let urlDisciplinas = urlGeralAdm + `departamentos/disciplinas?dep_id=${props.dep_id}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlDisciplinas, {
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
          setData(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlDisciplinas]);

  console.log(data)

  const [pesquisaInput, setPesquisaInput] = useState("");
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [selectedDiscipline2, setSelectedDiscipline2] = useState<string>('');
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');

  // Função para normalizar strings
  const normalizeString = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Filtragem dos dados
  const filteredTotal = Array.isArray(data)
    ? data.filter((item) => {
      const searchString = normalizeString(item.academic_activity_name);
      const normalizedSearch = normalizeString(pesquisaInput);

      // Filtro por academic_activity_name
      const matchesName = searchString.includes(normalizedSearch);

      // Filtro por demanding_courses
      const matchesCourse2 = selectedDiscipline2 === '' || item.academic_activity_name === selectedDiscipline2;


      // Filtro por demanding_courses
      const matchesCourse = selectedDiscipline === '' || item.demanding_courses.split(',').map(discipline => discipline.trim()).includes(selectedDiscipline);

      // Filtro por researcher_name
      const matchesProfessor = selectedProfessor === '' || item.researcher_name.includes(selectedProfessor);

      return matchesName && matchesCourse2 && matchesCourse && matchesProfessor;
    })
    : [];



  // Função para combinar itens
  const combineItems = (items: Disciplinas[]) => {
    const combinedItems: Record<string, Disciplinas> = {};

    items.forEach(item => {
      // Crie a chave baseada apenas em researcher_name e schedule
      const key = `${item.schedule}-${item.researcher_name.join(',')}`;

      if (!combinedItems[key]) {
        // Inicialize o item combinado com valores padrão
        combinedItems[key] = {
          ...item,
          researcher_id: [],
          researcher_name: [],
          workload: [],
          academic_activity_ch: 0,
          available_slots: 0,
          occupied_slots: '0',
          percent_occupied_slots: 0,
          demanding_courses: '',
          turmas_juntas: '' // Inicialize o novo campo
        };
      }

      // Combine as informações
      combinedItems[key].researcher_id.push(...item.researcher_id);
      combinedItems[key].researcher_name.push(...item.researcher_name);
      combinedItems[key].workload.push(...item.workload);
      combinedItems[key].academic_activity_ch = item.academic_activity_ch;
      combinedItems[key].available_slots += Number(item.available_slots);
      combinedItems[key].occupied_slots = String(Number(combinedItems[key].occupied_slots) + Number(item.occupied_slots));
      combinedItems[key].percent_occupied_slots = (Number(combinedItems[key].occupied_slots) / combinedItems[key].available_slots) * 100;
      combinedItems[key].demanding_courses = `${combinedItems[key].demanding_courses},${item.demanding_courses}`
      combinedItems[key].turmas_juntas = combinedItems[key].turmas_juntas ? `true` : ''// Atualiza o campo turmas_juntas
    });

    console.log(combinedItems)

    return Object.values(combinedItems);


  };

  const { onOpen } = useModal()
  const combinedFilteredTotal = combineItems(filteredTotal);


  const [count, setCount] = useState(12);

  const uniqueDisciplines = [...new Set(filteredTotal.map(d => d.academic_activity_name).filter(name => name.length !== 0))];
  const uniqueCursos = [...new Set(data.flatMap(d => d.demanding_courses.split(',').map(discipline => discipline.trim())).filter(name => name.length !== 0))];
  const uniqueProfessors = [...new Set(filteredTotal.flatMap(d => d.researcher_name).filter(name => name.length !== 0))];


  return (
    <div>
      <div className="flex gap-3 items-center w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950 dark:placeholder:text-neutral-400">
        <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
        <Input
          className="border-0 p-0 h-9 flex flex-1"
          value={pesquisaInput}
          onChange={(e) => setPesquisaInput(e.target.value)}
        />

        <div className="flex items-center gap-3">
          <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
            <SelectTrigger className="">
              <SelectValue placeholder="Selecione o curso demandante" />
            </SelectTrigger>
            <SelectContent>

              {uniqueCursos.map((discipline) => (
                <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDiscipline2} onValueChange={setSelectedDiscipline2}>
            <SelectTrigger className="">
              <SelectValue placeholder="Selecione a disciplina" />
            </SelectTrigger>
            <SelectContent>

              {uniqueDisciplines.map((discipline) => (
                <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
            <SelectTrigger className="">
              <SelectValue placeholder="Selecione o professor" />
            </SelectTrigger>
            <SelectContent>

              {uniqueProfessors.map((professor) => (
                <SelectItem key={professor} value={professor}>{professor}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </div>
      <ResponsiveMasonry
        columnsCountBreakPoints={{
          350: 1,
          720: 2,
          900: 2,
          1200: 2,
        }}
      >
        <Masonry gutter="16px">
          {combinedFilteredTotal.slice(0, count).map((props, index) => {
            const uniqueResearchers = [
              ...new Map(props.researcher_name.map((item) => [item, item])).values(),
            ];


            return (
              <div onClick={() => setDataSelecionado(props)} className="flex  w-full cursor-pointer" key={index}>
                <div
                  className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${(props.occupied_slots === "" || props.occupied_slots === "0") ? "bg-red-500" : "bg-green-500"
                    }`}
                >
                </div>

                <Alert
                  className="p-0 group rounded-l-none h-auto"
                >
                  <CardHeader className="flex p-4 flex-row items-start bg-neutral-100 dark:bg-neutral-800 rounded-tr-md">
                    <div className="grid gap-0.5">
                      <CardTitle className="group flex items-center w-fit gap-2 text-base">
                        <div className="w-fit">{props.academic_activity_name}</div>
                      </CardTitle>
                      <div className="flex gap-3 flex-wrap">
                        <CardDescription className="flex gap-1 items-center"><Hash size={12} />{props.academic_activity_code}</CardDescription>
                        <CardDescription className="flex gap-1 items-center"><Clock size={12} />{props.academic_activity_ch}h</CardDescription>
                        <CardDescription className="flex gap-1 items-center"><Clock size={12} />{props.status}</CardDescription>
                        {props.turmas_juntas != '' && (
                          <CardDescription className="flex gap-1 items-center"><Clock size={12} />Turmas juntas</CardDescription>
                        )}
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-1">

                    </div>

                  </CardHeader>

                  {(dataSelecionado?.academic_activity_name == props.academic_activity_name && dataSelecionado.demanding_courses == props.demanding_courses && dataSelecionado.schedule == props.schedule) && (
                    <div>
                      <CardContent className="p-6 text-sm">
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

                        {uniqueResearchers.filter((researcher) => researcher.trim() !== "").length != 0 && (
                          <div className="my-6 border-b dark:border-b-neutral-800" />
                        )}
                      </CardContent>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-4 py-2">
                    <div className="flex items-center gap-4 ">
                      <Progress
                        className={`h-2 w-16`}
                        max={100}
                        value={((Number(props.occupied_slots) / props.available_slots) * 100) >= 100 ? 100 : ((Number(props.occupied_slots) / props.available_slots) * 100)}
                      />
                      <p className="text-xs">
                        {((Number(props.occupied_slots) / props.available_slots) * 100).toFixed(1)}%
                      </p>

                    </div>

                    <div className="flex gap-2 items-center">
                      {uniqueResearchers.filter(item => item.trim() !== "").map((item, index) => (
                        <div onClick={() => onOpen('researcher-modal', { name: item })} key={index} className={`flex items-center ${props.researcher_id[index] && ('cursor-pointer')} cursor-pointer justify-between`}>
                          <dt className="flex items-center gap-2 text-muted-foreground">


                            <div className="w-6 h-6">
                              <img src={`${urlGeral}ResearcherData/Image?name=${props.researcher_name}`} alt="" className="w-full h-full object-cover rounded-md " />
                            </div>
                          </dt>

                        </div>
                      ))}
                    </div>

                  </div>

                </Alert>

              </div>
            )
          })}
        </Masonry>
      </ResponsiveMasonry>

      {combinedFilteredTotal.length > count && (
        <div className="w-full flex justify-center ">
          <Button onClick={() => setCount(count + 12)}>
            <Plus size={16} />
            Mostrar mais
          </Button>
        </div>
      )}
    </div>
  );
}
