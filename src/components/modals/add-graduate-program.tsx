import { DialogHeader } from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

// --- Interfaces (Movidas para o topo) ---
interface City {
  id: number;
  nome: string;
  municipio: {
    nome: string;
    microrregiao: {
      mesorregiao: {
        UF: {
          sigla: string;
        };
      };
    };
  };
}

import { useModal } from '../hooks/use-modal-store';
import { useContext, useState } from 'react'; // Adicionado useEffect
import { UserContext } from '../../context/context';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Plus, X } from 'phosphor-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

import { Sheet, SheetContent } from '../../components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import { Check, ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

// --- Componente 1: Seletor de Área (Extraído) ---

interface AreaSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

function GraduateProgramAreaSelector({
  value,
  onValueChange,
}: AreaSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id="area"
        className="items-start [&_[data-description]]:hidden"
      >
        <SelectValue
          placeholder="Selecione a área"
          className={'whitespace-nowrap'}
        />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Ciências Agrárias</SelectLabel>
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
          <SelectItem value="administracao">Administração e Turismo</SelectItem>
          <SelectItem value="arquitetura">Arquitetura e Urbanismo</SelectItem>
          <SelectItem value="direito">Direito</SelectItem>
          <SelectItem value="economia">Economia</SelectItem>
          <SelectItem value="servico_social">Serviço Social</SelectItem>

          <SelectLabel>Linguística, Letras e Artes</SelectLabel>
          <SelectItem value="artes">Artes</SelectItem>
          <SelectItem value="linguistica">Linguística e Literatura</SelectItem>

          <SelectLabel>Ciências Exatas e da Terra</SelectLabel>
          <SelectItem value="astronomia">Astronomia / Física</SelectItem>
          <SelectItem value="computacao">Computação</SelectItem>
          <SelectItem value="geociencias">Geociências</SelectItem>
          <SelectItem value="matematica">Matemática / Estatística</SelectItem>
          <SelectItem value="quimica">Química</SelectItem>

          <SelectLabel>Engenharias</SelectLabel>
          <SelectItem value="engenharias1">Engenharias I</SelectItem>
          <SelectItem value="engenharias2">Engenharias II</SelectItem>
          <SelectItem value="engenharias3">Engenharias III</SelectItem>
          <SelectItem value="engenharias4">Engenharias IV</SelectItem>

          <SelectLabel>Multidisciplinar</SelectLabel>
          <SelectItem value="biotecnologia">Biotecnologia</SelectItem>
          <SelectItem value="ciencias_ambientais">
            Ciências Ambientais
          </SelectItem>
          <SelectItem value="ensino">Ensino</SelectItem>
          <SelectItem value="interdisciplinar">Interdisciplinar</SelectItem>
          <SelectItem value="materiais">Materiais</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

// --- Componente 2: Seletor de Cidade (Extraído) ---

interface CitySelectorProps {
  selectedCity: City | null;
  onCitySelect: (city: City | null) => void;
}

function GraduateProgramCitySelector({
  selectedCity,
  onCitySelect,
}: CitySelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);

  // Função para buscar cidades conforme o usuário digita
  async function fetchCities(query: string) {
    if (query.length < 3) {
      setCities([]); // Limpa a lista se a busca for muito curta
      return;
    }
    try {
      const res = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/distritos`,
      );
      const data: City[] = await res.json();
      const filtered = data.filter((city) =>
        city.nome.toLowerCase().includes(query.toLowerCase()),
      );
      setCities(filtered.slice(0, 50)); // Limita a 50 resultados
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedCity
            ? `${selectedCity.nome} (${selectedCity.municipio.microrregiao.mesorregiao.UF.sigla})`
            : 'Selecione uma cidade'}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[300px] p-2">
        <Input
          placeholder="Digite o nome da cidade..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            fetchCities(e.target.value);
          }}
        />
        <ScrollArea className="h-60 mt-2 border rounded-md">
          {cities.length > 0 ? (
            cities.map((city) => (
              <div
                key={city.id}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  onCitySelect(city); // Envia a cidade selecionada para o pai
                  setOpen(false);
                  setSearch('');
                  setCities([]);
                }}
              >
                {city.nome} ({city.municipio.microrregiao.mesorregiao.UF.sigla})
                {selectedCity?.id === city.id && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            ))
          ) : (
            <p className="p-2 text-sm text-gray-500">
              {search.length < 3
                ? 'Digite 3+ letras'
                : 'Nenhuma cidade encontrada'}
            </p>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// --- Componente 3: Cabeçalho do Modal (Extraído) ---

interface HeaderProps {
  onClose: () => void;
}

function GraduateProgramHeader({ onClose }: HeaderProps) {
  return (
    <>
      <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-8 w-8"
                  variant={'outline'}
                  onClick={onClose}
                  size={'icon'}
                >
                  <X size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent> Fechar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DialogHeader>

      <div className="p-8 pb-0">
        {' '}
        {/* Movido P-8 para cá */}
        <div className="mb-8">
          <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
            Programas de pós-graduação
          </p>
          <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
            Adicionar programa
          </h1>
        </div>
      </div>
    </>
  );
}

// --- Componente 4: Formulário (Lógica principal) ---

interface FormProps {
  onClose: () => void;
}

function GraduateProgramForm({ onClose }: FormProps) {
  const { user, urlGeralAdm } = useContext(UserContext);

  // Estados do formulário
  const [name, setName] = useState('');
  const [modality, setModality] = useState('');
  const [type, setType] = useState('');
  const [ranking, setRanking] = useState('');
  const [area, setArea] = useState('');
  const [code, setCode] = useState('');
  const [descricao, setDescricao] = useState('');
  const [site, setSite] = useState('');
  const [sigla, setSigla] = useState('');

  // Estado do seletor de cidade (agora mora aqui)
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [isLoading, setIsLoading] = useState(false); // Estado de Loading

  const resetForm = () => {
    setName('');
    setArea('');
    setSelectedCity(null);
    setCode('');
    setDescricao('');
    setModality('');
    setRanking('');
    setType('');
    setSigla('');
    setSite('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const docId = uuidv4();

    // --- Validação ---
    // (Movida para o topo para falhar rápido)
    if (name === '') {
      toast.error("Campo 'Nome do programa' vazio");
      setIsLoading(false);
      return;
    }
    if (area === '') {
      toast.error("Campo 'Área' vazio");
      setIsLoading(false);
      return;
    }
    if (modality === '') {
      toast.error("Campo 'Modalidade' vazio");
      setIsLoading(false);
      return;
    }
    if (type === '') {
      toast.error("Campo 'Tipo do programa' vazio");
      setIsLoading(false);
      return;
    }
    if (!selectedCity) {
      // <-- BUG CORRIGIDO
      toast.error("Campo 'Cidade' vazio");
      setIsLoading(false);
      return;
    }

    // --- Preparação do Payload ---
    const data = [
      {
        graduate_program_id: docId,
        code: code,
        name: name.toUpperCase(),
        area: area.toUpperCase(),
        modality: modality.toUpperCase(),
        type: type.toUpperCase(),
        rating: ranking.toUpperCase(),
        institution_id: user?.institution_id,
        description: descricao,
        url_image: '',
        city: `${selectedCity.nome} - ${selectedCity.municipio.microrregiao.mesorregiao.UF.sigla}`, // <-- BUG CORRIGIDO
        visible: false,
        acronym: sigla,
        site: site,
      },
    ];

    const urlProgram = urlGeralAdm + '/GraduateProgramRest/Insert';

    // --- Envio dos Dados ---
    try {
      const response = await fetch(urlProgram, {
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
        toast.success('Programa de pós-graduação cadastrado com sucesso!');
        resetForm();
        onClose();
      } else {
        toast.error('Erro ao enviar dados para o servidor. Tente novamente.');
        console.error('Erro ao enviar dados para o servidor.');
      }
    } catch (error) {
      toast.error('Erro de conexão. Verifique sua rede e tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 pt-0">
      {' '}
      {/* Restante do padding */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 mt-4 w-2/3">
          <Label>Nome do programa*</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-2 mt-4 w-1/3">
          <Label>Sigla</Label> {/* Removido * (não estava na validação) */}
          <Input
            value={sigla}
            onChange={(e) => setSigla(e.target.value)}
            type="text"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="mt-4 gap-4 grid grid-cols-2">
        <div className="flex flex-col gap-2 w-full">
          <Label>Modalidade*</Label>
          <Select
            onValueChange={setModality}
            value={modality}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a modalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACADÊMICO">Acadêmico</SelectItem>
              <SelectItem value="PROFISSIONAL">Profissional</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label>Cidade*</Label>
          {/* Componente de Cidade Inserido */}
          <GraduateProgramCitySelector
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
          />
        </div>
      </div>
      <div className="mt-4 gap-4 flex">
        <div className="flex flex-col gap-2 w-1/2">
          <Label>Tipo de programa*</Label>
          <Select onValueChange={setType} value={type} disabled={isLoading}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DOUTORADO">Doutorado</SelectItem>
              <SelectItem value="MESTRADO">Mestrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2 flex gap-4">
          <div className="flex flex-col gap-2 w-2/3">
            <Label>Área*</Label>
            {/* Componente de Área Inserido */}
            <GraduateProgramAreaSelector value={area} onValueChange={setArea} />
          </div>
          <div className="flex flex-col gap-2 w-1/3">
            <Label>Nota</Label> {/* Removido * */}
            <Input
              value={ranking}
              onChange={(e) => setRanking(e.target.value)}
              type="text"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="flex flex-col gap-2  w-2/3">
          <Label>Código do programa (Sucupira)</Label> {/* Removido * */}
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type="text"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col gap-2 w-1/3">
          <Label>Site</Label> {/* Removido * */}
          <Input
            value={site}
            onChange={(e) => setSite(e.target.value)}
            type="text"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full mt-4">
        <Label htmlFor="dep_des" className="h-fit">
          Descrição
        </Label>
        <Textarea
          name="dep_des"
          className="h-full"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          id="dep_des"
          disabled={isLoading}
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={isLoading}
        size={'sm'}
        className="text-white dark:text-white mt-3 ml-auto flex "
      >
        {isLoading ? (
          'Adicionando...'
        ) : (
          <>
            <Plus size={16} className="" /> Adicionar
          </>
        )}
      </Button>
    </div>
  );
}

// --- Componente 5: Principal (Shell do Modal) ---

export function AddGraduateProgram() {
  const { onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = isOpen && typeModal === 'add-graduate-program';

  // O componente principal agora só gerencia o <Sheet> e renderiza os filhos
  return (
    <Sheet open={isModalOpen} onOpenChange={onClose}>
      <SheetContent
        className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw]`}
      >
        {/* 1. Cabeçalho */}
        <GraduateProgramHeader onClose={onClose} />

        {/* 2. Conteúdo com Scroll */}
        <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)]">
          {/* 3. Formulário */}
          <GraduateProgramForm onClose={onClose} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
