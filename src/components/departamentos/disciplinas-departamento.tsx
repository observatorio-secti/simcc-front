import { Clock, Hash, Plus, Presentation } from "lucide-react";
import { Button } from "../ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

import { DisplayDisciplina } from "./display-disciplina";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { MagnifyingGlass } from "phosphor-react";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Alert } from "../ui/alert";
import { Progress } from "../ui/progress";
import bg_popup from '../../assets/bg_popup.png';

interface Props {
    dep_id: string
}

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


export function DisciplinasDepartamentoPage(props: Props) {
    const [data, setData] = useState<Disciplinas[]>([]);
    const [dataSelecionado, setDataSelecionado] = useState<Disciplinas | null>(null);

    const { urlGeralAdm, urlGeral } = useContext(UserContext)
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


    const combinedFilteredTotal = combineItems(filteredTotal);
    const combinedFilteredTotalLenght = combineItems(data);

    const [count, setCount] = useState(12);

    const uniqueDisciplines = [...new Set(filteredTotal.map(d => d.academic_activity_name).filter(name => name.length !== 0))];
    const uniqueCursos = [...new Set(data.flatMap(d => d.demanding_courses.split(',').map(discipline => discipline.trim())).filter(name => name.length !== 0))];
    const uniqueProfessors = [...new Set(filteredTotal.flatMap(d => d.researcher_name).filter(name => name.length !== 0))];


    console.log(combinedFilteredTotal)
    return (
        <main className="grid flex-1 items-start gap-4  md:gap-8 lg:grid-cols-3 xl:grid-cols-3 px-4 md:px-8 pb-4 md:pb-8">
            <div className={`grid auto-rows-max items-start gap-4 md:gap-8 ${dataSelecionado ? ('lg:col-span-2') : ('lg:col-span-3')}`}>

                <div className="grid gap-4 mt-8 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    <Alert className="p-0 bg-cover bg-no-repeat bg-center lg:col-span-2" style={{ backgroundImage: `url(${bg_popup})` }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de disicplinas
                            </CardTitle>
                            <Presentation className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{combinedFilteredTotalLenght.length}</div>
                            <div className="flex items-center gap-3">
                                <p className="text-xs text-muted-foreground">
                                    do departamento
                                </p>


                            </div>
                        </CardContent>
                    </Alert>

                    <Alert className={`p-0 bg-cover bg-no-repeat bg-center`}  >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total de carga horária
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold"></div>
                            <p className="text-xs text-muted-foreground">
                                do departamento
                            </p>
                        </CardContent>
                    </Alert>
                </div>

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
                        1200: dataSelecionado ? 3 : 4,
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
                                                    <div key={index} className={`flex items-center ${props.researcher_id[index] && ('cursor-pointer')} cursor-pointer justify-between`}>
                                                        <dt className="flex items-center gap-2 text-muted-foreground">


                                                            <div className="w-6 h-6">
                                                                <img src={`${urlGeral}ResearcherData/Image?name=${item}`} alt="" className="w-full h-full object-cover rounded-md " />
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

            {dataSelecionado && (
                <DisplayDisciplina
                    semester={dataSelecionado.semester}
                    department={dataSelecionado.department}
                    academic_activity_code={dataSelecionado.academic_activity_code}
                    academic_activity_name={dataSelecionado.academic_activity_name}
                    academic_activity_ch={dataSelecionado.academic_activity_ch}
                    demanding_courses={dataSelecionado.demanding_courses}
                    oft={dataSelecionado.oft}
                    id={dataSelecionado.id}
                    available_slots={dataSelecionado.available_slots}
                    occupied_slots={dataSelecionado.occupied_slots}
                    percent_occupied_slots={dataSelecionado.percent_occupied_slots}
                    schedule={dataSelecionado.schedule}
                    language={dataSelecionado.language}
                    researcher_id={dataSelecionado.researcher_id} // Alterado para string[]
                    researcher_name={dataSelecionado.researcher_name} // Alterado para string[]
                    status={dataSelecionado.status}
                    workload={dataSelecionado.workload}
                />
            )}
        </main>
    )
}
