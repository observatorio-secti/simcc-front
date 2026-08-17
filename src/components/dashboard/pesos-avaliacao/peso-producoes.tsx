import {
  ArrowCounterClockwise,
  ArrowUUpLeft,
  Check,
  Stamp,
} from 'phosphor-react';
import { Alert } from '../../ui/alert';
import { useContext, useEffect, useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { toast } from 'sonner';
import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { UserContext } from '../../../context/context';
import { useModal } from '../../hooks/use-modal-store';
import { useModalDashboard } from '../../hooks/use-modal-dashboard';
import { BookOpen, ChevronLeft, File, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../../ui/badge';
import { Helmet } from 'react-helmet';

export function PesoProducoes() {
  const { urlGeralAdm, user } = useContext(UserContext);

  // Artigos em periódicos (Ciências Exatas, Biológicas, Humanas, etc.)
  const [a1, seta1] = useState(''); // Qualis A1 - Melhor classificação
  const [a2, seta2] = useState(''); // Qualis A2
  const [a3, seta3] = useState(''); // Qualis A3
  const [a4, seta4] = useState(''); // Qualis A4
  const [b1, setb1] = useState(''); // Qualis B1
  const [b2, setb2] = useState(''); // Qualis B2
  const [b3, setb3] = useState(''); // Qualis B3
  const [b4, setb4] = useState(''); // Qualis B4
  const [c, setc] = useState(''); // Qualis C (menor classificação)
  const [sq, setsq] = useState(''); // Sem Qualis (não avaliado)

  // Livros e capítulos (Ciências Humanas, Sociais Aplicadas, Letras e Artes)
  const [livro, setLivro] = useState(''); // Livro completo publicado
  const [capLivro, setCapLivro] = useState(''); // Capítulo de livro publicado

  // Trabalhos técnicos e produtos tecnológicos (Engenharias, Ciências Exatas, Multidisciplinar)
  const [t1, setT1] = useState(''); // Trabalho técnico categoria T1 (maior impacto)
  const [t2, setT2] = useState(''); // Trabalho técnico categoria T2
  const [t3, setT3] = useState(''); // Trabalho técnico categoria T3
  const [t4, setT4] = useState(''); // Trabalho técnico categoria T4
  const [t5, setT5] = useState(''); // Trabalho técnico categoria T5 (menor impacto)

  // Produção tecnológica (Engenharias, Ciências Exatas e da Terra, Multidisciplinar)
  const [software, setSoftware] = useState(''); // Desenvolvimento de software
  const [patenteConcedida, setPatenteConcedida] = useState(''); // Patente concedida
  const [patenteNaoConcedida, setPatenteNaoConcedida] = useState(''); // Patente não concedida (em processo)
  const [relTec, setRelTec] = useState(''); // Relatórios técnicos e pareceres

  const [area, setArea] = useState('');

  const urlGet =
    urlGeralAdm +
    `indprod/query?institution_id=${user?.institution_id}&type_:${area}`;
  console.log(urlGet);

  const { onOpen, onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = isOpen && typeModal === 'reset-peso-producoes';
  const [typeReset, setTypeReset] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlGet, {
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
        if (data.length != 0) {
          const newData = data[0]; // Assumindo que data é um array e tem apenas um elemento
          seta1(newData.a1);
          seta2(newData.a2);
          seta3(newData.a3);
          seta4(newData.a4);
          setb1(newData.b1);
          setb2(newData.b2);
          setb3(newData.b3);
          setb4(newData.b4);
          setc(newData.c);
          setsq(newData.sq);
          setT1(newData.f1);
          setT2(newData.f2);
          setT3(newData.f3);
          setT4(newData.f4);
          setT5(newData.f5);
          setLivro(newData.book);
          setCapLivro(newData.book_chapter);
          setSoftware(newData.software);
          setPatenteConcedida(newData.patent_granted);
          setPatenteNaoConcedida(newData.patent_not_granted);
          setRelTec(newData.report);

          console.log(newData);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [area]);

  const qualis = [
    { id: 1, itens: 'A1', valueSetter: seta1, value: a1 },
    { id: 2, itens: 'A2', valueSetter: seta2, value: a2 },
    { id: 3, itens: 'A3', valueSetter: seta3, value: a3 },
    { id: 4, itens: 'A4', valueSetter: seta4, value: a4 },
    { id: 5, itens: 'B1', valueSetter: setb1, value: b1 },
    { id: 6, itens: 'B2', valueSetter: setb2, value: b2 },
    { id: 7, itens: 'B3', valueSetter: setb3, value: b3 },
    { id: 8, itens: 'B4', valueSetter: setb4, value: b4 },
    { id: 10, itens: 'C', valueSetter: setc, value: c },
    { id: 11, itens: 'SQ', valueSetter: setsq, value: sq },
  ];

  const ts = [
    { id: 't1', itens: 'T1', valueSetter: setT1, value: t1 },
    { id: 't2', itens: 'T2', valueSetter: setT2, value: t2 },
    { id: 't3', itens: 'T3', valueSetter: setT3, value: t3 },
    { id: 't4', itens: 'T4', valueSetter: setT4, value: t4 },
    { id: 't5', itens: 'T5', valueSetter: setT5, value: t5 },
  ];

  const qualisColor: { [key: string]: string } = {
    A1: 'bg-[#006837]',
    A2: 'bg-[#8FC53E]',
    A3: 'bg-[#ACC483]',
    A4: 'bg-[#BDC4B1]',
    B1: 'bg-[#F15A24]',
    B2: 'bg-[#F5831F]',
    B3: 'bg-[#F4AD78]',
    B4: 'bg-[#F4A992]',
    C: 'bg-[#EC1C22]',
    SQ: 'bg-[#560B11]',
    NP: 'bg-[#560B11]',
  };

  const tsColor: { [key: string]: string } = {
    T1: 'bg-blue-200',
    T2: 'bg-blue-300',
    T3: 'bg-blue-400',
    T4: 'bg-blue-500',
    T5: 'bg-blue-600',
  };

  const resetArticles = async () => {
    seta1('1');
    seta2('0.875');
    seta3('0.75');
    seta4('0.625');
    setb1('0.5');
    setb2('0.375');
    setb3('0.25');
    setb4('0.125');
    setc('0');
    setsq('0');
  };

  const resetProdCien = async () => {
    setLivro('1');
    setCapLivro('0.25');
  };

  const resetProdTec = async () => {
    setT1('2');
    setT2('1.5');
    setT3('1');
    setT4('0.5');
    setT5('0.1');

    setPatenteConcedida('t4');
    setPatenteNaoConcedida('t4');
    setSoftware('t5');
    setRelTec('t5');
  };

  const url = urlGeralAdm + 'indprod/insert';

  const data = [
    {
      institution_id: user?.institution_id,
      A1: a1,
      A2: a2,
      A3: a3,
      A4: a4,
      B1: b1,
      B2: b2,
      B3: b3,
      B4: b4,
      C: c,
      SQ: sq,

      F1: t1,
      F2: t2,
      F3: t3,
      F4: t4,
      F5: t5,

      BOOK: livro,
      BOOK_CHAPTER: capLivro,

      SOFTWARE: software,
      PATENT_GRANTED: patenteConcedida,
      PATENT_NOT_GRANTED: patenteNaoConcedida,
      REPORT: relTec,

      type_: area,
    },
  ];

  const Submit = () => {
    const fetchData = async () => {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          method: 'POST',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          toast('Dados enviados com sucesso', {
            description: 'Peso de produção atualizado',
            action: {
              label: 'Fechar',
              onClick: () => {},
            },
          });
        } else {
          console.error('Erro ao enviar dados para o servidor.');
          toast('Tente novamente!', {
            description: 'Algo deu errado',
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
  };

  const { isOpen: isOpenDahsboard, type } = useModalDashboard();

  const isModalOpenDashboard = isOpenDahsboard && type === 'peso-producao';

  //voltar
  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  };

  //////////
  const handleAreaChange = (value) => {
    setArea(value);

    const valoresPorArea = {
      ciencia_alimentos: {
        a1: '10',
        a2: '8',
        a3: '6',
        a4: '5',
        b1: '4',
        b2: '3',
        b3: '2',
        b4: '1',
        c: '0.5',
        sq: '0',
        livro: '5',
        capLivro: '3',
        t1: '4',
        t2: '3.5',
        t3: '3',
        t4: '2.5',
        t5: '2',
        software: '7',
        patenteConcedida: '9',
        patenteNaoConcedida: '5',
        relTec: '4',
      },
      ciencias_agrarias1: {
        a1: '9',
        a2: '7',
        a3: '5',
        a4: '4',
        b1: '3',
        b2: '2',
        b3: '1',
        b4: '0.5',
        c: '0.2',
        sq: '0',
        livro: '4',
        capLivro: '2',
        t1: '3',
        t2: '2.5',
        t3: '2',
        t4: '1.5',
        t5: '1',
        software: '6',
        patenteConcedida: '8',
        patenteNaoConcedida: '4',
        relTec: '3',
      },
      medicina_veterinaria: {
        a1: '11',
        a2: '9',
        a3: '7',
        a4: '6',
        b1: '5',
        b2: '4',
        b3: '3',
        b4: '2',
        c: '1',
        sq: '0',
        livro: '6',
        capLivro: '4',
        t1: '5',
        t2: '4',
        t3: '3.5',
        t4: '3',
        t5: '2.5',
        software: '8',
        patenteConcedida: '10',
        patenteNaoConcedida: '6',
        relTec: '5',
      },
      engenharias1: {
        a1: '15',
        a2: '12',
        a3: '9',
        a4: '7',
        b1: '6',
        b2: '5',
        b3: '4',
        b4: '3',
        c: '2',
        sq: '0',
        livro: '6',
        capLivro: '5',
        t1: '8',
        t2: '7',
        t3: '6',
        t4: '5',
        t5: '4',
        software: '10',
        patenteConcedida: '12',
        patenteNaoConcedida: '8',
        relTec: '6',
      },
      enfermagem: {
        a1: '13',
        a2: '11',
        a3: '9',
        a4: '8',
        b1: '6',
        b2: '5',
        b3: '3',
        b4: '2',
        c: '1.5',
        sq: '0',
        livro: '7',
        capLivro: '5',
        t1: '6',
        t2: '5.5',
        t3: '5',
        t4: '4',
        t5: '3.5',
        software: '9',
        patenteConcedida: '11',
        patenteNaoConcedida: '7',
        relTec: '5',
      },
      // Continue adicionando as demais áreas com seus respectivos valores
    };

    const valores = valoresPorArea[value] || {};
    seta1(valores.a1 || '');
    seta2(valores.a2 || '');
    setLivro(valores.livro || '');
    setT1(valores.t1 || '');
    setSoftware(valores.software || '');
  };

  return (
    <>
      <Helmet>
        <title>Pesos de produção | Módulo administrativo | {'Simcc'} </title>
        <meta
          name="description"
          content={`Pesos de produção | Módulo administrativo | ${'Simcc'}`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      {isModalOpenDashboard && (
        <main className="flex flex-1 flex-col p-4 md:p-8">
          <div className="w-full  gap-4">
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
                Pesos de avaliação
              </h1>

              <Link
                to={
                  'https://www.gov.br/capes/pt-br/acesso-a-informacao/acoes-e-programas/avaliacao/sobre-a-avaliacao/areas-avaliacao/sobre-as-areas-de-avaliacao'
                }
                target="_blank"
              >
                {' '}
                <Badge variant="outline" className="flex gap-2 items-center">
                  <Info size={12} />
                  Informações de pesos do Sucupira
                </Badge>
              </Link>

              <div className="hidden items-center gap-2 md:ml-auto md:flex">
                <Button
                  variant={'outline'}
                  onClick={() => {
                    setTypeReset('all');
                    onOpen('reset-peso-producoes');
                  }}
                >
                  <ArrowCounterClockwise size={16} />
                  Resetar
                </Button>

                <Button onClick={() => Submit()}>
                  <Check size={16} />
                  Atualizar índices
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-4 my-8">
            <div className="bg-eng-blue text-white rounded-md flex items-center justify-center w-10 h-10">
              1
            </div>
            <div>
              <p className="text-lg font-medium">Primeiro passo</p>
              <p className="text-gray-500">
                Selecione a área do programa de acordo com a classificação do
                CAPES
              </p>
            </div>
          </div>
          <Select value={area} onValueChange={(value) => setArea(value)}>
            <SelectTrigger
              id="area"
              className="items-start [&_[data-description]]:hidden"
            >
              <SelectValue
                placeholder="Selecione a área de pós-graduação"
                className={'whitespace-nowrap'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ciências Agrárias</SelectLabel>

                {/* Ciências Agrárias */}
                <SelectItem value="ciencia_alimentos">
                  Ciência de Alimentos
                </SelectItem>
                <SelectItem value="ciencias_agrarias1">
                  Ciências Agrárias I
                </SelectItem>
                <SelectItem value="medicina_veterinaria">
                  Medicina Veterinária
                </SelectItem>
                <SelectItem value="zootecnia_pesqueiros">
                  Zootecnia / Recursos Pesqueiros
                </SelectItem>
                <SelectLabel>Ciências Biológicas</SelectLabel>
                {/* Ciências Biológicas */}
                <SelectItem value="biodiversidade">Biodiversidade</SelectItem>
                <SelectItem value="ciencias_biologicas1">
                  Ciências Biológicas I
                </SelectItem>
                <SelectItem value="ciencias_biologicas2">
                  Ciências Biológicas II
                </SelectItem>
                <SelectItem value="ciencias_biologicas3">
                  Ciências Biológicas III
                </SelectItem>

                {/* Ciências da Saúde */}
                <SelectLabel>Ciências da Saúde</SelectLabel>
                <SelectItem value="educacao_fisica">
                  Educação Física, Fisioterapia e Terapia Ocupacional
                </SelectItem>
                <SelectItem value="enfermagem">Enfermagem</SelectItem>
                <SelectItem value="farmacia">Farmácia</SelectItem>
                <SelectItem value="medicina1">Medicina I</SelectItem>
                <SelectItem value="medicina2">Medicina II</SelectItem>
                <SelectItem value="medicina3">Medicina III</SelectItem>
                <SelectItem value="nutricao">Nutrição</SelectItem>
                <SelectItem value="odontologia">Odontologia</SelectItem>
                <SelectItem value="saude_coletiva">Saúde Coletiva</SelectItem>

                <SelectLabel>Ciências Humanas</SelectLabel>
                {/* Ciências Humanas */}
                <SelectItem value="antropologia">
                  Antropologia / Arqueologia
                </SelectItem>
                <SelectItem value="ciencia_politica">
                  Ciência Política e Relações Internacionais
                </SelectItem>
                <SelectItem value="educacao">Educação</SelectItem>
                <SelectItem value="filosofia">Filosofia</SelectItem>
                <SelectItem value="geografia">Geografia</SelectItem>
                <SelectItem value="historia">História</SelectItem>
                <SelectItem value="psicologia">Psicologia</SelectItem>
                <SelectItem value="sociologia">Sociologia</SelectItem>

                <SelectLabel>Ciências Sociais Aplicadas</SelectLabel>
                {/* Ciências Sociais Aplicadas */}
                <SelectItem value="administracao">
                  Administração e Turismo
                </SelectItem>
                <SelectItem value="arquitetura">
                  Arquitetura e Urbanismo
                </SelectItem>
                <SelectItem value="direito">Direito</SelectItem>
                <SelectItem value="economia">Economia</SelectItem>
                <SelectItem value="servico_social">Serviço Social</SelectItem>

                <SelectLabel>Linguística, Letras e Artes</SelectLabel>
                {/* Linguística, Letras e Artes */}
                <SelectItem value="artes">Artes</SelectItem>
                <SelectItem value="linguistica">
                  Linguística e Literatura
                </SelectItem>

                {/* Ciências Exatas e da Terra */}
                <SelectLabel>Ciências Exatas e da Terra</SelectLabel>
                <SelectItem value="astronomia">Astronomia / Física</SelectItem>
                <SelectItem value="computacao">Computação</SelectItem>
                <SelectItem value="geociencias">Geociências</SelectItem>
                <SelectItem value="matematica">
                  Matemática / Estatística
                </SelectItem>
                <SelectItem value="quimica">Química</SelectItem>

                {/* Engenharias */}
                <SelectLabel>Engenharias</SelectLabel>
                <SelectItem value="engenharias1">Engenharias I</SelectItem>
                <SelectItem value="engenharias2">Engenharias II</SelectItem>
                <SelectItem value="engenharias3">Engenharias III</SelectItem>
                <SelectItem value="engenharias4">Engenharias IV</SelectItem>

                {/* Multidisciplinar */}
                <SelectLabel>Multidisciplinar</SelectLabel>
                <SelectItem value="biotecnologia">Biotecnologia</SelectItem>
                <SelectItem value="ciencias_ambientais">
                  Ciências Ambientais
                </SelectItem>
                <SelectItem value="ensino">Ensino</SelectItem>
                <SelectItem value="interdisciplinar">
                  Interdisciplinar
                </SelectItem>
                <SelectItem value="materiais">Materiais</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex gap-4 my-8">
            <div className="bg-eng-blue text-white rounded-md flex items-center justify-center w-10 h-10">
              2
            </div>
            <div>
              <p className="text-lg font-medium">Segundo passo</p>
              <p className="text-gray-500">
                Modifique os valores dos pesos de produção de acordo com a área
              </p>
            </div>
          </div>

          <div></div>

          <div className="mt-2 flex flex-col w-full pb-4 md:pb-8 gap-4 md:gap-8">
            <div className="flex flex-col gap-4 md:gap-8 ">
              <div className="w-full flex">
                <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-eng-blue dark:bg-eng-blue whitespace-nowrap"></div>

                <Alert className="rounded-l-none ">
                  <div className="flex justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3  ">
                        <File size={24} className="text-gray-400" />
                        <p className="text-sm font-bold">Índice artigos</p>
                      </div>
                    </div>

                    <div className="">
                      <Button
                        variant={'ghost'}
                        onClick={() => {
                          setTypeReset('articles');
                          onOpen('reset-peso-producoes');
                        }}
                      >
                        <ArrowCounterClockwise size={16} />
                        Resetar
                      </Button>
                    </div>
                  </div>

                  <div className="gap-4 grid grid-cols-5 ">
                    {qualis.map((props) => {
                      return (
                        <div className="flex gap-3" key={props.id}>
                          <div
                            className={`cursor-pointer gap-3 transition-all flex items-center  rounded-md text-xs font-medium `}
                          >
                            <div
                              className={`rounded-sm h-4 w-4 ${qualisColor[props.itens]}`}
                            ></div>
                            <span className="text-center block">
                              {props.itens}
                            </span>
                          </div>
                          <Input
                            className=""
                            type="number"
                            onChange={(e) => props.valueSetter(e.target.value)}
                            value={Number(props.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </Alert>
              </div>

              <div className="w-full flex">
                <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-eng-blue dark:bg-eng-blue whitespace-nowrap"></div>

                <Alert className="rounded-l-none ">
                  <div className="flex justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 ">
                        <BookOpen size={24} className="text-gray-400" />
                        <p className="text-sm font-bold">
                          Índice livros e capítulos
                        </p>
                      </div>
                    </div>

                    <div className="">
                      <Button
                        variant={'ghost'}
                        onClick={() => {
                          setTypeReset('prodCien');
                          onOpen('reset-peso-producoes');
                        }}
                      >
                        <ArrowCounterClockwise size={16} />
                        Resetar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center  gap-4  ">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-sm h-4 w-4 bg-[#792F4C]`}
                        ></div>
                        <Label className="whitespace-nowrap">Livro</Label>
                      </div>
                      <Input
                        value={livro}
                        onChange={(e) => setLivro(e.target.value)}
                        type="number"
                        placeholder="Peso"
                      />
                    </div>

                    <div className="flex items-center  gap-4 ">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-sm h-4 w-4 bg-[#DBAFD0]`}
                        ></div>
                        <Label className="whitespace-nowrap">
                          Capítulo de livro
                        </Label>
                      </div>
                      <Input
                        value={capLivro}
                        onChange={(e) => setCapLivro(e.target.value)}
                        type="number"
                        placeholder="Peso"
                      />
                    </div>
                  </div>
                </Alert>
              </div>

              <div className="w-full flex ">
                <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-eng-blue dark:bg-eng-blue whitespace-nowrap"></div>

                <Alert className="rounded-l-none ">
                  <div className="flex justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 ">
                        <Stamp size={24} className="text-gray-400" />
                        <p className="text-sm font-bold">
                          Índice produção técnica
                        </p>
                      </div>
                    </div>

                    <div className="">
                      <Button
                        variant={'ghost'}
                        onClick={() => {
                          setTypeReset('prodTec');
                          onOpen('reset-peso-producoes');
                        }}
                      >
                        <ArrowCounterClockwise size={16} />
                        Resetar
                      </Button>
                    </div>
                  </div>

                  <div className="gap-4 grid grid-cols-5 mb-4">
                    {ts.map((props) => {
                      return (
                        <div className="flex gap-3" key={props.id}>
                          <div
                            className={`cursor-pointer gap-3 transition-all flex items-center  rounded-md text-xs font-medium `}
                          >
                            <div
                              className={`rounded-sm h-4 w-4 ${tsColor[props.itens]}`}
                            ></div>
                            <span className="text-center block">
                              {props.itens}
                            </span>
                          </div>
                          <Input
                            className=""
                            type="number"
                            onChange={(e) => props.valueSetter(e.target.value)}
                            value={Number(props.value)}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className=" bg-neutral-200 dark:bg-neutral-800 h-[0.5px] w-full mb-4"></div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center  gap-4  ">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-sm h-4 w-4 bg-[#6BC26B]`}
                        ></div>
                        <Label className="whitespace-nowrap min-w-[150px]">
                          Patente concedida
                        </Label>
                      </div>

                      <Select
                        defaultValue={patenteConcedida}
                        value={patenteConcedida}
                        onValueChange={(value) => setPatenteConcedida(value)}
                      >
                        <SelectTrigger className="w-full whitespace-nowrap">
                          <SelectValue placeholder="Escolha o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ts.map((props) => {
                            return (
                              <SelectItem value={props.id}>
                                {' '}
                                <div className="flex gap-4 items-center mr-2">
                                  <div
                                    className={`flex rounded-sm h-4 w-4 ${tsColor[props.itens]}`}
                                  ></div>
                                  {props.itens}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center  gap-4  ">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-sm h-4 w-4 bg-[#CE3830]`}
                        ></div>
                        <Label className="whitespace-nowrap min-w-[150px]">
                          Patente não concedida
                        </Label>
                      </div>

                      <Select
                        defaultValue={patenteNaoConcedida}
                        value={patenteNaoConcedida}
                        onValueChange={(value) => setPatenteNaoConcedida(value)}
                      >
                        <SelectTrigger className="w-full whitespace-nowrap">
                          <SelectValue placeholder="Escolha o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ts.map((props) => {
                            return (
                              <SelectItem value={props.id}>
                                {' '}
                                <div className="flex gap-4 items-center mr-2">
                                  <div
                                    className={`flex rounded-sm h-4 w-4 ${tsColor[props.itens]}`}
                                  ></div>
                                  {props.itens}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center  gap-4 ">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-sm h-4 w-4 bg-[#096670]`}
                        ></div>
                        <Label className="whitespace-nowrap min-w-[150px]">
                          Software
                        </Label>
                      </div>

                      <Select
                        defaultValue={software}
                        value={software}
                        onValueChange={(value) => setSoftware(value)}
                      >
                        <SelectTrigger className="w-full whitespace-nowrap">
                          <SelectValue placeholder="Escolha o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ts.map((props) => {
                            return (
                              <SelectItem value={props.id}>
                                {' '}
                                <div className="flex gap-4 items-center mr-2">
                                  <div
                                    className={`flex rounded-sm h-4 w-4 ${tsColor[props.itens]}`}
                                  ></div>
                                  {props.itens}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center  gap-4 ">
                      <div className="flex items-center gap-2">
                        <div
                          className={`rounded-sm h-4 w-4 bg-[#662D91]`}
                        ></div>
                        <Label className="whitespace-nowrap min-w-[150px]">
                          Relatório técnico
                        </Label>
                      </div>

                      <Select
                        defaultValue={relTec}
                        value={relTec}
                        onValueChange={(value) => setRelTec(value)}
                      >
                        <SelectTrigger className="w-full whitespace-nowrap">
                          <SelectValue placeholder="Escolha o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ts.map((props) => {
                            return (
                              <SelectItem value={props.id}>
                                {' '}
                                <div className="flex gap-4 items-center mr-2">
                                  <div
                                    className={`flex rounded-sm h-4 w-4 ${tsColor[props.itens]}`}
                                  ></div>
                                  {props.itens}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Alert>
              </div>

              <Dialog open={isModalOpen} onOpenChange={onClose}>
                <DialogContent>
                  <DialogHeader className="pt-8 px-6 flex flex-col items-center">
                    <DialogTitle className="text-2xl text-center font-medium max-w-[350px]">
                      <strong className="bg-red-500 text-white hover:bg-red-600 transition duration-500 font-medium">
                        Resetar
                      </strong>{' '}
                      {typeReset == 'all' && 'todos os pesos de produções'}{' '}
                      {typeReset == 'articles' && 'todos os artigos'}{' '}
                      {typeReset == 'prodCien' &&
                        'todas as produções científicas'}{' '}
                      {typeReset == 'prodTec' && 'todas as produções técnicas'}
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500">
                      Você tem certeza de que deseja prosseguir e resetar os
                      pesos de produções? Isso irá impactar os índices de
                      produções
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter className=" py-4 ">
                    <Button variant={'ghost'} onClick={() => onClose()}>
                      <ArrowUUpLeft size={16} className="" />
                      Voltar
                    </Button>

                    <Button
                      variant={'destructive'}
                      onClick={() => {
                        if (typeReset == 'all') {
                          resetArticles();
                          resetProdCien();
                          resetProdTec();
                          onClose();
                        } else if (typeReset == 'articles') {
                          resetArticles();
                          onClose();
                        } else if (typeReset == 'prodCien') {
                          resetProdCien();
                          onClose();
                        } else if (typeReset == 'prodTec') {
                          resetProdTec();
                          onClose();
                        }
                      }}
                    >
                      <ArrowCounterClockwise size={16} className="" />
                      Resetar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </main>
      )}
    </>
  );
}
