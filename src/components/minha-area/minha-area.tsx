

import { ArrowLeftFromLine, ArrowRightFromLine, Blocks, Building2, ChevronsUpDown, ClipboardEdit, FlaskConical, GraduationCap, LayoutDashboard, Lock, Mail, Menu, OctagonAlert, PieChart, SlidersHorizontal, TrendingUp, User, Users, Weight, X } from "lucide-react";
import {
  Sheet,
  SheetContent,

} from "../../components/ui/sheet"

import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { useContext, useMemo, useState } from "react";


import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { ChartLine, Cube, Shield, SignOut } from "phosphor-react";
import { UserContext } from "../../context/context";
import { Tabs, TabsContent } from "../ui/tabs";
import { SegurancaMinhaArea } from "./seguranca-minha-area";
import { LinhaTempoMinhaArea } from "./linha-tempo-minha-area";
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"


type Research = {
  among: number,
  articles: number,
  book: number,
  book_chapters: number,
  id: string,
  name: string,
  university: string,
  lattes_id: string,
  area: string,
  lattes_10_id: string,
  abstract: string,
  city: string,
  orcid: string,
  image: string
  graduation: string,
  patent: string,
  software: string,
  brand: string,
  lattes_update: Date,
  entradanaufmg: Date

  h_index: string,
  relevance_score: string,
  works_count: string,
  cited_by_count: string,
  i10_index: string,
  scopus: string,
  openalex: string,

  subsidy: Bolsistas[]
  graduate_programs: GraduatePrograms[]
  departments: Departments[]
  research_groups: ResearchGroups[]

  cargo: string
  clas: string
  classe: string
  rt: string
  situacao: string
}

interface Bolsistas {
  aid_quantity: string
  call_title: string
  funding_program_name: string
  modality_code: string
  category_level_code: string
  institute_name: string
  modality_name: string
  scholarship_quantity: string
}

interface GraduatePrograms {
  graduate_program_id: string
  name: string
}

interface Departments {
  dep_des: string
  dep_email: string
  dep_nom: string
  dep_id: string
  dep_sigla: string
  dep_site: string
  dep_tel: string
  img_data: string
}

interface ResearchGroups {
  area: string
  group_id: string
  name: string
}


