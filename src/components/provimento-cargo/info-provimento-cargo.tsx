import { GraduationCap, Info, MapPin, Timer, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CalendarBlank, PuzzlePiece, Rows, SquaresFour } from 'phosphor-react';
import { useContext, useMemo, useState } from 'react';
import { UserContext } from '../../context/context';
import { Research } from '../researcher/researcher-page';
import { toast } from 'sonner';
import { Alert } from '../ui/alert';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { DataTable } from '../dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
interface Props {
  name: string;
  dados: Dados[];
}

export interface Dados {
  nome: string;
  cpf: string;
  classe: number;
  nivel: number;
  inicio: string;
  fim: string;
  tempo_nivel: number;
  tempo_acumulado: number;
  arquivo: string;
  fimCorreto?: string | null;
  inicioCorreto?: string | null;
}

export function InfoPavimentoCargo(props: Props) {
  const {
    urlGeral,
    user,
    itemsSelecionados,
    setSearchType,
    setValoresSelecionadosExport,
    setItensSelecionadosPopUp,
    searchType,
    valoresSelecionadosExport,
    setPesquisadoresSelecionados,
    pesquisadoresSelecionados,
    setItensSelecionados,
    permission,
  } = useContext(UserContext);

  const [mestrado, setMestrado] = useState('');
  const [doutorado, setDoutorado] = useState('');
  const [loading, isLoading] = useState(false);
  const [researcher, setResearcher] = useState<Research[]>([]);

  const urlTermPesquisadores = urlGeral + `researcherName?name=${props.name}`;

  useMemo(() => {
    const fetchData = async () => {
      try {
        isLoading(true);
        const response = await fetch(urlTermPesquisadores, {
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
          setResearcher(data);
          isLoading(false);
        }
        if (data.length == 0) {
          toast('Pesquisador(a) ainda não cerregado na base', {
            description: 'Tente novamente mais tarde',
            action: {
              label: 'Fechar',
              onClick: () => {},
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermPesquisadores]);

  const intersticio_tabela = {
    '4': { 1: 730, 2: 365 },
    '5': { 1: 730, 2: 730 },
    '6': { 1: 730, 2: 730, 3: 730, 4: 730 },
    '7': { 1: 730, 2: 730, 3: 730, 4: 730 },
    '8': { 1: 730 },
  };

  // Ordena os dados por classe e nível
  const sortedData = props.dados.sort((a, b) => {
    if (a.classe !== b.classe) return a.classe - b.classe;
    return a.nivel - b.nivel;
  });

  const lastItem = sortedData[sortedData.length - 1];
  const futureProgressions: Dados[] = [];
  let currentClasse = lastItem.classe;
  let currentNivel = lastItem.nivel;
  let currentDate = new Date(lastItem.fim);

  // Gerar progressões futuras sem duplicação
  while (intersticio_tabela[currentClasse]?.[currentNivel]) {
    currentNivel += 1;

    if (!intersticio_tabela[currentClasse]?.[currentNivel]) {
      currentClasse += 1;
      currentNivel = 1;
    }

    const tempoEsperado = intersticio_tabela[currentClasse]?.[currentNivel];
    if (!tempoEsperado) break;

    const newInicio = new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000);
    const newFim = new Date(
      newInicio.getTime() + tempoEsperado * 24 * 60 * 60 * 1000,
    );

    futureProgressions.push({
      nome: lastItem.nome,
      cpf: lastItem.cpf,
      classe: currentClasse,
      nivel: currentNivel,
      inicio: newInicio.toISOString(),
      fim: newFim.toISOString(),
      tempo_nivel: tempoEsperado,
      tempo_acumulado: 0,
      arquivo: '',
    });

    currentDate = newFim;
  }

  // Combina os dados atuais com progressões futuras
  const combinedData = [...sortedData, ...futureProgressions];
  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[300px]" />
  ));

  const [typeVisu, setTypeVisu] = useState('block');
  const [typeVisu2, setTypeVisu2] = useState('block');

  ////////////
  const columns: ColumnDef<Dados>[] = [
    {
      accessorKey: 'classe',
      header: 'Classe',
    },
    {
      accessorKey: 'nivel',
      header: 'Nível',
    },
    {
      accessorKey: 'inicio',
      header: 'Início',
      cell: ({ row }) =>
        new Date(row.original.inicio).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'fim',
      header: 'Fim',
      cell: ({ row }) =>
        row.original.fim
          ? new Date(row.original.fim).toLocaleDateString('pt-BR')
          : 'N/A',
    },
    {
      accessorKey: 'tempo_nivel',
      header: 'Tempo no Cargo',
      cell: ({ row }) =>
        row.original.tempo_nivel ? `${row.original.tempo_nivel} dias` : 'N/A',
    },
    {
      accessorKey: 'inicioCorreto',
      header: 'Início Correto',
      cell: ({ row }) =>
        row.original.inicioCorreto
          ? new Date(row.original.inicioCorreto).toLocaleDateString('pt-BR')
          : 'N/A',
    },
    {
      accessorKey: 'fimCorreto',
      header: 'Fim Correto',
      cell: ({ row }) =>
        row.original.fimCorreto
          ? new Date(row.original.fimCorreto).toLocaleDateString('pt-BR')
          : 'N/A',
    },
  ];

  const processData = combinedData.map((item, index) => {
    const inicioDate = new Date(item.inicio);
    const fimDate =
      index === sortedData.length - 1 && !item.fim
        ? new Date(
            inicioDate.getTime() +
              (intersticio_tabela[item.classe]?.[item.nivel] ?? 0) *
                24 *
                60 *
                60 *
                1000,
          )
        : new Date(item.fim);

    const hasPriorValidItem = combinedData.some(
      (prevItem, prevIndex) =>
        prevIndex < index &&
        prevItem.tempo_acumulado > 0 &&
        prevItem.tempo_nivel != null,
    );

    let inicioCorreto = '';
    let fimCorreto = '';

    if (
      hasPriorValidItem ||
      (item.tempo_acumulado > 0 && item.tempo_nivel != null)
    ) {
      inicioCorreto = new Date(
        index === 0
          ? inicioDate.getTime() + 1 * 24 * 60 * 60 * 1000
          : new Date(combinedData[index - 1]?.fim).getTime() +
            1 * 24 * 60 * 60 * 1000,
      ).toISOString();

      fimCorreto = new Date(
        new Date(inicioCorreto).getTime() +
          (intersticio_tabela[item.classe]?.[item.nivel] ?? 0) *
            24 *
            60 *
            60 *
            1000,
      ).toISOString();

      item.fimCorreto = fimCorreto;
    }

    return { ...item, inicioCorreto, fimCorreto };
  });

  //////

  const formatarData = (valor: string) => {
    // Remove tudo que não seja número
    const cleaned = valor.replace(/\D/g, '');

    // Aplica a máscara de data dd/mm/aaaa
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 4) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    } else {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
    }
  };

  const handleChange = (e: any) => {
    const formattedValue = formatarData(e);
    setDoutorado(formattedValue);
  };

  const handleChangeD = (e: any) => {
    const formattedValue = formatarData(e);
    setMestrado(formattedValue);
  };

  return (
    <main className="flex gap-8 flex-col">
      {researcher.slice(0, 1).map((props) => {
        return (
          <div className="my-8 flex items-center gap-8">
            <Avatar className="cursor-pointer rounded-2xl  h-28 w-28">
              <AvatarImage
                className={'rounded-md h-28 w-28'}
                src={`${urlGeral}ResearcherData/Image?name=${props.name}`}
              />
              <AvatarFallback className="flex items-center justify-center">
                <User size={16} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className=" max-w-[500px] text-2xl font-medium leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]  md:block mb-3 ">
                Provimento de cargo de {props.name}
              </h1>
              <div className="flex flex-wrap flex-1 items-center gap-3 mt-2">
                {props.area != null &&
                  props.area.split(';').map((value, index) => (
                    <li
                      key={index}
                      className={`py-2 whitespace-nowrap px-4 rounded-md text-xs font-bold flex gap-2 text-white items-center ${value.split('_').join(' ').includes('CIENCIAS AGRARIAS') ? 'bg-red-400' : value.includes('CIENCIAS EXATAS E DA TERRA') ? 'bg-green-400' : value.includes('CIENCIAS DA SAUDE') ? 'bg-[#20BDBE]' : value.includes('CIENCIAS HUMANAS') ? 'bg-[#F5831F]' : value.includes('CIENCIAS BIOLOGICAS') ? 'bg-[#EB008B]' : value.includes('ENGENHARIAS') ? 'bg-[#FCB712]' : value.includes('CIENCIAS SOCIAIS APLICADAS') ? 'bg-[#009245]' : value.includes('LINGUISTICA LETRAS E ARTES') ? 'bg-[#A67C52]' : value.includes('OUTROS') ? 'bg-[#1B1464]' : 'bg-[#000]'}`}
                    >
                      <PuzzlePiece size={12} className="text-white" />{' '}
                      {value.trim().split('_').join(' ')}
                    </li>
                  ))}
                {props.graduation != '' && (
                  <div
                    className={`bg-blue-700 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center`}
                  >
                    <GraduationCap size={12} className="textwhite" />{' '}
                    {props.graduation}
                  </div>
                )}

                {props.city != 'None' && (
                  <div className="bg-blue-700 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center">
                    <MapPin size={12} className="textwhite" /> {props.city}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <fieldset className="grid gap-6 rounded-lg  p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 bg-cover  bg-center bg-no-repeat">
        <legend className="-ml-1 px-1 text-sm font-medium">Informações</legend>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2 mt-4 w-full">
            <Label>Conclusão do mestrado</Label>
            <Input
              value={mestrado}
              onChange={(e) => handleChangeD(e.target.value)}
              type="text"
            />
          </div>

          <div className="flex flex-col gap-2 mt-4 w-full">
            <Label>Conclusão do doutorado</Label>
            <Input
              value={doutorado}
              onChange={(e) => handleChange(e.target.value)}
              type="text"
            />
          </div>
        </div>
      </fieldset>

      <h2 className="text-2xl font-medium ">Índices</h2>

      <Alert className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-sm font-medium">
              Projeção estimada de salário
            </CardTitle>
            <CardDescription>Bolsas PQ e DT </CardDescription>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                {' '}
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Fonte: Conectee</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>

        <CardContent className="py-0 flex-1 items-center justify-center"></CardContent>
      </Alert>

      <Accordion defaultValue="item-1" type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex mb-2">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-2xl font-medium ">
                Progressores e acelerações
              </h2>
              <div className="flex gap-3 mr-3">
                <Button
                  onClick={() => setTypeVisu('rows')}
                  variant={typeVisu === 'block' ? 'ghost' : 'outline'}
                  size={'icon'}
                >
                  <Rows size={16} className="whitespace-nowrap" />
                </Button>
                <Button
                  onClick={() => setTypeVisu('block')}
                  variant={typeVisu === 'block' ? 'outline' : 'ghost'}
                  size={'icon'}
                >
                  <SquaresFour size={16} className="whitespace-nowrap" />
                </Button>
              </div>
            </div>
            <AccordionTrigger></AccordionTrigger>
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
                    1700: 7,
                  }}
                >
                  <Masonry gutter="16px">
                    {items.map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                <ResponsiveMasonry
                  columnsCountBreakPoints={{
                    350: 1,
                    750: 2,
                    900: 3,
                    1200: 4,
                  }}
                >
                  <Masonry gutter="16px">
                    {combinedData.map((item, index) => {
                      const inicioDate = new Date(item.inicio);
                      const fimDate =
                        index === sortedData.length - 1 && !item.fim
                          ? new Date(
                              inicioDate.getTime() +
                                (intersticio_tabela[item.classe]?.[
                                  item.nivel
                                ] ?? 0) *
                                  24 *
                                  60 *
                                  60 *
                                  1000,
                            )
                          : new Date(item.fim);

                      // Verifica se o item anterior tem tempo acumulado > 0
                      const hasPriorValidItem = combinedData.some(
                        (prevItem, prevIndex) =>
                          prevIndex < index &&
                          prevItem.tempo_acumulado > 0 &&
                          prevItem.tempo_nivel != null,
                      );

                      // Variáveis para armazenar o inicio e fim corretos
                      let inicioCorreto: string | null = null;
                      let fimCorreto: string | null = null;

                      // Calcula o início e o fim corretos apenas a partir do primeiro item com tempo acumulado > 0
                      if (
                        hasPriorValidItem ||
                        (item.tempo_acumulado > 0 && item.tempo_nivel != null)
                      ) {
                        if (hasPriorValidItem) {
                          const fimAnterior =
                            combinedData[index - 1]?.fimCorreto;
                          if (fimAnterior) {
                            inicioCorreto =
                              index === 0
                                ? new Date(
                                    inicioDate.getTime() +
                                      1 * 24 * 60 * 60 * 1000,
                                  ).toISOString() // Início correto do primeiro item
                                : new Date(
                                    new Date(fimAnterior).getTime() +
                                      1 * 24 * 60 * 60 * 1000,
                                  ).toISOString(); // Início correto a partir do fim do item anterior
                          } else {
                            console.warn(
                              'fimCorreto é inválido ou indefinido para o item anterior.',
                            );
                          }
                        } else {
                          inicioCorreto =
                            index === 0
                              ? new Date(
                                  inicioDate.getTime() +
                                    1 * 24 * 60 * 60 * 1000,
                                ).toISOString() // Início correto do primeiro item
                              : new Date(
                                  new Date(
                                    combinedData[index - 1]?.fim,
                                  ).getTime() +
                                    1 * 24 * 60 * 60 * 1000,
                                ).toISOString(); // Início correto a partir do fim do item anterior
                        }

                        fimCorreto =
                          inicioCorreto &&
                          new Date(
                            new Date(inicioCorreto).getTime() +
                              (intersticio_tabela[item.classe]?.[item.nivel] ??
                                0) *
                                24 *
                                60 *
                                60 *
                                1000,
                          ).toISOString(); // Fim correto a partir do início calculado

                        // Atribuindo fimCorreto diretamente ao item dentro do combinedData
                        item.fimCorreto = fimCorreto; // Atualizando a propriedade fimCorreto diretamente no item
                      }

                      return (
                        <div className="flex w-full group" key={index}>
                          <div
                            className={`h-full w-2 ${
                              index > sortedData.length - 1
                                ? 'bg-blue-600'
                                : item.tempo_nivel == null
                                  ? 'bg-blue-200'
                                  : item.tempo_acumulado > 0 &&
                                      item.tempo_nivel != null
                                    ? 'bg-orange-600'
                                    : 'bg-green-600'
                            } rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0`}
                          ></div>
                          <Alert className="rounded-l-none flex flex-col justify-between p-0 alert">
                            <div className="p-4 pb-0">
                              <h3 className="font-semibold mb-1 flex flex-1">
                                {item.classe == 4 &&
                                  item.nivel == 1 &&
                                  'Auxiliar (G/E) (M)'}
                                {item.classe == 4 &&
                                  item.nivel == 2 &&
                                  'Auxiliar Adjunto (D)'}
                                {item.classe == 5 && 'Assistente'}
                                {item.classe == 6 && 'Adjunto'}
                                {item.classe == 7 && 'Associado'}
                                {item.classe == 8 && 'Titular'}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4">
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                  Classe: {item.classe}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                  Nível: {item.nivel}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center mt-4 p-4 gap-3">
                              {props.dados.some(
                                (dado) =>
                                  dado.classe === item.classe &&
                                  dado.nivel === item.nivel,
                              ) && (
                                <>
                                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                    <CalendarBlank size={12} />
                                    Início:{' '}
                                    {inicioDate.toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </div>

                                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                    <CalendarBlank size={12} />
                                    Fim:{' '}
                                    {fimDate.toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    })}
                                  </div>

                                  {item.tempo_nivel != null && (
                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                      <Timer size={12} />
                                      Tempo no cargo: {item.tempo_nivel} dias
                                    </div>
                                  )}
                                </>
                              )}
                              {(inicioCorreto || fimCorreto) && (
                                <>
                                  {inicioCorreto && (
                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                      <CalendarBlank size={12} />
                                      Início correto:{' '}
                                      {new Date(
                                        inicioCorreto,
                                      ).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                      })}
                                    </div>
                                  )}
                                  {fimCorreto && (
                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                      <CalendarBlank size={12} />
                                      Fim correto:{' '}
                                      {new Date(fimCorreto).toLocaleDateString(
                                        'pt-BR',
                                        {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        },
                                      )}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </Alert>
                        </div>
                      );
                    })}
                  </Masonry>
                </ResponsiveMasonry>
              )
            ) : loading ? (
              <Skeleton className="w-full rounded-md h-[400px]" />
            ) : (
              <div>
                <DataTable columns={columns} data={processData} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Accordion defaultValue="item-1" type="single" collapsible>
        <AccordionItem value="item-1">
          <div className="flex mb-2">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-2xl font-medium ">Valores a receber</h2>
              <div className="flex gap-3 mr-3">
                <Button
                  onClick={() => setTypeVisu2('rows')}
                  variant={typeVisu2 === 'block' ? 'ghost' : 'outline'}
                  size={'icon'}
                >
                  <Rows size={16} className="whitespace-nowrap" />
                </Button>
                <Button
                  onClick={() => setTypeVisu2('block')}
                  variant={typeVisu2 === 'block' ? 'outline' : 'ghost'}
                  size={'icon'}
                >
                  <SquaresFour size={16} className="whitespace-nowrap" />
                </Button>
              </div>
            </div>
            <AccordionTrigger></AccordionTrigger>
          </div>

          <AccordionContent></AccordionContent>
        </AccordionItem>
      </Accordion>
    </main>
  );
}
