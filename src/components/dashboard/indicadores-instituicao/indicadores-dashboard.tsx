import {
  ChevronLeft,
  Download,
  File,
  GraduationCap,
  Hash,
  Info,
  Upload,
  User,
  UserCog,
  Users,
} from 'lucide-react';
import { useModalDashboard } from '../../hooks/use-modal-dashboard';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../ui/alert';
import { CardContent, CardHeader, CardTitle } from '../../ui/card';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserContext } from '../../../context/context';
import { FileXls, Student } from 'phosphor-react';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

interface TotalPatrimonios {
  count_gp: string;
  count_gpr: string;
  institution_id: string;
  count_r: string;
  count_d: string;
  count_gps: string;
  count_t: string;
  name: string;
}

interface Bolsistas {
  aid_quantity: string;
  call_title: string;
  funding_program_name: string;
  modality_code: string;
  category_level_code: string;
  institute_name: string;
  modality_name: string;
  name: string;
  researcher_id: string;
  scholarship_quantity: string;
}

import { ChartConfig } from '../../../components/ui/chart';

interface Docentes {
  matric: string;
  inscUFMG: string;
  nome: string;
  genero: string;
  situacao: string;
  rt: string;
  clas: string;
  cargo: string;
  classe: string;
  ref: string;
  titulacao: string;
  entradaNaUFMG: string;
  progressao: string;
  year_charge: string;
  semester: string;
}

interface Tecnicos {
  cargo: string;
  classe: string;
  data_prog: string;
  deno_sit: string;
  detalhe_setor: string;
  dting_org: string;
  genero: string;
  ins_ufmg: string;
  matric: string;
  nivel: string;
  nome: string;
  ref: string;
  rt: string;
  semester: string;
  setor: string;
  titulacao: string;
}

type Research = {
  count_article: number;
  count_book: number;
  count_book_chapter: number;
  count_guidance: number;
  count_patent: number;
  count_report: number;
  count_software: number;
  count_guidance_complete: number;
  count_guidance_in_progress: number;
  count_patent_granted: number;
  count_patent_not_granted: number;
  count_brand: number;
  year: number;
  A1: number;
  A2: number;
  A3: number;
  A4: number;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
  C: number;
  SQ: number;
};

interface VisaoPrograma {
  article: number;
  book: number;
  book_chapter: number;
  brand: number;
  patent: number;
  researcher: string;
  software: number;
  work_in_event: number;
}

interface YearSemester {
  year: string;
  semester: string;
}

import bg_popup from '../../../assets/bg_popup.png';
import { useModal } from '../../hooks/use-modal-store';

import { Helmet } from 'react-helmet';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../ui/accordion';
import { ColorPicker } from '../../ui/color-picker';
import { Input } from '../../ui/input';
import { Label as LabelUi } from '../../ui/label';

const chartConfig = {
  'Produtividade em Pesquisa': {
    label: 'Produtividade em Pesquisa',
    color: '#809BB5',
  },
  'Desen. Tec. e Extensão Inovadora': {
    label: 'Desen. Tec. e Extensão Inovadora',
    color: '#A6BCCD',
  },
  'Outros docentes': {
    label: 'Outros docentes',
    color: '#354A5C',
  },
} satisfies ChartConfig;

const chartConfig3 = {
  'Participam da pós-graduação': {
    label: 'Participam da pós-graduação',
    color: '#809BB5',
  },

  'Outros docentes': {
    label: 'Outros docentes',
    color: '#354A5C',
  },
} satisfies ChartConfig;