export function MinhaArea() {
  const { onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = (isOpen && typeModal === "minha-area")
  const [expand, setExpand] = useState(true)


  const { user, setUser, setLoggedIn, urlGeral, role, urlGeralAdm, permission, setPermission, setRole } = useContext(UserContext)

  const [tab, setTab] = useState('all')

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setLoggedIn(false);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const urlTermPesquisadores = urlGeral + `researcherName?name=${user?.researcger_name}`;
  console.log(urlTermPesquisadores)
  const [researcher, setResearcher] = useState<Research[]>([]);
  const [, isLoading] = useState(false)

  const history = useNavigate();

  useMemo(() => {
    const fetchData = async () => {
      try {
        isLoading(true)
        const response = await fetch(urlTermPesquisadores, {
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
          setResearcher(data);
          isLoading(false)
        }


      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermPesquisadores]);

  console.log(user)

  const fetchDataPerm = async (role_id: string) => {
    let urlPermission = urlGeralAdm + `s/permission?role_id=${role_id}`
    console.log(urlPermission)
    try {
      const response = await fetch(urlPermission, {
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
        setPermission(data)
        localStorage.setItem('permission', JSON.stringify(data));

      }
    } catch (err) {
      console.log(err);
    }
  };


  //permissoes
  const permissions = {
    hasBaremaAvaliacao: permission.some(perm => perm.permission === 'criar_barema_avaliacao'),
    hasNotificacoes: permission.some(perm => perm.permission === 'enviar_notificacoes'),
    hasVisualizarPesquisadores: permission.some(perm => perm.permission === 'visualizar_pesquisadores'),
    hasVisualizarTodosDepartamentos: permission.some(perm => perm.permission === 'visualizar_todos_departamentos'),
    hasVisualizarTodosProgramas: permission.some(perm => perm.permission === 'visualizar_todos_programas'),
    hasVisualizarGruposPesquisa: permission.some(perm => perm.permission === 'visualizar_grupos_pesquisa'),
    hasVisualizarInct: permission.some(perm => perm.permission === 'visualizar_inct'),
    hasEditarPesosAvaliacao: permission.some(perm => perm.permission === 'editar_pesos_avaliacao'),
    hasVisualizarIndicadoresInstituicao: permission.some(perm => perm.permission === 'visualizar_indicadores_instituicao'),
    hasVisualizarGerenciaModuloAdministrativo: permission.some(perm => perm.permission === 'visualizar_gerencia_modulo_administrativo')
  };

  const accessLinks = [
    { permission: 'hasVisualizarGerenciaModuloAdministrativo', to: '/dashboard/administrativo', icon: <SlidersHorizontal size={16} />, label: 'Administrativo' },
    { permission: 'hasVisualizarTodosDepartamentos', to: '/dashboard/departamentos', icon: <Building2 size={16} />, label: 'Departamentos' },
    { permission: 'hasVisualizarPesquisadores', to: '/dashboard/pesquisadores', icon: <Users size={16} />, label: 'Pesquisadores' },
    { permission: 'hasVisualizarTodosProgramas', to: '/dashboard/programas', icon: <GraduationCap size={16} />, label: 'Programas' },
    { permission: 'hasVisualizarGruposPesquisa', to: '/dashboard/grupos-pesquisa', icon: <Blocks size={16} />, label: 'Grupos de pesquisa' },
    { permission: 'hasVisualizarInct', to: '/dashboard/inct', icon: <FlaskConical size={16} />, label: 'INCT\'s' },
    { permission: 'hasEditarPesosAvaliacao', to: '/dashboard/pesos-avaliacao', icon: <Weight size={16} />, label: 'Pesos de avaliação' },
    { permission: 'hasVisualizarIndicadoresInstituicao', to: '/dashboard/indicadores', icon: <PieChart size={16} />, label: 'Indicadores' },
    { permission: 'hasBaremaAvaliacao', to: '/dashboard/baremas', icon: <ClipboardEdit size={16} />, label: 'Baremas' },
    { permission: 'hasNotificacoes', to: '/dashboard/enviar-notificacoes', icon: <Mail size={16} />, label: 'Enviar notificações' }
  ];
  const location = useLocation();

  return (
    <Sheet open={isModalOpen} onOpenChange={() => {
      onClose()
      setExpand(true)
    }}>
      <SheetContent className={`p-0 dark:bg-neutral-900 dark:border-gray-600 ${expand ? 'w-full md:min-w-[80vw] lg:min-w-[80vw]' : 'lg:min-w-[50vw]'}`}>
        <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-gray-600">

          <div className="flex items-center gap-3">

            <TooltipProvider >
              <Tooltip>
                <TooltipTrigger asChild className="hidden lg:flex">
                  <Button className="h-8 w-8" onClick={() => setExpand(!expand)} variant={'outline'} size={'icon'}>{expand ? (<ArrowRightFromLine size={16} />) : (<ArrowLeftFromLine size={16} />)}</Button>
                </TooltipTrigger>
                <TooltipContent> {expand ? ('Recolher') : ('Expandir')}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="h-8 w-8" variant={'outline'} onClick={() => {
                    onClose()
                    setExpand(true)
                  }} size={'icon'}><X size={16} /></Button>
                </TooltipTrigger>
                <TooltipContent> Fechar</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

        </DialogHeader>

        <div className="relative">
          <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
            <div className="flex flex-col lg:flex-row gap-6 relative ">
              <Tabs defaultValue={tab} value={tab} className="w-full flex flex-1">
                <TabsContent value="all" className="w-full">
                  <div className="flex flex-col flex-1 w-full">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                          Olá, {user?.display_name}
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                          Minha área
                        </h1>
                      </div>

                      <Avatar className="cursor-pointer rounded-md  h-16 w-16">
                        <AvatarImage className={'rounded-md h-16 w-16'} src={`${user?.photo_url}`} />
                        <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="my-6 border-b dark:border-b-neutral-800"></div>

                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-sm"> Você está acessando como </p>
                      <DropdownMenu>
                        <div className={`   `}>
                          <DropdownMenuTrigger className={`flex-1 items-center flex justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all w-fit rounded-md  `}>
                            <Button
                              variant="outline"
                              role="combobox"

                              className="justify-between"
                            >
                              {role != '' ? (role) : (user?.display_name)}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>

                          </DropdownMenuTrigger>
                        </div>

                        <DropdownMenuContent className="min-w-[200px]  gap-1 flex flex-col ">
                          <DropdownMenuLabel>Conta pessoal</DropdownMenuLabel>
                          <DropdownMenuItem className="flex gap-2 items-center" onClick={() => {

                            if (location.pathname.includes('dashboard')) {
                              history('/');
                            }
                            setRole('')
                            setPermission([])
                            localStorage.removeItem('role');
                            localStorage.removeItem('permission');
                          }}>
                            <Avatar className="cursor-pointer rounded-md  h-6 w-6">
                              <AvatarImage className={'rounded-md h-6 w-6'} src={`${user?.photo_url}`} />
                              <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                            </Avatar>
                            {user?.display_name}</DropdownMenuItem>
                          {user?.roles != undefined && (
                            <div>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Cargos</DropdownMenuLabel>
                            </div>
                          )}

                          {user?.roles != undefined && (
                            user.roles!.map((rola) => (
                              <DropdownMenuItem className={`flex gap-2 items-center ${role == rola.role_id && ('bg-neutral-100 dark:bg-neutral-800')}`} onClick={() => {
                                fetchDataPerm(rola.id)
                                localStorage.setItem('role', JSON.stringify(rola.role_id));
                                setRole(rola.role_id)

                              }} key={rola.id}> <div className="h-6 w-6 flex items-center justify-center"><User size={16} /></div>{rola.role_id}</DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className={`flex flex-col lg:hidden lg:sticky w-full lg:w-fit mt-4  ${expand ? ('w-[240px]') : ('w-fit')}`}>
                      {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">PÁGINAS</p>)}
                      <div className="flex flex-col gap-2 mb-8">
                        <Button onClick={() => setTab('all')} variant={'ghost'} className={`  ${!expand ? ('w-10') : ('justify-start')} ${tab == 'all' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Menu size={16} />{expand && ('Minha área')}</Button>
                        <Button onClick={() => setTab('seg')} variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == 'seg' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Shield size={16} />{expand && ('Perfil e segurança')}</Button>
                        {user?.researcger_name != '' && (
                          <Button onClick={() => setTab('lin')} variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == 'lin' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><ChartLine size={16} />{expand && ('Linha do tempo')}</Button>
                        )}
                      </div>

                      {expand && user?.graduate_program && user.graduate_program.length > 0 && (
                        <p className="text-gray-500 uppercase text-xs font-medium mb-2">
                          PROGRAMAS DE PÓS-GRADUAÇÃO
                        </p>
                      )}

                      {user?.graduate_program && user.graduate_program.length > 0 && (
                        <div className="flex flex-col gap-2 mb-8">
                          {user.graduate_program.map((program) => (
                            <Link
                              key={program.graduate_program_id}
                              className="w-full"
                              target="_blank"
                              to={`/pos-graduacao?graduate_program_id=${program.graduate_program_id}`}
                            >
                              <Button
                                variant="ghost"
                                className={`${!expand ? 'w-10' : 'justify-start  w-full'
                                  } ${tab === '' && 'bg-neutral-100 dark:bg-neutral-800'}`}
                                size={expand ? 'default' : 'icon'}
                              >
                                <div> <GraduationCap size={16} className="whitespace-nowrap" /></div>
                                {expand && program.name}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}

                      {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">LINKS EXTERNOS</p>)}
                      <div className="flex w-full flex-col gap-2 mb-8">
                        {user?.researcger_name != '' && (
                          <Button variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start w-full')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Cube size={16} />{expand && ('Meus bens patrimoniados')}</Button>
                        )}
                        {user?.researcger_name != '' && (<Link className="w-full" target="_blank" to={`/researcher?researcher_name=${user?.researcger_name}&search_type=&terms=`}><Button variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start w-full')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><User size={16} />{expand && ('Página pública do pesquisador')}</Button></Link>)}

                      </div>

                      {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">OUTRAS AÇÕES</p>)}
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => {
                          onClose()
                          logOut()
                          history(`/`)
                          localStorage.removeItem('permission');
                          localStorage.removeItem('role');
                        }} variant={'destructive'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><SignOut size={16} />{expand && ('Encerrar sessão')}</Button>
                      </div>
                    </div>

                    {researcher && researcher.slice(0, 1).map((props) => {
                      const currentDate = new Date();
                      const lattesUpdate = String(props.lattes_update).split('/');
                      const lattesMonth = parseInt(lattesUpdate[1]);
                      const lattesYear = parseInt(lattesUpdate[2]);

                      const monthDifference = (currentDate.getFullYear() - lattesYear) * 12 + (currentDate.getMonth() + 1 - lattesMonth);

                      const isOutdated = monthDifference > 3;


                      if (isOutdated && user?.lattes_id != '') {
                        return (
                          <div className="bg-red-50 flex gap-3 dark:bg-red-200/20 w-full mt-6 p-8 rounded-md">
                            <div>  <OctagonAlert size={24} /></div>
                            <div>
                              <AlertTitle className="whitespace-normal">Currículo Lattes desatualizado</AlertTitle>
                              <AlertDescription className="whitespace-normal mb-6">
                                Seu currículo na plataforma Lattes está sem alterações tem {monthDifference} meses. Última atualização em {String(props.lattes_update)}.
                              </AlertDescription>

                              <Link to={'https://lattes.cnpq.br/'} target="_blank"> <Button variant={'destructive'}>Acessar plataforma Lattes</Button></Link>
                            </div></div>
                        )
                      }

                    })}

                    {researcher && researcher.slice(0, 1).map((props) => {
                      if (props.orcid == "") {
                        return (
                          <div className="bg-red-50 flex gap-3 dark:bg-red-200/20 w-full mt-6 p-8 rounded-md">
                            <div>  <OctagonAlert size={24} /></div>
                            <div>
                              <AlertTitle className="whitespace-normal">Currículo Lattes desatualizado</AlertTitle>
                              <AlertDescription className="whitespace-normal mb-6">
                                Adicione o ORCID no seu Lattes
                              </AlertDescription>

                              <Link to={'https://lattes.cnpq.br/'}> <Button variant={'destructive'}>Acessar plataforma Lattes</Button></Link>
                            </div></div>
                        )
                      }
                    })}

                    <div className="my-6 border-b dark:border-b-neutral-800"></div>

                    <h5 className="font-medium text-xl mb-4">Acesso rápido</h5>
                    <div className={`flex flex-col md:grid gap-4  ${expand ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-1 xl:grid-cols-2 lg:grid-cols-1"}`}>
                    {accessLinks.map(({ permission, to, icon, label }) => 
          permissions[permission] && (
            <Link to={to} key={to} >
              <Alert className="h-[80px] bg-blue-100 border-0 hover:bg-blue-200 text-sm dark:bg-blue-100/50 dark:hover:bg-blue-200/50 transition-all cursor-pointer flex items-center lg:p-8">
                <div className="flex w-full justify-between items-center gap-3  cursor-pointer">
                  <div>
                  {label}
                  </div>

                  <div className="h-10 w-10 rounded-md bg-black/10 flex items-center justify-center">
                  {icon}
                  </div>
                </div>
              </Alert>
            </Link>
          )
        )}

                    </div>

                  </div>
                </TabsContent>

                <TabsContent value="seg" className="w-full">
                  <SegurancaMinhaArea componente={
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm"> Você está acessando como </p>
                        <DropdownMenu>
                          <div className={`   `}>
                            <DropdownMenuTrigger className={`flex-1 items-center flex justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all w-fit rounded-md  `}>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="justify-between"
                              >
                                {role != '' ? (role) : (user?.display_name)}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </DropdownMenuTrigger>
                          </div>
                          <DropdownMenuContent className="min-w-[200px]  gap-1 flex flex-col ">
                            <DropdownMenuLabel>Conta pessoal</DropdownMenuLabel>
                            <DropdownMenuItem className="flex gap-2 items-center" onClick={() => {
                              if (location.pathname.includes('dashboard')) {
                                history('/');
                              }
                              setRole('')
                              setPermission([])
                              localStorage.removeItem('role');
                              localStorage.removeItem('permission');
                            }}>
                              <Avatar className="cursor-pointer rounded-md  h-6 w-6">
                                <AvatarImage className={'rounded-md h-6 w-6'} src={`${user?.photo_url}`} />
                                <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                              </Avatar>
                              {user?.display_name}</DropdownMenuItem>
                            {user?.roles != undefined && (
                              <div>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Cargos</DropdownMenuLabel>
                              </div>
                            )}
                            {user?.roles != undefined && (
                              user.roles!.map((rola) => (
                                <DropdownMenuItem className={`flex gap-2 items-center ${role == rola.role_id && ('bg-neutral-100 dark:bg-neutral-800')}`} onClick={() => {
                                  fetchDataPerm(rola.id)
                                  localStorage.setItem('role', JSON.stringify(rola.role_id));
                                  setRole(rola.role_id)
                                }} key={rola.id}> <div className="h-6 w-6 flex items-center justify-center"><User size={16} /></div>{rola.role_id}</DropdownMenuItem>
                              ))
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className={`flex flex-col lg:hidden lg:sticky w-full lg:w-fit mt-4  ${expand ? ('w-[240px]') : ('w-fit')}`}>
                        {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">PÁGINAS</p>)}
                        <div className="flex flex-col gap-2 mb-8">
                          <Button onClick={() => setTab('all')} variant={'ghost'} className={`  ${!expand ? ('w-10') : ('justify-start')} ${tab == 'all' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Menu size={16} />{expand && ('Minha área')}</Button>
                          <Button onClick={() => setTab('seg')} variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == 'seg' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Shield size={16} />{expand && ('Perfil e segurança')}</Button>
                          {user?.researcger_name != '' && (
                            <Button onClick={() => setTab('lin')} variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == 'lin' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><ChartLine size={16} />{expand && ('Linha do tempo')}</Button>
                          )}
                        </div>
                        {expand && user?.graduate_program && user.graduate_program.length > 0 && (
                          <p className="text-gray-500 uppercase text-xs font-medium mb-2">
                            PROGRAMAS DE PÓS-GRADUAÇÃO
                          </p>
                        )}
                        {user?.graduate_program && user.graduate_program.length > 0 && (
                          <div className="flex flex-col gap-2 mb-8">
                            {user.graduate_program.map((program) => (
                              <Link
                                key={program.graduate_program_id}
                                className="w-full"
                                target="_blank"
                                to={`/pos-graduacao?graduate_program_id=${program.graduate_program_id}`}
                              >
                                <Button
                                  variant="ghost"
                                  className={`${!expand ? 'w-10' : 'justify-start  w-full'
                                    } ${tab === '' && 'bg-neutral-100 dark:bg-neutral-800'}`}
                                  size={expand ? 'default' : 'icon'}
                                >
                                  <div> <GraduationCap size={16} className="whitespace-nowrap" /></div>
                                  {expand && program.name}
                                </Button>
                              </Link>
                            ))}
                          </div>
                        )}
                        {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">LINKS EXTERNOS</p>)}
                        <div className="flex w-full flex-col gap-2 mb-8">
                          {user?.researcger_name != '' && (
                            <Button variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start w-full')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Cube size={16} />{expand && ('Meus bens patrimoniados')}</Button>
                          )}
                          {user?.researcger_name != '' && (<Link className="w-full" target="_blank" to={`/researcher?researcher_name=${user?.researcger_name}&search_type=&terms=`}><Button variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start w-full')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><User size={16} />{expand && ('Página pública do pesquisador')}</Button></Link>)}
                        </div>
                        {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">OUTRAS AÇÕES</p>)}
                        <div className="flex flex-col gap-2">
                          <Button onClick={() => {
                            onClose()
                            logOut()
                            history(`/`)
                            localStorage.removeItem('permission');
                            localStorage.removeItem('role');
                          }} variant={'destructive'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><SignOut size={16} />{expand && ('Encerrar sessão')}</Button>
                        </div>
                      </div>
                    </div>
                  } />
                </TabsContent>

                <TabsContent value="lin" className="w-full">
                  {researcher.slice(0, 1).map((user) => (
                    <LinhaTempoMinhaArea
                      among={user.among}
                      articles={user.articles}
                      book={user.book}
                      book_chapters={user.book_chapters}
                      id={user.id}
                      name={user.name}
                      university={user.university}
                      lattes_id={user.lattes_id}
                      area={user.area}
                      abstract={user.abstract}
                      lattes_10_id={user.lattes_10_id}
                      city={user.city}
                      orcid={user.orcid}
                      image={user.image}
                      graduation={user.graduation}
                      patent={user.patent}
                      software={user.software}
                      brand={user.brand}
                      lattes_update={user.lattes_update}

                      h_index={user.h_index}
                      relevance_score={user.relevance_score}
                      works_count={user.works_count}
                      cited_by_count={user.cited_by_count}
                      i10_index={user.i10_index}
                      scopus={user.scopus}
                      openalex={user.openalex}

                      subsidy={user.subsidy}
                      graduate_programs={user.graduate_programs}
                      departments={user.departments}
                      research_groups={user.research_groups}

                      cargo={user.cargo}
                      clas={user.clas}
                      classe={user.classe}
                      rt={user.rt}
                      situacao={user.situacao}

                      entradanaufmg={user.entradanaufmg}
                    />
                  ))}
                </TabsContent>
              </Tabs>

              <div className={`hidden lg:flex flex-col lg:sticky  w-full lg:w-fit top-8 ${expand ? ('w-[240px]') : ('w-fit')}`}>
                {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">PÁGINAS</p>)}
                <div className="flex flex-col gap-2 mb-8">
                  <Button onClick={() => setTab('all')} variant={'ghost'} className={`${!expand ? ('w-10') : ('justify-start')} ${tab == 'all' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Menu size={16} />{expand && ('Minha área')}</Button>
                  <Button onClick={() => setTab('seg')} variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == 'seg' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Shield size={16} />{expand && ('Perfil e segurança')}</Button>
                  {user?.researcger_name != '' && (
                    <Button onClick={() => setTab('lin')} variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == 'lin' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><ChartLine size={16} />{expand && ('Linha do tempo')}</Button>
                  )}
                </div>

                {expand && user?.graduate_program && user.graduate_program.length > 0 && (
                  <p className="text-gray-500 uppercase text-xs font-medium mb-2">
                    PROGRAMAS DE PÓS-GRADUAÇÃO
                  </p>
                )}

                {user?.graduate_program && user.graduate_program.length > 0 && (
                  <div className="flex flex-col gap-2 mb-8">
                    {user.graduate_program.map((program) => (
                      <Link
                        key={program.graduate_program_id}
                        className="w-full"
                        target="_blank"
                        to={`/pos-graduacao?graduate_program_id=${program.graduate_program_id}`}
                      >
                        <Button
                          variant="ghost"
                          className={`${!expand ? 'w-10' : 'justify-start  w-full'
                            } ${tab === '' && 'bg-neutral-100 dark:bg-neutral-800'}`}
                          size={expand ? 'default' : 'icon'}
                        >
                          <div> <GraduationCap size={16} className="whitespace-nowrap" /></div>
                          {expand && program.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}

                {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">LINKS EXTERNOS</p>)}
                <div className="flex w-full flex-col gap-2 mb-8">
                  {user?.researcger_name != '' && (
                    <Button variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start w-full')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><Cube size={16} />{expand && ('Meus bens patrimoniados')}</Button>
                  )}
                  {user?.researcger_name != '' && (<Link className="w-full" target="_blank" to={`/researcher?researcher_name=${user?.researcger_name}&search_type=&terms=`}><Button variant={'ghost'} className={` ${!expand ? ('w-10') : ('justify-start w-full')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><User size={16} />{expand && ('Página pública do pesquisador')}</Button></Link>)}

                </div>

                {expand && (<p className="text-gray-500 uppercase text-xs font-medium mb-2">OUTRAS AÇÕES</p>)}
                <div className="flex flex-col gap-2">
                  <Button onClick={() => {
                    onClose()
                    logOut()
                    history(`/`)
                    localStorage.removeItem('permission');
                    localStorage.removeItem('role');
                  }} variant={'destructive'} className={` ${!expand ? ('w-10') : ('justify-start')} ${tab == '' && ('bg-neutral-100 dark:bg-neutral-800')}`} size={expand ? ('default') : ('icon')}><SignOut size={16} />{expand && ('Encerrar sessão')}</Button>

                </div>
              </div>

            </div>
          </ScrollArea>

        </div>

      </SheetContent>
    </Sheet>
  )
}