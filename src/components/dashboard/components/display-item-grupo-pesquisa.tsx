import { MapPinIcon, Star, Users } from 'lucide-react';
import { Button } from '../../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../ui/tooltip';
import { CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Trash } from 'phosphor-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/context';
import { useModal } from '../../hooks/use-modal-store';

interface Patrimonio {
  area: string;
  institution: string;
  first_leader: string;
  first_leader_id: string;
  second_leader: string;
  second_leader_id: string;
  name: string;
}

export interface PesquisadorProps {
  lattes_id: string;
  name: string;
  type_: string;
}

export interface PesquisadorProps2 {
  name: string;
  lattes_id: string;
  researcher_id: string;
  institution_id: string;
}

export function DisplayItemGrupoPesquisa(props: Patrimonio) {
  const normalizeArea = (area: string): string => {
    return area.toUpperCase(); // Converte para maiúsculas
  };

  const qualisColor: { [key: string]: string } = {
    ASTRONOMIA: 'bg-red-200',
    FÍSICA: 'bg-blue-200',
    GEOCIÊNCIAS: 'bg-green-200',
    MATEMÁTICA: 'bg-yellow-200',
    OCEANOGRAFIA: 'bg-teal-200',
    'PROBABILIDADE E ESTATÍSTICA': 'bg-purple-200',
    QUÍMICA: 'bg-orange-200',
    AGRONOMIA: 'bg-red-800',
    'CIÊNCIA E TECNOLOGIA DE ALIMENTOS': 'bg-blue-800',
    'ENGENHARIA AGRÍCOLA': 'bg-green-800',
    'MEDICINA VETERINÁRIA': 'bg-yellow-800',
    'RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL': 'bg-teal-800',
    'RECURSOS PESQUEIROS E ENGENHARIA DE PESCA': 'bg-purple-800',
    ZOOTECNIA: 'bg-orange-800',
    BIOFÍSICA: 'bg-red-600',
    'BIOLOGIA GERAL': 'bg-blue-600',
    BIOQUÍMICA: 'bg-green-600',
    BIOTECNOLOGIA: 'bg-yellow-600',
    BOTÂNICA: 'bg-teal-600',
    ECOLOGIA: 'bg-purple-600',
    FARMACOLOGIA: 'bg-orange-600',
    FISIOLOGIA: 'bg-red-400',
    GENÉTICA: 'bg-blue-400',
    IMUNOLOGIA: 'bg-green-400',
    MICROBIOLOGIA: 'bg-yellow-400',
    MORFOLOGIA: 'bg-teal-400',
    PARASITOLOGIA: 'bg-purple-400',
    ZOOLOGIA: 'bg-orange-400',
    'EDUCAÇÃO FÍSICA': 'bg-red-300',
    ENFERMAGEM: 'bg-blue-300',
    FARMÁCIA: 'bg-green-300',
    'FISIOTERAPIA E TERAPIA OCUPACIONAL': 'bg-yellow-300',
    FONOAUDIOLOGIA: 'bg-teal-300',
    MEDICINA: 'bg-purple-300',
    NUTRIÇÃO: 'bg-orange-300',
    ODONTOLOGIA: 'bg-red-100',
    'SAÚDE COLETIVA': 'bg-blue-100',
    ANTROPOLOGIA: 'bg-green-100',
    ARQUEOLOGIA: 'bg-yellow-100',
    'CIÊNCIA POLÍTICA': 'bg-teal-100',
    EDUCAÇÃO: 'bg-purple-100',
    FILOSOFIA: 'bg-orange-100',
    GEOGRAFIA: 'bg-red-900',
    HISTÓRIA: 'bg-blue-900',
    PSICOLOGIA: 'bg-green-900',
    SOCIOLOGIA: 'bg-yellow-900',
    TEOLOGIA: 'bg-teal-900',
    'CIÊNCIA DA COMPUTAÇÃO': 'bg-purple-900',
    'DESENHO INDUSTRIAL': 'bg-orange-900',
    'ENGENHARIA AEROESPACIAL': 'bg-red-500',
    'ENGENHARIA BIOMÉDICA': 'bg-blue-500',
    'ENGENHARIA CIVIL': 'bg-green-500',
    'ENGENHARIA DE ENERGIA': 'bg-yellow-500',
    'ENGENHARIA DE MATERIAIS E METALÚRGICA': 'bg-teal-500',
    'ENGENHARIA DE MINAS': 'bg-purple-500',
    'ENGENHARIA DE PRODUÇÃO': 'bg-orange-500',
    'ENGENHARIA DE TRANSPORTES': 'bg-red-700',
    'ENGENHARIA ELÉTRICA': 'bg-blue-700',
    'ENGENHARIA MECÂNICA': 'bg-green-700',
    'ENGENHARIA NAVAL E OCEÂNICA': 'bg-yellow-700',
    'ENGENHARIA NUCLEAR': 'bg-teal-700',
    'ENGENHARIA QUÍMICA': 'bg-purple-700',
    'ENGENHARIA SANITÁRIA': 'bg-orange-700',
    ARTES: 'bg-red-50',
    LETRAS: 'bg-blue-50',
    LINGÜÍSTICA: 'bg-green-50',
    BIOÉTICA: 'bg-yellow-50',
    'CIÊNCIAS AMBIENTAIS': 'bg-teal-50',
    DEFESA: 'bg-purple-50',
    'DIVULGAÇÃO CIENTÍFICA': 'bg-orange-50',
    MICROELETRÔNICA: 'bg-red-700',
    'ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO': 'bg-blue-700',
    'SEGURANÇA CONTRA INCÊNDIO': 'bg-green-700',
    ADMINISTRAÇÃO: 'bg-yellow-700',
    'ARQUITETURA E URBANISMO': 'bg-teal-700',
    'CIÊNCIA DA INFORMAÇÃO': 'bg-purple-700',
    COMUNICAÇÃO: 'bg-orange-700',
    DEMOGRAFIA: 'bg-red-100',
    DIREITO: 'bg-blue-100',
    ECONOMIA: 'bg-green-100',
    'ECONOMIA DOMÉSTICA': 'bg-yellow-100',
    MUSEOLOGIA: 'bg-teal-100',
    'PLANEJAMENTO URBANO E REGIONAL': 'bg-purple-100',
    'SERVIÇO SOCIAL': 'bg-orange-100',
    TURISMO: 'bg-red-200',
  };

  const { urlGeralAdm } = useContext(UserContext);
  const { onOpen } = useModal();

  const [researcher, setResearcher] = useState<PesquisadorProps[]>([]);

  const urlGetResearcher = `${urlGeralAdm}GraduateProgramResearcherRest/Query?graduate_program_id=`;

  const fetchDataAll = async () => {
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
        setResearcher(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDataAll();
  }, [urlGeralAdm, props.name]);

  return (
    <Tabs defaultValue={'all'} className="h-full">
      <div className="flex flex-col">
        <div className="flex items-center p-2 px-4 justify-between">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild></TooltipTrigger>
              <TooltipContent>Mudar visibilidade</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-2">
            <TabsList>
              <TabsTrigger
                value="all"
                className="text-zinc-600 dark:text-zinc-200"
              >
                Visão geral
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-zinc-600 dark:text-zinc-200"
              >
                Docentes
              </TabsTrigger>
              <TabsTrigger
                value="movimentacao-bens"
                className="text-zinc-600 dark:text-zinc-200"
              >
                Discentes
              </TabsTrigger>
            </TabsList>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() =>
                    onOpen('confirm-delete-pos-graduate-program', {
                      id_delete: props.area,
                      name: props.name,
                    })
                  }
                  variant="destructive"
                  size="icon"
                >
                  <Trash size={16} />
                  <span className="sr-only">Arquivar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deletar programa</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="w-full border-b border-neutral-200 dark:border-neutral-800 "></div>

        <div></div>
      </div>
      <div
        className={`w-full h-2 ${qualisColor[normalizeArea(props.area || '')]} `}
      ></div>
      <TabsContent value="all">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {props.institution != '' ? props.area : 'Sem código'}
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col justify-between h-full">
          <div>
            <div className="text-2xl font-bold">{props.name}</div>
            <p className="text-xs text-muted-foreground"></p>
          </div>
        </CardContent>

        <div className="flex mt-8 flex-wrap gap-4 px-6">
          <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
            <Users size={12} />
            {props.area}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
            <MapPinIcon size={12} />
            {props.area}
          </div>
          {props.area != null && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <Star size={12} />
              {props.area}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="unread" className="mt-0">
        <div className=" overflow-y-auto h-[calc(100vh-115px)] elementBarra ">
          <CardContent className="flex flex-col justify-between pt-6 ">
            <div>
              <div className="text-2xl font-bold uppercase">
                Docentes vinculados ao programa
              </div>
              <p className="mt-2 text-sm">
                Adicione ou remova os pesquisadores permanentes e colaboradores
                do programa de pós graduação
              </p>
            </div>
          </CardContent>

          <div className="px-6"></div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
