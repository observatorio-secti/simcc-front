// src/components/PoliticaPrivacidade.tsx
import { Link } from 'react-router-dom';
import { Alert, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';
import { Home } from 'lucide-react';
import bg_popup from '../../assets/bg_home.png';
import { getVersion } from '../../gerVersion';
import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

export function DicionarioCores() {
  const platform = 'Simcc';
  const version2 = getVersion();

  const colors = [
    {
      name: 'Qualis A1',
      group: 'Qualis',
      class: 'bg-green-900',
      hex: '#34663C',
      rgb: '52,102,60',
    },
    {
      name: 'Qualis A2',
      group: 'Qualis',
      class: 'bg-lime-500',
      hex: '#9DC356',
      rgb: '157,195,86',
    },
    {
      name: 'Qualis A3',
      group: 'Qualis',
      class: 'bg-lime-300',
      hex: '#B1C38A',
      rgb: '177,195,138',
    },
    {
      name: 'Qualis A4',
      group: 'Qualis',
      class: 'bg-gray-400',
      hex: '#BEC4B3',
      rgb: '190,196,179',
    },
    {
      name: 'Qualis B1',
      group: 'Qualis',
      class: 'bg-orange-700',
      hex: '#D56438',
      rgb: '213,100,56',
    },
    {
      name: 'Qualis B2',
      group: 'Qualis',
      class: 'bg-orange-600',
      hex: '#DD883D',
      rgb: '221,136,61',
    },
    {
      name: 'Qualis B3',
      group: 'Qualis',
      class: 'bg-yellow-300',
      hex: '#E3B081',
      rgb: '227,176,129',
    },
    {
      name: 'Qualis B4',
      group: 'Qualis',
      class: 'bg-yellow-200',
      hex: '#E3AC96',
      rgb: '227,172,150',
    },
    {
      name: 'Qualis C',
      group: 'Qualis',
      class: 'bg-red-600',
      hex: '#CE3830',
      rgb: '206,56,48',
    },
    {
      name: 'Qualis SQ',
      group: 'Qualis',
      class: 'bg-red-900',
      hex: '#4A1314',
      rgb: '74,19,20',
    },
    {
      name: 'Artigos',
      group: 'Publicações',
      class: 'bg-blue-600',
      hex: '#5F82ED',
      rgb: '95,130,237',
    },
    {
      name: 'Livros e Capítulos',
      group: 'Publicações',
      class: 'bg-pink-400',
      hex: '#D15697',
      rgb: '209,86,151',
    },
    {
      name: 'Livros',
      group: 'Publicações',
      class: 'bg-pink-900',
      hex: '#792F4C',
      rgb: '121,47,76',
    },
    {
      name: 'Capítulos',
      group: 'Publicações',
      class: 'bg-pink-200',
      hex: '#DBAFD0',
      rgb: '219,175,208',
    },
    {
      name: 'Patentes',
      group: 'Inovações',
      class: 'bg-cyan-300',
      hex: '#66B4D0',
      rgb: '102,180,208',
    },
    {
      name: 'Softwares',
      group: 'Inovações',
      class: 'bg-teal-800',
      hex: '#096670',
      rgb: '9,102,112',
    },
    {
      name: 'Marcas',
      group: 'Inovações',
      class: 'bg-blue-800',
      hex: '#1B1464',
      rgb: '27,20,100',
    },
    {
      name: 'Congresso',
      group: 'Eventos',
      class: 'bg-orange-500',
      hex: '#FF5800',
      rgb: '255,88,0',
    },
    {
      name: 'Simpósio',
      group: 'Eventos',
      class: 'bg-red-700',
      hex: '#D53A2C',
      rgb: '213,58,44',
    },
    {
      name: 'Iniciação científica',
      group: 'Educação e Pesquisa',
      class: 'bg-teal-200',
      hex: '#8BFBD3',
      rgb: '139,251,211',
    },
    {
      name: 'Dissertação de Mestrado',
      group: 'Educação e Pesquisa',
      class: 'bg-green-300',
      hex: '#67A896',
      rgb: '103,168,150',
    },
    {
      name: 'Tese de Doutorado',
      group: 'Educação e Pesquisa',
      class: 'bg-gray-800',
      hex: '#425450',
      rgb: '66,84,80',
    },
    {
      name: 'Trabalho de Conclusão de Curso Graduação',
      group: 'Educação e Pesquisa',
      class: 'bg-teal-400',
      hex: '#77D2B6',
      rgb: '119,210,182',
    },
    {
      name: 'Orientação de Outra Natureza',
      group: 'Educação e Pesquisa',
      class: 'bg-green-700',
      hex: '#577E74',
      rgb: '87,126,116',
    },
    {
      name: 'Monografia de Conclusão de Curso',
      group: 'Educação e Pesquisa',
      class: 'bg-teal-500',
      hex: '#2F7F7C',
      rgb: '47,127,124',
    },
    {
      name: 'Supervisão de Pós-Doutorado',
      group: 'Educação e Pesquisa',
      class: 'bg-green-600',
      hex: '#46724B',
      rgb: '70,114,75',
    },
    {
      name: 'Eventos Acadêmicos',
      group: 'Eventos',
      class: 'bg-orange-500',
      hex: '#FF5800',
      rgb: '255,88,0',
    },
    {
      name: 'Seminário',
      group: 'Eventos',
      class: 'bg-yellow-400',
      hex: '#FFBD7B',
      rgb: '255,189,123',
    },
    {
      name: 'Simpósio',
      group: 'Eventos',
      class: 'bg-red-600',
      hex: '#D53A2C',
      rgb: '213,58,44',
    },
    {
      name: 'Oficina',
      group: 'Eventos',
      class: 'bg-yellow-200',
      hex: '#FCEE21',
      rgb: '252,238,33',
    },
    {
      name: 'Relatório Técnico',
      group: 'Documentação',
      class: 'bg-purple-600',
      hex: '#662D91',
      rgb: '102,45,145',
    },
    {
      name: 'Concluída',
      group: 'Status',
      class: 'bg-green-400',
      hex: '#6BC26B',
      rgb: '107,194,107',
    },
    {
      name: 'Em andamento',
      group: 'Status',
      class: 'bg-yellow-400',
      hex: '#DBB540',
      rgb: '219,181,64',
    },
    {
      name: 'Feminino',
      group: 'Gênero',
      class: 'bg-pink-400',
      hex: '#D15697',
      rgb: '209,86,151',
    },
    {
      name: 'Masculino',
      group: 'Gênero',
      class: 'bg-blue-400',
      hex: '#5F82ED',
      rgb: '95,130,237',
    },
    {
      name: 'GET',
      group: 'HTTP Métodos',
      class: 'bg-yellow-400',
      hex: '#DBB540',
      rgb: '219,181,64',
    },
    {
      name: 'POST',
      group: 'HTTP Métodos',
      class: 'bg-red-400',
      hex: '#CE3830',
      rgb: '206,56,48',
    },
    {
      name: 'PQ',
      group: 'Classificação',
      class: 'bg-green-400',
      hex: '#00D000',
      rgb: '0,208,0',
    },
    {
      name: 'DT',
      group: 'Classificação',
      class: 'bg-blue-400',
      hex: '#183EFF',
      rgb: '24,62,255',
    },
    {
      name: 'Cor 1',
      group: 'Estética',
      class: 'bg-gray-900',
      hex: '#213E59',
      rgb: '33,62,89',
    },
    {
      name: 'Cor 2',
      group: 'Estética',
      class: 'bg-gray-800',
      hex: '#354E68',
      rgb: '53,78,104',
    },
    {
      name: 'Cor 3',
      group: 'Estética',
      class: 'bg-gray-700',
      hex: '#485F78',
      rgb: '72,95,120',
    },
    {
      name: 'Cor 4',
      group: 'Estética',
      class: 'bg-gray-600',
      hex: '#5C7188',
      rgb: '92,113,136',
    },
    {
      name: 'Cor 5',
      group: 'Estética',
      class: 'bg-gray-500',
      hex: '#6F8399',
      rgb: '111,131,153',
    },
    {
      name: 'Cor 6',
      group: 'Estética',
      class: 'bg-gray-300',
      hex: '#98A8BA',
      rgb: '152,168,186',
    },
    {
      name: 'Astronomia',
      group: 'Ciências Exatas e da Terra',
      class: 'bg-red-200',
      hex: '#FFCCCC',
      rgb: '255,204,204',
    },
    {
      name: 'Física',
      group: 'Ciências Exatas e da Terra',
      class: 'bg-blue-200',
      hex: '#CCDDFF',
      rgb: '204,221,255',
    },
    {
      name: 'Geociências',
      group: 'Ciências Exatas e da Terra',
      class: 'bg-green-200',
      hex: '#CCFFCC',
      rgb: '204,255,204',
    },
    {
      name: 'Matemática',
      group: 'Ciências Exatas e da Terra',
      class: 'bg-yellow-200',
      hex: '#FFFFCC',
      rgb: '255,255,204',
    },
    {
      name: 'Oceanografia',
      group: 'Ciências Exatas e da Terra',
      class: 'bg-teal-200',
      hex: '#CCFFEE',
      rgb: '204,255,238',
    },
    {
      name: 'Probabilidade e Estatística',
      group: 'Ciências Exatas e da Terra',
      class: 'bg-purple-200',
      hex: '#E0CCFF',
      rgb: '224,204,255',
    },
    {
      name: 'Química',
      group: 'Ciências Exatas e da Terra',
      class: 'bg-orange-200',
      hex: '#FFD2B3',
      rgb: '255,210,179',
    },
    {
      name: 'Agronomia',
      group: 'Ciências Agrárias',
      class: 'bg-red-800',
      hex: '#660000',
      rgb: '102,0,0',
    },
    {
      name: 'Ciência e Tecnologia de Alimentos',
      group: 'Ciências Agrárias',
      class: 'bg-blue-800',
      hex: '#003366',
      rgb: '0,51,102',
    },
    {
      name: 'Engenharia Agrícola',
      group: 'Ciências Agrárias',
      class: 'bg-green-800',
      hex: '#003300',
      rgb: '0,51,0',
    },
    {
      name: 'Medicina Veterinária',
      group: 'Ciências Agrárias',
      class: 'bg-yellow-800',
      hex: '#666600',
      rgb: '102,102,0',
    },
    {
      name: 'Recursos Florestais e Engenharia Florestal',
      group: 'Ciências Agrárias',
      class: 'bg-teal-800',
      hex: '#005555',
      rgb: '0,85,85',
    },
    {
      name: 'Recursos Pesqueiros e Engenharia de Pesca',
      group: 'Ciências Agrárias',
      class: 'bg-purple-800',
      hex: '#330066',
      rgb: '51,0,102',
    },
    {
      name: 'Zootecnia',
      group: 'Ciências Agrárias',
      class: 'bg-orange-800',
      hex: '#993300',
      rgb: '153,51,0',
    },
    {
      name: 'Educação Física',
      group: 'Ciências da Saúde',
      class: 'bg-red-300',
      hex: '#FF9999',
      rgb: '255,153,153',
    },
    {
      name: 'Enfermagem',
      group: 'Ciências da Saúde',
      class: 'bg-blue-300',
      hex: '#99CCFF',
      rgb: '153,204,255',
    },
    {
      name: 'Fisioterapia e Terapia Ocupacional',
      group: 'Ciências da Saúde',
      class: 'bg-yellow-300',
      hex: '#FFFF99',
      rgb: '255,255,153',
    },
    {
      name: 'Medicina',
      group: 'Ciências da Saúde',
      class: 'bg-purple-300',
      hex: '#CC99FF',
      rgb: '204,153,255',
    },
    {
      name: 'Nutrição',
      group: 'Ciências da Saúde',
      class: 'bg-orange-300',
      hex: '#FFCC99',
      rgb: '255,204,153',
    },
    {
      name: 'Odontologia',
      group: 'Ciências da Saúde',
      class: 'bg-red-100',
      hex: '#FFCCCC',
      rgb: '255,204,204',
    },
    {
      name: 'Saúde Coletiva',
      group: 'Ciências da Saúde',
      class: 'bg-blue-100',
      hex: '#CCE5FF',
      rgb: '204,229,255',
    },
    {
      name: 'Administração',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-yellow-700',
      hex: '#666600',
      rgb: '102,102,0',
    },
    {
      name: 'Direito',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-blue-100',
      hex: '#CCE5FF',
      rgb: '204,229,255',
    },
    {
      name: 'Economia',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-green-100',
      hex: '#CCFFCC',
      rgb: '204,255,204',
    },
    {
      name: 'Arquitetura e Urbanismo',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-teal-700',
      hex: '#005555',
      rgb: '0,85,85',
    },
    {
      name: 'Ciência da Informação',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-purple-700',
      hex: '#330066',
      rgb: '51,0,102',
    },
    {
      name: 'Engenharia Aeroespacial',
      group: 'Engenharia',
      class: 'bg-red-500',
      hex: '#D53A2C',
      rgb: '213,58,44',
    },
    {
      name: 'Engenharia Biomédica',
      group: 'Engenharia',
      class: 'bg-blue-500',
      hex: '#0095FF',
      rgb: '0,149,255',
    },
    {
      name: 'Engenharia Civil',
      group: 'Engenharia',
      class: 'bg-green-500',
      hex: '#3DA35A',
      rgb: '61,163,90',
    },
    {
      name: 'Engenharia de Energia',
      group: 'Engenharia',
      class: 'bg-yellow-500',
      hex: '#FFCC00',
      rgb: '255,204,0',
    },
    {
      name: 'Engenharia de Materiais e Metalúrgica',
      group: 'Engenharia',
      class: 'bg-teal-500',
      hex: '#3BAF9F',
      rgb: '59,175,159',
    },
    {
      name: 'Engenharia de Minas',
      group: 'Engenharia',
      class: 'bg-purple-500',
      hex: '#6B4683',
      rgb: '107,70,131',
    },
    {
      name: 'Engenharia de Produção',
      group: 'Engenharia',
      class: 'bg-orange-500',
      hex: '#F97F51',
      rgb: '249,127,81',
    },
    {
      name: 'Engenharia de Transportes',
      group: 'Engenharia',
      class: 'bg-red-700',
      hex: '#B51A01',
      rgb: '181,26,1',
    },
    {
      name: 'Engenharia Elétrica',
      group: 'Engenharia',
      class: 'bg-blue-700',
      hex: '#00509E',
      rgb: '0,80,158',
    },
    {
      name: 'Engenharia Mecânica',
      group: 'Engenharia',
      class: 'bg-green-700',
      hex: '#004A19',
      rgb: '0,74,25',
    },
    {
      name: 'Engenharia Naval e Oceânica',
      group: 'Engenharia',
      class: 'bg-yellow-700',
      hex: '#C4A80A',
      rgb: '196,168,10',
    },
    {
      name: 'Engenharia Nuclear',
      group: 'Engenharia',
      class: 'bg-teal-700',
      hex: '#007C84',
      rgb: '0,124,132',
    },
    {
      name: 'Engenharia Química',
      group: 'Engenharia',
      class: 'bg-purple-700',
      hex: '#682A6A',
      rgb: '104,42,106',
    },
    {
      name: 'Engenharia Sanitária',
      group: 'Engenharia',
      class: 'bg-orange-700',
      hex: '#BC7D27',
      rgb: '188,125,39',
    },
    {
      name: 'Arte',
      group: 'Humanidades',
      class: 'bg-red-50',
      hex: '#FFEBEB',
      rgb: '255,235,235',
    },
    {
      name: 'Letras',
      group: 'Humanidades',
      class: 'bg-blue-50',
      hex: '#EBF5FF',
      rgb: '235,245,255',
    },
    {
      name: 'Lingüística',
      group: 'Humanidades',
      class: 'bg-green-50',
      hex: '#E6F8EB',
      rgb: '230,248,235',
    },
    {
      name: 'Comunicação',
      group: 'Humanidades',
      class: 'bg-orange-50',
      hex: '#FFF2E6',
      rgb: '255,242,230',
    },
    {
      name: 'Ciência da Computação',
      group: 'Tecnologia',
      class: 'bg-purple-900',
      hex: '#241431',
      rgb: '36,20,49',
    },
    {
      name: 'Microeletrônica',
      group: 'Tecnologia',
      class: 'bg-red-700',
      hex: '#B51616',
      rgb: '181,22,22',
    },
    {
      name: 'Robótica, Mecatrônica e Automação',
      group: 'Tecnologia',
      class: 'bg-blue-700',
      hex: '#003A63',
      rgb: '0,58,99',
    },
    {
      name: 'Administração',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-yellow-700',
      hex: '#FFC107',
      rgb: '255,193,7',
    },
    {
      name: 'Demografia',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-red-100',
      hex: '#FFE1E1',
      rgb: '255,225,225',
    },
    {
      name: 'Economia Doméstica',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-yellow-100',
      hex: '#FFF9DB',
      rgb: '255,249,219',
    },
    {
      name: 'Planejamento Urbano e Regional',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-purple-100',
      hex: '#F3EBFF',
      rgb: '243,235,255',
    },
    {
      name: 'Turismo',
      group: 'Ciências Sociais Aplicadas',
      class: 'bg-red-200',
      hex: '#FFD5D5',
      rgb: '255,213,213',
    },
    {
      name: 'Participação em evento',
      group: 'Eventos',
      class: 'bg-orange-400',
      hex: '#DE7A36',
      rgb: '222,122,54',
    },
    {
      name: 'Congresso',
      group: 'Eventos',
      class: 'bg-orange-500',
      hex: '#FF5800',
      rgb: '255,88,0',
    },
    {
      name: 'Encontro',
      group: 'Eventos',
      class: 'bg-yellow-600',
      hex: '#E9A700',
      rgb: '233,167,0',
    },
    {
      name: 'Seminário',
      group: 'Eventos',
      class: 'bg-yellow-400',
      hex: '#FFBD7B',
      rgb: '255,189,123',
    },
    {
      name: 'Outra',
      group: 'Eventos',
      class: 'bg-brown-600',
      hex: '#7F400B',
      rgb: '127,64,11',
    },
  ];

  const grouped = colors.reduce(
    (acc, color) => {
      if (!acc[color.group]) acc[color.group] = [];
      acc[color.group].push(color);
      return acc;
    },
    {} as Record<string, typeof colors>,
  );

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const [format, setFormat] = useState<'hex' | 'rgb'>('hex');

  return (
    <main className="p-4 md:p-8 bg-neutral-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-100">
      <div className="max-w-[1200px] mx-auto space-y-8">
        {/* Header */}
        <Alert className="p-0">
          <Alert className="flex border-0 rounded-b-none justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-4 md:p-6 rounded-md">
            <AlertTitle className="text-base font-medium text-gray-600 dark:text-gray-300">
              Dicionário de cores
            </AlertTitle>
            <Link to="/">
              <Button variant="outline">
                <Home size={16} className="mr-2" />
                Página Inicial
              </Button>
            </Link>
          </Alert>

          <div
            className="p-8 rounded-t-none md:p-12 bg-cover bg-center rounded-md"
            style={{ backgroundImage: `url(${bg_popup})` }}
          >
            <h1 className="text-4xl font-bold mb-2">Plataforma {platform}</h1>
            <p className="text-sm font-light">
              Versão da plataforma: {version2}
            </p>
          </div>
        </Alert>

        <Alert className="space-y-4 p-8">
          <h2 className="text-2xl font-semibold">Sobre o dicionário</h2>

          <p>
            O dicionário de cores do {platform} foi criado para padronizar a
            identificação visual de status, tipos de produção acadêmica, áreas
            de grupos de pesquisa, programas de pós-graduação,alertas no
            sistema, entre outros. Cada cor, definida em hexadecimal e aplicada
            via Tailwind CSS, facilita a leitura rápida e intuitiva das
            informações, diferenciando dados validados, pendentes ou com erro,
            além de destacar categorias específicas como produções técnicas e
            científicas.
          </p>
          <Alert>
            <p>
              Essa padronização garante organização, acessibilidade, coesão
              visual e eficiência na navegação em toda a plataforma.
            </p>
          </Alert>
        </Alert>

        <Alert className="space-y-6 p-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Cores</h2>

            <Select onValueChange={(val) => setFormat(val as 'hex' | 'rgb')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecionar formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hex">Hex</SelectItem>
                <SelectItem value="rgb">RGB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Alert>

        {Object.entries(grouped).map(([groupName, groupColors]) => (
          <Alert key={groupName} className="space-y-2 p-8">
            <h2 className="text-lg font-semibold">{groupName}</h2>
            <ScrollArea>
              <div className="flex gap-4">
                {groupColors.map((color) => {
                  const valueToCopy = format === 'hex' ? color.hex : color.rgb;

                  return (
                    <Card
                      key={color.name}
                      className="w-[120px]  cursor-pointer  transition-transform"
                      onClick={() => handleCopy(valueToCopy)}
                    >
                      <CardContent className="p-0 h-full flex flex-col justify-between items-center py-2">
                        <div
                          className={`w-[120px] h-[150px] mt-2 ${color.class} rounded-lg`}
                        />
                        <div className="text-sm text-center px-2">
                          {color.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {valueToCopy}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Alert>
        ))}
      </div>
    </main>
  );
}
