import { ChevronsUpDown, Maximize2, Plus, User, UserIcon } from 'lucide-react';
import { Button } from '../../ui/button';

import { CardContent, CardHeader, CardTitle } from '../../ui/card';
import { MagnifyingGlass, Trash } from 'phosphor-react';
import { toast } from 'sonner';
import { useContext, useEffect, useState, FormEvent } from 'react'; // Adicionado FormEvent
import { UserContext } from '../../../context/context';
import { useModal } from '../../hooks/use-modal-store';

import { Alert } from '../../ui/alert';

import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Input } from '../../ui/input';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';

// --- Interfaces (Sem alteração) ---
export interface ParticipationProps {
  created_at: string;
  graduate_program_id: string;
  researcher_id: string;
  tag: string | null;
  type_: string;
  updated_at: string;
  year: number;
}

export interface PesquisadorProps {
  lattes_id: string;
  name: string;
  participation: ParticipationProps[];
  researcher_id: string;
  graduate_program_id?: string;
}

export interface PesquisadorProps2 {
  name: string;
  lattes_id: string;
  researcher_id: string;
  institution_id: string;
}

// Props do componente principal
interface Props {
  graduate_program_id: string;
}

// Props para os cards de estatísticas
interface DocenteStatsCardsProps {
  permanenteCount: number;
  colaboradorCount: number;
}

// Props para a seção de adicionar docentes
interface AddDocenteSectionProps {
  graduate_program_id: string;
  fetchDataAll: () => void; // Prop para atualizar a lista
}

// Props para a lista de docentes
interface DocenteListProps {
  researchers: PesquisadorProps[];
  urlGeral: string;
  urlGeralAdm: string; // Necessário para as chamadas de API (Delete/Insert)
  onOpen: (type: any, data?: any) => void;
  fetchDataAll: () => void; // Prop para atualizar a lista
}

// Props para o novo item da lista de docentes
interface DocenteListItemProps {
  researcher: PesquisadorProps;
  urlGeral: string;
  urlGeralAdm: string;
  onOpen: (type: any, data?: any) => void;
  fetchDataAll: () => void;
}

// --- Componente 1: Cards de Estatísticas (Sem alteração) ---

function DocenteStatsCards({
  permanenteCount,
  colaboradorCount,
}: DocenteStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 ">
      <Alert className="p-0 mb-4 md:mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de docentes
          </CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{permanenteCount}</div>
          <p className="text-xs text-muted-foreground">
            permenentes registrados
          </p>
        </CardContent>
      </Alert>

      <Alert className="p-0 mb-4 md:mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de docentes
          </CardTitle>
          <User className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{colaboradorCount}</div>
          <p className="text-xs text-muted-foreground">
            colaboradores registrados
          </p>
        </CardContent>
      </Alert>
    </div>
  );
}

// --- Componente 2: Seção para Adicionar Docentes (MODIFICADO) ---

