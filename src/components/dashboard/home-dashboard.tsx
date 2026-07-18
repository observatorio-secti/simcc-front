import { useContext } from "react";
import { Badge } from "../ui/badge";
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";
import { Blocks, Building2, ClipboardEdit, FlaskConical, GraduationCap, Mail, PieChart, SlidersHorizontal, Users, Weight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

export function HomeDashboard() {
  const { role, permission, user, version } = useContext(UserContext);

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

  return (
    <main className="w-full md:p-8 p-4">
      <Helmet>
        <title>Dashboard | Módulo administrativo | {version ? 'Conectee' : 'Simcc'}</title>
        <meta name="description" content={`Dashboard | Módulo administrativo | ${version ? 'Conectee' : 'Simcc'}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="bg-eng-blue rounded-md w-full h-[40vh] text-white p-8 flex flex-col justify-between">
        <div>
          <Badge className="mb-4 text-eng-blue" variant="secondary">{role}</Badge>
        </div>

        <div>
          <div className="gap-2">
            <h1 className="max-w-[750px] mb-2 text-lg font-light text-foreground">Olá {user?.display_name},</h1>
            <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">Dashboard</h1>
          </div>
          <p className="max-w-[750px] mt-2 text-lg font-light text-foreground"></p>
        </div>
      </div>

      <h3 className="text-2xl font-medium my-4 md:my-8">Acesso rápido na plataforma</h3>

      <div className="grid lg:grid-cols-3 gap-4 md:grid-cols-2 mgrid-cols-1 2xl:grid-cols-5">
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
    </main>
  );
}