const chartConfig2 = {
  views: {
    label: 'Page Views',
  },
  producao_bibliografica: {
    label: 'Produção bibliográfica',
    color: 'hsl(var(--chart-1))',
  },
  producao_tecnica: {
    label: 'Produção técnica',
    color: 'hsl(var(--chart-2))',
  },
  count_article: {
    label: 'Artigos',
    color: 'hsl(var(--chart-2))',
  },
  count_book: {
    label: 'Livros',
    color: 'hsl(var(--chart-2))',
  },
  count_book_chapter: {
    label: 'Capítulos de livros',
    color: 'hsl(var(--chart-2))',
  },
  count_patent: {
    label: 'Patentes',
    color: 'hsl(var(--chart-2))',
  },
  count_brand: {
    label: 'Marcas',
    color: 'hsl(var(--chart-2))',
  },
  count_software: {
    label: 'Softwares',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

function generateYearSemesterArray(
  startYear: number,
  startSemester: number,
  endYear: number,
  endSemester: number,
): YearSemester[] {
  const result: YearSemester[] = [];
  for (let year = startYear; year <= endYear; year++) {
    for (let semester = 1; semester <= 2; semester++) {
      if (year === endYear && semester > endSemester) break;
      result.push({ year: year.toString(), semester: semester.toString() });
    }
  }
  return result;
}

export function IndicadoresDashboard() {
  const { isOpen, type } = useModalDashboard();

  const { onOpen } = useModal();

  const isModalOpen = isOpen && type === 'indicadores';

  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  };

  const { user, urlGeralAdm, urlGeral, setItensSelecionados } =
    useContext(UserContext);

  const [total, setTotal] = useState<TotalPatrimonios[]>([]);

  const urlPatrimonioInsert = `${urlGeralAdm}/InstitutionRest/Query/Count?institution_id=${user?.institution_id}`;
  console.log(urlPatrimonioInsert);
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
        if (data) {
          setTotal(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlPatrimonioInsert]);

  console.log(urlPatrimonioInsert);

  const [profile, setProfile] = useState({
    img_perfil: '',
    img_background: '',
    institution_id: '',
    color: '',
    site: '',
    name: '',
  });

  useEffect(() => {
    if (total?.[0]) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        institution_id: total[0]?.institution_id || '', // Se não for array, pega direto
        name: total[0]?.name || '',
      }));
    }
  }, [total]); // Atualiza sempre que `total` mudar

  console.log('total', total);

  //Anos arquivos enviados docentes

  const [year, setYear] = useState(new Date().getFullYear() - 9);

  const [dados, setDados] = useState<Research[]>([]);

  const urlDados = `${urlGeral}ResearcherData/DadosGerais?year=${year}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlDados, {
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
          setDados(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlDados]);

  const [activeChart, setActiveChart] = useState<keyof typeof chartConfig2>(
    'producao_bibliografica',
  );

  const totalBiblio = useMemo(
    () => ({
      producao_bibliografica: dados.reduce(
        (acc, curr) =>
          acc +
          Number(curr.count_article) +
          Number(curr.count_book) +
          Number(curr.count_book_chapter),
        0,
      ),
      producao_tecnica: dados.reduce(
        (acc, curr) =>
          acc + curr.count_patent + curr.count_software + curr.count_brand,
        0,
      ),
    }),
    [dados],
  );

  const { onOpen: onOpenModal } = useModal();

  //

  const [VisaoPrograma, setVisaoPrograma] = useState<VisaoPrograma[]>([]);

  const urlVisaoPrograma = `${urlGeral}graduate_program_production?graduate_program_id=0&year=1900`;
  useMemo(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlVisaoPrograma, {
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
          setVisaoPrograma(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlVisaoPrograma]);

  /////////////// csv

  const url =
    'https://app.powerbi.com/view?r=eyJrIjoiNTBjNmQ3NWQtODNmZC00MWZkLThjNWEtZjU5YmE2ZDkwMjVkIiwidCI6IjcyNjE3ZGQ4LTM3YTUtNDJhMi04YjIwLTU5ZDJkMGM1MDcwNyJ9';

  console.log(profile);

  const db = getFirestore();
  const storage = getStorage();
  const isDataLoaded = useRef(false); // Evita loops de salvamento

  // Carregar dados ao montar a página
  useEffect(() => {
    if (profile.institution_id) {
      const fetchInstitutionData = async () => {
        const docRef = doc(db, 'institutions', profile.institution_id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          setProfile({
            institution_id: data?.institution_id || '',
            img_background: data?.img_background || '',
            img_perfil: data?.img_perfil || '',
            color: data?.color || '',
            site: data?.site || '',
            name: data?.name || '',
          });

          isDataLoaded.current = true; // Marca que os dados foram carregados
        } else {
          console.log('Instituição não encontrada. Criando novo registro...');
          await setDoc(docRef, {
            img_background: '',
            img_perfil: '',
            color: '',
            site: '',
            name: '',
          });
          isDataLoaded.current = true;
        }
      };

      fetchInstitutionData();
    }
  }, [profile.institution_id]);

  console.log('profile', profile);

  // Salvar automaticamente no Firebase quando os dados mudam
  useEffect(() => {
    if (profile.institution_id && isDataLoaded.current) {
      const saveData = async () => {
        await setDoc(doc(db, 'institutions', profile.institution_id), profile, {
          merge: true,
        });
      };
      saveData();
    }
  }, [profile]);

  // Função para upload de imagem
  const handleUpload = async (folder: 'perfil' | 'background') => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file || !profile.institution_id) return;

      const storagePath = `institutions/${profile.institution_id}/${folder}/${file.name}`;
      const storageRef = ref(storage, storagePath);

      toast.info('Enviando imagem...');
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      setProfile((prev) => ({
        ...prev,
        img_background:
          folder === 'background' ? downloadURL : prev.img_background,
        img_perfil: folder === 'perfil' ? downloadURL : prev.img_perfil,
      }));

      await setDoc(
        doc(db, 'institutions', profile.institution_id),
        { [`img_${folder}`]: downloadURL },
        { merge: true },
      );

      toast.success('Upload concluído!');
    };
  };

  return (
    <>
      <Helmet>
        <title>
          Indicadores da instituição | Módulo administrativo | {'Simcc'}{' '}
        </title>
        <meta
          name="description"
          content={`Indicadores da instituição | Módulo administrativo | ${'Simcc'}`}
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      {isModalOpen && (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <Tabs defaultValue={'all'} className="h-full">
            <div className="w-full mb-8  gap-4">
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
                  Indicadores da Instituição
                </h1>

                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                  <TabsList>
                    <TabsTrigger
                      value="all"
                      className="text-zinc-600 dark:text-zinc-200"
                    >
                      Visão geral
                    </TabsTrigger>
                  </TabsList>
                  {false && (
                    <Button
                      size={'sm'}
                      onClick={() => onOpen('import-docentes')}
                    >
                      <FileXls size={16} />
                      Importar dados dos docentes
                    </Button>
                  )}

                  {false && (
                    <Button size={'sm'} onClick={() => onOpen('import-taes')}>
                      <FileXls size={16} />
                      Importar dados dos técnicos
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <TabsContent
              value="all"
              className="h-auto flex flex-col gap-4 md:gap-8  mt-2"
            >
              <div className="flex flex-col items-center md:flex-row gap-6 w-full">
                <div className="w-full">
                  {/* 🔹 Seção de Background */}
                  <Alert
                    className="h-[200px] flex justify-end bg-no-repeat bg-center bg-cover"
                    style={{
                      backgroundImage: `url(${profile.img_background})`,
                    }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpload('background')}
                    >
                      <Upload size={16} /> Alterar imagem
                    </Button>
                  </Alert>

                  {/* 🔹 Avatar do usuário */}
                  <div className="relative group w-fit -top-16 px-16">
                    <Alert
                      className="aspect-square bg-no-repeat bg-center bg-contain rounded-md h-28 bg-white dark:bg-white"
                      style={{ backgroundImage: `url(${profile.img_perfil})` }}
                    ></Alert>
                    {/* 🔹 Overlay de Upload */}
                    <div
                      className="aspect-square rounded-md h-28 group-hover:flex bg-black/20 items-center justify-center absolute hidden top-0 z-[1] cursor-pointer"
                      onClick={() => handleUpload('perfil')}
                    >
                      <Upload size={20} />
                    </div>
                  </div>

                  {/* 🔹 Accordion com detalhes */}
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <div className="md:px-16 -top-8 relative flex justify-between">
                        <div>
                          <h1 className="text-2xl max-w-[800px] font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                            {total.map((props) => props.name)}
                          </h1>
                          <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center capitalize">
                            <Hash size={12} />
                            {total.map((props) => props.institution_id)}
                          </div>
                        </div>
                        <AccordionTrigger />
                      </div>

                      <AccordionContent className="md:px-16 flex gap-4 w-full">
                        {/* 🔹 Campo Site */}
                        <div className="flex flex-col gap-2 w-full">
                          <LabelUi>Site da instituição</LabelUi>
                          <Input
                            type="text"
                            value={profile.site}
                            onChange={(e) => {
                              setProfile((prev) => ({
                                ...prev,
                                site: e.target.value,
                              }));
                            }}
                          />
                        </div>

                        {/* 🔹 Campo Cor Base */}
                        <div className="flex flex-col gap-2 w-full">
                          <LabelUi>Cor base</LabelUi>
                          <div className="flex gap-4">
                            <Input
                              type="text"
                              value={profile.color}
                              onChange={(e) => {
                                setProfile((prev) => ({
                                  ...prev,
                                  color: e.target.value,
                                }));
                              }}
                            />
                            <ColorPicker
                              value={profile.color}
                              onChange={(v) => {
                                setProfile((prev) => ({ ...prev, color: v }));
                              }}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>

              <div
                className={`grid gap-4 md:grid-cols-2 md:gap-8  ${'lg:grid-cols-3'}`}
              >
                <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de docentes
                    </CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {total.map((props) => props.count_r)}
                    </div>
                    <p className="text-xs text-muted-foreground">registrados</p>
                  </CardContent>
                </Alert>

                {false && (
                  <Alert className="p-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total de Técnicos
                      </CardTitle>
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {total.map((props) => props.count_t)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        registrados
                      </p>
                    </CardContent>
                  </Alert>
                )}

                <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de discentes
                    </CardTitle>
                    <Student className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {total.map((props) => props.count_gps)}
                    </div>
                    <p className="text-xs text-muted-foreground">cadastrados</p>
                  </CardContent>
                </Alert>

                <Alert className="p-0">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de pós-graduação
                    </CardTitle>
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {total.map((props) => props.count_gp)}
                    </div>
                    <p className="text-xs text-muted-foreground">cadastrados</p>
                  </CardContent>
                </Alert>
              </div>

              <Alert
                className=" bg-cover bg-no-repeat bg-center"
                style={{ backgroundImage: `url(${bg_popup})` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Crie e edite
                  </CardTitle>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <div className="flex gap-6 justify-between">
                  <CardContent>
                    <div className="text-2xl font-bold">
                      Você também pode baixar o Power Bi e criar seus próprios
                      indicadores
                    </div>
                    <div className="flex gap-3 mt-3">
                      <Button size={'sm'}>
                        <Download size={16} />
                        Baixar arquivo
                      </Button>
                      <Button size={'sm'} variant={'ghost'}>
                        <File size={16} />
                        Ver manual
                      </Button>
                    </div>
                  </CardContent>

                  <div></div>
                </div>
              </Alert>

              <h3 className="text-2xl font-medium ">Atualização de dados</h3>

              {false && (
                <h3 className="text-2xl font-medium ">Atualização de dados</h3>
              )}

              {false && (
                <div className="gap-8 grid lg:grid-cols-2">
                  <Alert className="bg-eng-blue dark:bg-eng-blue text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Importação de Dados
                      </CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <div className="flex gap-6 justify-between">
                      <CardContent>
                        <div className="text-2xl font-bold">
                          Mantenha os dados sempre atualizados! Faça o upload do
                          arquivo <strong>.xls</strong> com as informações dos
                          docentes.
                        </div>
                        <div className="flex gap-3 mt-3">
                          <Button
                            onClick={() => onOpenModal('import-docentes')}
                            size="sm"
                            variant="link"
                            className="text-white"
                          >
                            <FileXls size={16} />
                            Enviar arquivo
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Alert>

                  <Alert className="bg-eng-dark-blue text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Importação de Dados
                      </CardTitle>
                      <UserCog className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <div className="flex gap-6 justify-between">
                      <CardContent>
                        <div className="text-2xl font-bold">
                          Padronize suas informações! Faça upload do arquivo{' '}
                          <strong>.xls</strong> para importar os dados dos TAEs.
                        </div>
                        <div className="flex gap-3 mt-3">
                          <Button
                            onClick={() => onOpenModal('import-taes')}
                            size="sm"
                            variant="link"
                            className="text-white"
                          >
                            <FileXls size={16} />
                            Enviar arquivo
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Alert>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      )}
    </>
  );
}
