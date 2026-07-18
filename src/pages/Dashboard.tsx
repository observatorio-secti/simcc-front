
import { useContext, useEffect } from "react";
import { DashboardProvider } from "../components/provider/dashboard-provider";
import AdminLayout from "../layout/admin-layout";
import { useLocation } from "react-router-dom";
import { useModalDashboard } from "../components/hooks/use-modal-dashboard";
import { UserContext } from "../context/context";


export function Dashboard() {

    const { onOpen } = useModalDashboard();
    const {isCollapsed, navCollapsedSize, defaultLayout} = useContext(UserContext)

    const location = useLocation();
    

    useEffect(() => {
        if(location.pathname == '/dashboard') {
            onOpen('home-dashboard')
        } else if (location.pathname == '/config') {
            onOpen('master')
        } else if (location.pathname == '/dashboard/programas' || location.pathname == '/minhaufmg/dashboard/programas') {
            onOpen('graduate-program')
        } else if (location.pathname == '/dashboard/departamentos' || location.pathname == '/minhaufmg/dashboard/departamentos') {
            onOpen('departamento')
        } else if (location.pathname == '/dashboard/pesquisadores' || location.pathname == '/minhaufmg/dashboard/pesquisadores') {
            onOpen('researcher')
        } else if (location.pathname == '/dashboard/pesos-avaliacao' || location.pathname == '/minhaufmg/dashboard/pesos-avaliacao') {
            onOpen('peso-producao')
        } else if (location.pathname == '/dashboard/grupos-pesquisa' || location.pathname == '/minhaufmg/dashboard/grupos-pesquisa') {
            onOpen('grupo-pesquisa')
        } else if (location.pathname == '/dashboard/indicadores' || location.pathname == '/minhaufmg/dashboard/indicadores') {
            onOpen('indicadores')
        } else if (location.pathname == '/dashboard/baremas' || location.pathname == '/minhaufmg/dashboard/baremas') {
            onOpen('baremas')
        } else if (location.pathname == '/dashboard/enviar-notificacoes' || location.pathname == '/minhaufmg/dashboard/enviar-notificacoes') {
            onOpen('enviar-notificacoes')
        } else if (location.pathname == '/dashboard/informacoes' || location.pathname == '/minhaufmg/dashboard/informacoes') {
            onOpen('informacoes')
        } else if (location.pathname == '/dashboard/minha-area' || location.pathname == '/minhaufmg/dashboard/minha-area') {
            onOpen('minha-area')
        } else if(location.pathname == '/dashboard/administrativo' || location.pathname == '/minhaufmg/dashboard/minha-area') {
            onOpen('general')
        } else if(location.pathname == '/dashboard/minhas-producoes' || location.pathname == '/minhaufmg/dashboard/minhas-producoes') {
            onOpen('minhas-producoes')
        } else if(location.pathname == '/dashboard/parametros-pesquisa' || location.pathname == '/minhaufmg/dashboard/parametros-pesquisa') {
            onOpen('parametros-pesquisa')
        } else if(location.pathname == '/dashboard/secao-pessoal' || location.pathname == '/minhaufmg/dashboard/sessao-pessoal') {
            onOpen('sessao-pessoal')
        } else if(location.pathname == '/dashboard/construtor-pagina' || location.pathname == '/minhaufmg/dashboard/construtor-pagina') {
            onOpen('construtor-pagina')
        }
    }, [location]);
  
    return(
        <>
        <AdminLayout
         defaultLayout={defaultLayout}
         defaultCollapsed={isCollapsed}
         navCollapsedSize={navCollapsedSize}
        >
            <DashboardProvider/>
        </AdminLayout>
        </>
    )
}