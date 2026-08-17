import { useContext, useEffect, useState } from 'react';
import { useModal } from '../../hooks/use-modal-store';

import { UserContext } from '../../../context/context';

import { ChevronLeft, Plus, Search } from 'lucide-react';

interface PosGraduationsProps {
  graduate_program_id: string;
  code: string;
  name: string;
  area: string;
  modality: string;
  type: string;
  rating: string;
  institution_id: string;
  description: string;
  url_image: string;
  city: string;
  created_at: string;
  visible: boolean;
  updated_at: string;
  qtd_discente: string;
  qtd_colaborador: string;
  qtd_permanente: string;
  site: string;
  acronym: string;
  menagers: string[];
}

import { useModalDashboard } from '../../hooks/use-modal-dashboard';
import { Tabs, TabsContent } from '../../ui/tabs';
import { Input } from '../../ui/input';
import { DisplayItem } from './display-item';
import { ItensList } from '../components/itens-list-vitrine';
import { Button } from '../../ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export function PosGraducaoView() {
  const { isOpen, type } = useModalDashboard();

  const isModalOpen = isOpen && type === 'graduate-program';

  const { urlGeralAdm, user, defaultLayout } = useContext(UserContext);

  const { onOpen } = useModal();

  const queryUrl = useQuery();
  const type_search = queryUrl.get('graduate_program_id');
  const programSelecionado = type_search || '';

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useState(true);

  const [total, setTotal] = useState<PosGraduationsProps | null>(null);
  const [programas, setProgramas] = useState<PosGraduationsProps[]>([]);
  // Função para lidar com a atualização de researcherData
  const handleResearcherUpdate = (newResearcherData: PosGraduationsProps) => {
    setTotal(newResearcherData);
  };

  const handleOnMenuState = (newResearcherData: boolean) => {
    setMenu(newResearcherData);
  };

  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  };

  const urlPatrimonioInsert = `${urlGeralAdm}GraduateProgramRest/Query?institution_id=${user?.institution_id}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlPatrimonioInsert, {
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
        if (data)
          if (data) {
            setProgramas(data);

            // Verifica se o programSelecionado não está vazio
            if (programSelecionado !== '') {
              const selectedProgram = data.find(
                (program: PosGraduationsProps) =>
                  program.graduate_program_id === programSelecionado,
              );
              setTotal(selectedProgram || null); // Define o total ou null se não encontrar
            }
          }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
    console.log(programSelecionado, 'PROGRAMA SELECIONADO');
  }, [programSelecionado]);

  return (
    <>
      <Helmet>
        <title>Pós-graduações | Módulo administrativo | {'Simcc'} </title>
        <meta
          name="description"
          content={`Pós-graduações | Módulo administrativo | ${'Simcc'}`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div
        className={`relative grid-cols-5 h-full  ${menu ? 'grid ' : 'flex'}`}
      >
        <div
          className={`col-span-2 h-fit sticky top-[68px] p-8 ${menu ? 'grid ' : 'pr-0'}`}
        >
          <Tabs defaultValue={tab} value={tab}>
            <div className={`flex items-center justify-between  `}>
              {menu && (
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleVoltar}
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                  </Button>
                  <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Pós-graduação
                  </h1>
                </div>
              )}
            </div>

            {menu && (
              <div className="bg-background/95 pt-8 pb-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => onOpen('add-graduate-program')}
                    size="sm"
                    className="ml-auto gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar
                  </Button>

                  <div className="relative w-full bg-white h-10 flex gap-2 items-center border pl-4 border-neutral-200 dark:border-neutral-800 rounded-md dark:bg-neutral-950">
                    <Search size={16} />
                    <Input
                      placeholder="Filtrar pelo nome do programa..."
                      className="border-none h-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            <TabsContent value="all" className="m-0">
              <ItensList
                onResearcherUpdate={handleResearcherUpdate}
                url={`${urlGeralAdm}GraduateProgramRest/Query?institution_id=${user?.institution_id}${
                  user?.email?.endsWith('@simcc.com.br')
                    ? ''
                    : `&user_id=${user?.user_id}`
                }`}
                search={search}
                menu={menu}
              />
            </TabsContent>
            <TabsContent value="unread" className="m-0"></TabsContent>
          </Tabs>
        </div>

        <div
          className={`p-8  ${menu ? 'col-span-3 pl-0' : 'flex-1 flex w-full'}`}
        >
          {total ? (
            <div className="h-full w-full  ">
              <DisplayItem
                graduate_program_id={total.graduate_program_id}
                code={total.code}
                name={total.name}
                area={total.area}
                modality={total.modality}
                type={total.type}
                rating={total.rating}
                institution_id={total.institution_id}
                description={total.description}
                url_image={total.url_image}
                city={total.city}
                created_at={total.created_at}
                visible={total.visible}
                updated_at={total.updated_at}
                qtd_discente={total.qtd_discente}
                qtd_colaborador={total.qtd_colaborador}
                qtd_permanente={total.qtd_permanente}
                site={total.site}
                acronym={total.acronym}
                menu_state={menu}
                menagers={total.menagers}
                onMenuState={handleOnMenuState}
              />
            </div>
          ) : (
            <div className="h-full sticky top-[100px]   max-h-[calc(100vh-198px)]">
              <div className="w-full dark:border-neutral-800 rounded-lg border h-full flex flex-col items-center justify-center">
                <p className="text-9xl  text-[#719CB8]  font-bold mb-16 animate-pulse">
                  =]
                </p>
                <p className="font-medium text-lg">
                  Nenhum programa selecionado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
