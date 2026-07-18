import { useContext, useEffect, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { UserContext } from "../../../context/context";
import { DisplayCargo } from "./display-cargo";
import { Alert } from "../../ui/alert";
import {  CardDescription, CardFooter, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { BriefcaseBusiness, ChevronDown, ChevronUp,  Plus, UserCog } from "lucide-react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { toast } from "sonner"
import { Tabs, TabsContent} from "../../../components/ui/tabs"
import {  Users } from "phosphor-react";

import { EditarInfoUsuarios } from "./editar-info-usuarios";
import { VincularUsuarioCargo } from "./vincular-usuario-cargo";
import { Skeleton } from "../../ui/skeleton";


interface Disciplinas {
   role:string
   id:string
}





export function CargosFuncoes() {
    const [data, setData] = useState<Disciplinas[]>([]);
    const [dataSelecionado, setDataSelecionado] = useState<Disciplinas | null>(null);
const [isLoad, setIsLoad] = useState(false)
    const { urlGeralAdm, permission} = useContext(UserContext)

    const has_editar_cargos_permissoes = permission.some(
      (perm) => perm.permission === 'editar_cargos_permissoes'
    );

    const has_editar_cargos_usuarios = permission.some(
      (perm) => perm.permission === 'editar_cargos_usuarios'
    );

    const has_editar_informacoes_usuarios = permission.some(
      (perm) => perm.permission === 'editar_informacoes_usuarios'
    );

    let urlDisciplinas = urlGeralAdm + `s/role`;

        const fetchDataGet = async () => {
          setIsLoad(true)
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
                    setIsLoad(false)
                }
            } catch (err) {
                console.log(err);
            }
        };


   useEffect(() => {
        fetchDataGet();
    }, [urlDisciplinas]);

    console.log(data)

    //

    const [nomePesquisador, setNomePesquisador] = useState('');


    const handleSubmitPesquisador = async () => {
        try {

          if(nomePesquisador.length === 0) {
            toast("Preencha o nome do cargo", {
              description: "Tente novamente!",
              action: {
                label: "Fechar",
                onClick: () => { },
              },
            })

            return
          }

            const data = [
                {
                    role:nomePesquisador
                  }
              ]

               let urlProgram = urlGeralAdm + 's/role'

               console.log(urlProgram)
               const fetchData = async () => {
         
                try {
                  const response = await fetch(urlProgram, {
                    mode: 'cors',
                    method: 'POST',
                    headers: {
                      'Access-Control-Allow-Origin': '*',
                      'Access-Control-Allow-Methods': 'POST',
                      'Access-Control-Allow-Headers': 'Content-Type',
                      'Access-Control-Max-Age': '3600',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                  });
      
                  if (response.ok) {
                   
                    toast("Dados enviados com sucesso", {
                        description: "Cargo adicionado a coleção, adicione as funcionalidades",
                        action: {
                          label: "Fechar",
                          onClick: () => { },
                        },
                      })
                  
                        setNomePesquisador('')
                        fetchDataGet()
                   
                  } else {
                   
                    toast("Tente novamente!", {
                        description: "Erro ao cadastrar cargo na plataforma",
                        action: {
                          label: "Fechar",
                          onClick: () => { },
                        },
                      })
                  }
                  
                } catch (err) {
                  console.log(err);
                } 
              };
              fetchData();
              

    } catch (error) {
        console.error('Erro ao processar a requisição:', error);
      }

    }

    const [isOn, setIsOn] = useState(true);

    const [tab, setTab] = useState('cargos')


   useEffect(() => {
        if(!has_editar_cargos_permissoes) {
          setTab('usuarios')
        } else if (!has_editar_cargos_usuarios) {
          setTab('pesquisadores')
        } else if (!has_editar_informacoes_usuarios) {
            setTab('')
        }
    }, [permission]);
    
    ////LISTA USUARIOS


    return(
        <Tabs defaultValue={tab} value={tab}>
              <div className={`w-full ${isOn ? 'px-8' : 'px-4'} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
              {isOn && (
                  <div className="w-full pt-4 mb-2 flex justify-between items-center">
                 <CardTitle>Configurações de acesso</CardTitle>
                  </div>
                )}
                <div className={`flex pt-2 justify-between  ${isOn ? '' : ''} `}>
                  <div className="flex items-center gap-2">
                  <div className={`pb-2 border-b-2 transition-all ${tab == 'cargos' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`}>
                    <Button disabled={!has_editar_cargos_permissoes} variant={tab == 'cargos' ? ('ghost'):('ghost')}  onClick={() => setTab('cargos')}>
                       <BriefcaseBusiness className="h-4 w-4" />
                       Cargos
                     </Button>
                    </div>

                    <div className={`pb-2 border-b-2 transition-all ${tab == 'usuarios' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`}>
                    <Button disabled={!has_editar_cargos_usuarios} variant={tab == 'usuarios' ? ('ghost'):('ghost')}  onClick={() => setTab('usuarios')}>
                       <Users className="h-4 w-4" />
                       Vincular usuário à cargo
                     </Button>
                    </div>

                    <div className={`pb-2 border-b-2 transition-all ${tab == 'pesquisadores' ? ('border-b-[#719CB8]'):(' border-b-transparent ')}`}>
                    <Button disabled={!has_editar_informacoes_usuarios} variant={tab == 'pesquisadores' ? ('ghost'):('ghost')}  onClick={() => setTab('pesquisadores')}>
                       <UserCog className="h-4 w-4" />
                       Editar informações do usuário
                     </Button>
                    </div>
                  </div>

                  <div>
                   
                    <Button variant="ghost"  size="icon" onClick={() => setIsOn(!isOn)}>
                      {isOn ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

             <TabsContent value="cargos">
             <main className="grid flex-1 items-start gap-4 p-4 md:p-8 md:gap-8 lg:grid-cols-3 xl:grid-cols-3  pb-4 md:pb-8">
              <div className={`grid auto-rows-max items-start gap-4 md:gap-8 ${dataSelecionado ? ('lg:col-span-2') : ('lg:col-span-3')}`}>
              <Alert
                className="p-0" x-chunk="dashboard-05-chunk-0"
              >
                <CardHeader className="pb-3">
                  <CardTitle>Adicionar cargo</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Adicione o cargo, este poderá ser atrelado a um docente ou técnico, possuindo acesso a funcionalidades da plataforma.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                <div className="flex w-full gap-6 items-end">
                <div className="flex flex-col space-y-1.5 w-full flex-1">
           <Label htmlFor="name">Nome do cargo</Label>
           <Input value={nomePesquisador} onChange={(e) => setNomePesquisador(e.target.value)} type="text"  />
           </div>
                 <Button onClick={() => handleSubmitPesquisador()}><Plus size={16}/>Adicionar cargo</Button>
                 </div>
                </CardFooter>
              </Alert>

              <ResponsiveMasonry
                    columnsCountBreakPoints={{
                        350: 1,
                        720: 2,
                        900: 2,
                        1200: dataSelecionado ? 3 : 4,
                    }}
                >
                 <Masonry gutter="16px">
  {isLoad ? (
    Array.from({ length: 5 }).map((_, index) => (
      <Skeleton key={index} className="w-full h-[54px] rounded-md" />
    ))
  ) : (
    data.map((props) => (
      <div key={props.id} className="flex cursor-pointer">
        <div className="w-2 min-w-[8px] flex flex-1 h-full bg-[#719CB8] rounded-l-lg border border-r-0 border-neutral-200 dark:border-neutral-800"></div>
        <Alert onClick={() => setDataSelecionado(props)} className="rounded-l-none">
          <div className="flex items-center gap-3">
            <p className="font-medium text-sm">{props.role}</p>
          </div>
        </Alert>
      </div>
    ))
  )}
</Masonry>

                    </ResponsiveMasonry>
              </div>

              {dataSelecionado && (
                <DisplayCargo
                    role={dataSelecionado.role}
                    id={dataSelecionado.id} 
                />
            )}
        </main>
             </TabsContent>

             <TabsContent value="usuarios">
           <VincularUsuarioCargo/>
             </TabsContent>

             <TabsContent value="pesquisadores">
             <main className=" p-4 md:p-8 md:gap-8  gap-4">
                <EditarInfoUsuarios/>
             </main>
             </TabsContent>
        </Tabs>
    )
}