function AddDocenteSection({
  graduate_program_id,
  fetchDataAll,
}: AddDocenteSectionProps) {
  const { urlGeralAdm } = useContext(UserContext);

  // Estado para o formulário de adição (apenas interno)
  const [input, setInput] = useState(''); // Busca no modal
  const [openPopo2, setOpenPopo2] = useState(false);
  const [pesquisadoreSelecionado, setPesquisadorSelecionado] = useState<
    PesquisadorProps2 | undefined
  >();
  const [isLoading, setIsLoading] = useState(false); // Estado de loading

  // Estado e fetch para a busca de pesquisadores (no modal)
  const [researcherSearch, setResearcherSearch] = useState<PesquisadorProps2[]>(
    [],
  );
  const urlGetResearcherSearch =
    urlGeralAdm + `ResearcherRest/Query?institution_id=&name=&count= `;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlGetResearcherSearch, {
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
        if (data) {
          setResearcherSearch(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlGetResearcherSearch, graduate_program_id]);

  const normalizeString = (str: any) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  };

  const filteredList = researcherSearch.filter((framework) =>
    normalizeString(framework.name).includes(normalizeString(input)),
  );

  // --- Lógica de Adição (Apenas Interna) ---

  // Adicionar Docente Interno (Endpoint 1: /Insert)
  const handleAddInternal = async (e: FormEvent) => {
    e.preventDefault();
    if (!pesquisadoreSelecionado) {
      toast.error('Selecione um pesquisador.');
      return;
    }
    setIsLoading(true);

    const currentYear = new Date().getFullYear();
    const payload = [
      {
        graduate_program_id: graduate_program_id,
        researcher_id: pesquisadoreSelecionado.researcher_id,
        year: currentYear,
        type_: 'PERMANENTE', // Default: Adiciona como permanente no ano atual
      },
    ];

    try {
      const response = await fetch(
        `${urlGeralAdm}GraduateProgramResearcherRest/Insert`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 201) {
        toast.success(`${pesquisadoreSelecionado.name} adicionado!`);
        setPesquisadorSelecionado(undefined);
        fetchDataAll(); // Atualiza a lista principal
      } else {
        toast.error('Erro ao adicionar pesquisador.');
      }
    } catch (err) {
      console.log(err);
      toast.error('Erro de conexão ao adicionar pesquisador.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Função handleAddExternal removida ---

  return (
    // --- Componente <Tabs> removido ---
    <Alert className="p-0">
      <CardHeader className="flex flex-row items-start bg-neutral-100 rounded-t-md dark:bg-neutral-800">
        {/* --- <TabsList> removida --- */}
        <CardTitle className="group flex items-center w-fit gap-2 text-lg">
          <div className="w-fit">Adicionar Docente da Instituição</div>
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-6">
        {/* --- <TabsContent value="all"> removido --- */}
        {/* Formulário de Docente Interno */}
        <form onSubmit={handleAddInternal} className="gap-6 flex items-end">
          <div className="flex flex-col space-y-1.5 w-full flex-1">
            <Label htmlFor="name">Pesquisador da Unidade</Label>
            <Dialog open={openPopo2} onOpenChange={setOpenPopo2}>
              <DialogTrigger className="w-full">
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopo2}
                  className="w-full justify-between"
                  type="button" // Impede o submit do formulário
                >
                  {pesquisadoreSelecionado
                    ? researcherSearch.find(
                        (framework) =>
                          framework.name === pesquisadoreSelecionado.name,
                      )?.name
                    : 'Selecione um pesquisador'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </DialogTrigger>
              <DialogContent className="z-[9999]">
                <DialogHeader>
                  <DialogTitle>Escolher pesquisador</DialogTitle>
                  <DialogDescription>
                    Todos os docentes cadastrado no Módulo Administrativo da
                    instituição
                  </DialogDescription>
                </DialogHeader>

                <div className="border rounded-md bg-white dark:bg-neutral-950 px-6 h-12 flex items-center gap-1 border-neutral-200 dark:border-neutral-800">
                  <MagnifyingGlass size={16} />
                  <Input
                    className="border-0"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Buscar pesquisador"
                  />
                </div>

                <div className={'max-h-[350px] overflow-y-auto elementBarra'}>
                  <div className="flex flex-col gap-1 p-2">
                    {filteredList.length > 0 ? (
                      filteredList.map((props, index) => (
                        <Button
                          variant={'ghost'}
                          key={index}
                          className="text-left justify-start"
                          type="button" // Impede o submit
                          onClick={() => {
                            setPesquisadorSelecionado(props);
                            setOpenPopo2(false);
                          }}
                        >
                          {props.name}
                        </Button>
                      ))
                    ) : (
                      <div className="text-center w-full text-sm">
                        Nenhum pesquisador encontrado
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              'Adicionando...'
            ) : (
              <>
                <Plus size={16} /> Adicionar
              </>
            )}
          </Button>
        </form>

        {/* --- <TabsContent value="2"> (Formulário Externo) removido --- */}
      </CardContent>
    </Alert>
    // --- </Tabs> removido ---
  );
}

// --- Componente 3: Item da Lista de Docentes (NOVO) ---
// Este componente gere o estado de participação dos 5 anos

type ParticipationType = 'PERMANENTE' | 'COLABORADOR' | null;

function DocenteListItem({
  researcher,
  urlGeral,
  urlGeralAdm,
  onOpen,
  fetchDataAll,
}: DocenteListItemProps) {
  // Gera os últimos 5 anos
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  };

  const years = getYears();

  // Inicializa o estado de participação
  const initializeParticipations = (): Record<number, ParticipationType> => {
    const state: Record<number, ParticipationType> = {};
    const participationMap = new Map(
      researcher.participation.map((p) => [
        p.year,
        p.type_ as ParticipationType,
      ]),
    );

    for (const year of years) {
      state[year] = participationMap.get(year) || null;
    }
    return state;
  };

  const [participations, setParticipations] = useState(
    initializeParticipations(),
  );
  const [isLoading, setIsLoading] = useState(false);

  // Lógica de clique (Nulo -> Colaborador -> Permanente -> Nulo)
  const handleYearClick = (year: number) => {
    setParticipations((prev) => {
      const currentType = prev[year];
      let nextType: ParticipationType;

      if (currentType === null) {
        nextType = 'COLABORADOR';
      } else if (currentType === 'COLABORADOR') {
        nextType = 'PERMANENTE';
      } else {
        // currentType === 'PERMANENTE'
        nextType = null;
      }

      return { ...prev, [year]: nextType };
    });
  };

  // Função para definir a aparência do botão
  const getButtonVariant = (
    type: ParticipationType,
  ): 'default' | 'secondary' | 'outline' => {
    if (type === 'PERMANENTE') return 'default'; // Cor principal
    if (type === 'COLABORADOR') return 'secondary'; // Cor secundária
    return 'outline'; // Desativado
  };

  // Função para definir o texto do botão
  const getButtonText = (type: ParticipationType): string => {
    if (type === 'PERMANENTE') return 'P';
    if (type === 'COLABORADOR') return 'C';
    return 'N'; // Nulo/Nenhum
  };

  // Lógica de Salvar (Endpoint 3 - Delete, depois Endpoint 1 - Insert)
  const handleSave = async () => {
    setIsLoading(true);

    // --- 1. DELETAR (Endpoint 3) ---
    // Atenção ao guia: "passar o researcher_id no campo lattes_id"
    const deletePayload = [
      {
        graduate_program_id: researcher.graduate_program_id,
        lattes_id: researcher.researcher_id, // Conforme guia da API
      },
    ];

    try {
      const deleteResponse = await fetch(
        `${urlGeralAdm}GraduateProgramResearcherRest/Delete`,
        {
          method: 'DELETE',
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'DELETE',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deletePayload),
        },
      );

      if (deleteResponse.status !== 204) {
        toast.error(
          'Erro ao deletar participações antigas. A atualização falhou.',
        );
        setIsLoading(false);
        return;
      }

      // --- 2. INSERIR NOVAMENTE (Endpoint 1) ---
      const newParticipations = Object.entries(participations)
        .filter(([_, type]) => type !== null) // Filtra apenas anos ativos
        .map(([year, type]) => ({
          graduate_program_id: researcher.graduate_program_id,
          researcher_id: researcher.researcher_id,
          year: parseInt(year),
          type_: type,
        }));

      // Se não houver novas participações, apenas paramos aqui (já deletamos)
      if (newParticipations.length === 0) {
        toast.success(`${researcher.name} atualizado (sem participações).`);
        fetchDataAll(); // Atualiza a lista principal
        setIsLoading(false);
        return;
      }

      const insertResponse = await fetch(
        `${urlGeralAdm}GraduateProgramResearcherRest/Insert`,
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newParticipations),
        },
      );

      if (insertResponse.status === 201) {
        toast.success(`${researcher.name} atualizado com sucesso!`);
        fetchDataAll(); // Atualiza a lista principal
      } else {
        toast.error('Erro ao inserir novas participações.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erro de conexão ao salvar participações.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    onOpen('confirm-delete-researcher-graduate-program', {
      researcher_id: researcher.researcher_id,
      graduate_program_id: researcher.graduate_program_id,
      name: researcher.name,
      onSuccess: fetchDataAll,
    });
  };

  return (
    <Alert>
      <AccordionItem value={researcher.researcher_id}>
        <div className="flex justify-between items-center h-10 group">
          <div className="h-10">
            <div className="flex items-center gap-2">
              <Avatar className="cursor-pointer rounded-md h-8 w-8">
                <AvatarImage
                  className="rounded-md h-8 w-8"
                  src={`${urlGeral}ResearcherData/Image?name=${researcher.name}`}
                />
                <AvatarFallback className="flex items-center justify-center">
                  <UserIcon size={12} />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{researcher.name}</p>
                <div className="text-xs text-gray-500">
                  {researcher.lattes_id}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className=" items-center gap-3 hidden group-hover:flex transition-all">
              <Button
                size={'icon'}
                onClick={() =>
                  onOpen('researcher-modal', { name: researcher.name })
                }
                variant={'ghost'}
                className="h-10 w-10 "
              >
                <Maximize2 size={16} />
              </Button>
              {/* Botão de Deletar agora chama o modal de confirmação */}
              <Button
                size={'icon'}
                variant={'destructive'}
                className=" text-white h-10 w-10 dark:text-white"
                onClick={handleDeleteClick} // <--- Implementado
              >
                <Trash size={16} />
              </Button>
            </div>
            <AccordionTrigger></AccordionTrigger>
          </div>
        </div>

        {/* Conteúdo do Accordion com os botões de ano */}
        <AccordionContent>
          <div className="pt-4">
            <Label>
              Gerenciar participações (Últimas 2 quadrienais - Últimos 8 anos)
            </Label>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="flex flex-wrap gap-2 flex-1">
                {Array.from(
                  { length: 8 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((year) => (
                  <Button
                    key={year}
                    variant={getButtonVariant(participations[year])}
                    onClick={() => handleYearClick(year)}
                    title={`Ano: ${year} - Status: ${participations[year] || 'Nenhum'} \nClique para alterar`}
                    className="flex-1 min-w-[80px] inline-flex items-center justify-center gap-2 px-3 py-1.5"
                  >
                    {year}
                    <span className="font-bold ml-1.5 rounded-full px-1.5 py-0.5 text-xs bg-black/10 dark:bg-white/20">
                      {getButtonText(participations[year])}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex-shrink-0">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-fit"
                >
                  {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Alert>
  );
}

// --- Componente 4: Lista de Docentes (MODIFICADO) ---

function DocenteList({
  researchers,
  urlGeral,
  urlGeralAdm,
  onOpen,
  fetchDataAll,
}: DocenteListProps) {
  const [input2, setInput2] = useState('');

  const filteredTotal = Array.isArray(researchers)
    ? researchers.filter((item) => {
        const normalizeString = (str: any) =>
          str
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
        const searchString = normalizeString(item.name);
        const normalizedSearch = normalizeString(input2);
        return searchString.includes(normalizedSearch);
      })
    : [];

  return (
    <div className="px-6">
      <Accordion type="single" collapsible className="flex flex-col gap-4">
        <div className="border bg-white dark:bg-neutral-950 rounded-md px-6 h-12 flex items-center gap-1 border-neutral-200 dark:border-neutral-800">
          <MagnifyingGlass size={16} />
          <Input
            className="border-0"
            value={input2}
            onChange={(e) => setInput2(e.target.value)}
            placeholder="Buscar pesquisador na lista"
          />
        </div>

        {/* Mapeamento agora usa o novo componente DocenteListItem */}
        {filteredTotal.map((researcher) => (
          <DocenteListItem
            key={researcher.researcher_id}
            researcher={researcher}
            urlGeral={urlGeral}
            urlGeralAdm={urlGeralAdm}
            onOpen={onOpen}
            fetchDataAll={fetchDataAll}
          />
        ))}
      </Accordion>
    </div>
  );
}

// --- Componente Principal: DocentesGraduate (MODIFICADO) ---

export function DocentesGraduate(props: Props) {
  const { urlGeralAdm, user, urlGeral } = useContext(UserContext);
  const { onOpen, isOpen, type: typeModal } = useModal();
  const [researcher, setResearcher] = useState<PesquisadorProps[]>([]);

  // URL para buscar pesquisadores do programa
  const urlGetResearcher = `${urlGeralAdm}GraduateProgramResearcherRest/Query?graduate_program_id=${props.graduate_program_id}`;

  // Função de busca de dados, agora reutilizável
  const fetchDataAll = async () => {
    console.log('Executando fetchDataAll...'); // Para depuração
    try {
      const response = await fetch(urlGetResearcher, {
        mode: 'cors',
        method: 'GET',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '3600',
          'Content-Type': 'text/plain',
        },
      });
      const data = await response.json();
      if (data) {
        const researchersWithGraduateProgramId = data.map(
          (researcher: PesquisadorProps) => ({
            ...researcher,
            graduate_program_id: props.graduate_program_id, // Injeta o ID do programa
          }),
        );
        setResearcher(researchersWithGraduateProgramId);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Busca inicial
  useEffect(() => {
    fetchDataAll();
  }, [urlGeralAdm, props.graduate_program_id]);

  // Efeito para re-buscar dados QUANDO O MODAL DE DELEÇÃO FECHAR
  useEffect(() => {
    if (typeModal === 'confirm-delete-researcher-graduate-program' && !isOpen) {
      fetchDataAll();
    }
    // Removemos a chamada duplicada que estava aqui
  }, [isOpen, typeModal, fetchDataAll]); // Adicionado fetchDataAll ao array de dependências

  // Lógica de contagem (derivada do estado principal)
  const initialCounts = { permanente: 0, colaborador: 0 };
  const counts = researcher.reduce((acc, researcher) => {
    const participations = researcher.participation;
    if (!participations || participations.length === 0) {
      return acc;
    }
    // Encontra a participação mais recente
    const latestParticipation = participations.reduce((latest, current) => {
      return current.year > latest.year ? current : latest;
    });

    if (latestParticipation.type_ === 'PERMANENTE') {
      acc.permanente++;
    } else if (latestParticipation.type_ === 'COLABORADOR') {
      acc.colaborador++;
    }
    return acc;
  }, initialCounts);

  const permanenteCount = counts.permanente;
  const colaboradorCount = counts.colaborador;

  return (
    <div>
      <CardContent className="flex flex-col justify-between pt-6 ">
        {/* Componente 1: Stats Cards */}
        <DocenteStatsCards
          permanenteCount={permanenteCount}
          colaboradorCount={colaboradorCount}
        />

        {/* Componente 2: Seção de Adicionar (agora recebe fetchDataAll) */}
        <AddDocenteSection
          graduate_program_id={props.graduate_program_id}
          fetchDataAll={fetchDataAll} // Passando a função
        />
      </CardContent>

      {/* Componente 3: Lista de Docentes (agora recebe fetchDataAll e urlGeralAdm) */}
      <DocenteList
        researchers={researcher}
        urlGeral={urlGeral}
        urlGeralAdm={urlGeralAdm} // Passando a URL da API
        onOpen={onOpen}
        fetchDataAll={fetchDataAll} // Passando a função
      />
    </div>
  );
}
