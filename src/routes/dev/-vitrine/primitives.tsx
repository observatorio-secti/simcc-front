import {
  BookOpen,
  ChevronLeft,
  CodeXml,
  Copy,
  FileText,
  LayoutGrid,
  Lightbulb,
  MoreHorizontal,
  Rows3,
  Search,
  Share2,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { qualisColor, searchTypeColor } from '@/shared/lib/design-tokens';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/accordion';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import { Checkbox } from '@/shared/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { Input } from '@/shared/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/shared/ui/popover';
import { ScrollArea } from '@/shared/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Separator } from '@/shared/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/sheet';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Toggle } from '@/shared/ui/toggle';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Demo, Showcase } from './showcase';

const FILTER_OPTIONS = [
  { id: 'ufba', label: 'Universidade Federal da Bahia', count: 1204 },
  { id: 'uesc', label: 'Universidade Estadual de Santa Cruz', count: 532 },
  { id: 'uneb', label: 'Universidade do Estado da Bahia', count: 418 },
] as const;

const TABLE_ROWS = [
  { name: 'Universidade Federal da Bahia', acronym: 'UFBA', researchers: 3120 },
  {
    name: 'Universidade Estadual de Feira de Santana',
    acronym: 'UEFS',
    researchers: 1045,
  },
  {
    name: 'Universidade Estadual de Santa Cruz',
    acronym: 'UESC',
    researchers: 812,
  },
] as const;

const SCROLL_ITEMS = Array.from({ length: 20 }, (_, i) => `Programa ${i + 1}`);

const numberFormat = new Intl.NumberFormat('pt-BR');

export function PrimitivesShowcase() {
  return (
    <>
      <Showcase
        id="botao"
        title="Botão"
        description="Primário em eng-blue; outline na topbar; ghost na toolbar. Só ícone exige aria-label."
      >
        <Demo label="Variantes">
          <Button>Pesquisar</Button>
          <Button variant="outline">Observatório</Button>
          <Button variant="secondary">Limpar</Button>
          <Button variant="ghost">
            <SlidersHorizontal aria-hidden />
            Filtros
          </Button>
          <Button variant="destructive">
            <Trash2 aria-hidden />
            Excluir
          </Button>
          <Button variant="link">Saiba mais</Button>
          <Button disabled>Desabilitado</Button>
        </Demo>
        <Demo label="Tamanhos">
          <Button size="lg">Grande</Button>
          <Button>Padrão</Button>
          <Button size="sm">Pequeno</Button>
          <Button size="icon" aria-label="Pesquisar">
            <Search aria-hidden />
          </Button>
          <Button size="icon-sm" variant="outline" aria-label="Compartilhar">
            <Share2 aria-hidden />
          </Button>
          <Button size="icon-xs" variant="outline" aria-label="Voltar">
            <ChevronLeft aria-hidden />
          </Button>
        </Demo>
        <Demo label="Tipo de busca">
          {(['profile', 'article', 'book', 'patent', 'maria'] as const).map(
            (type) => (
              <Button
                key={type}
                variant="searchType"
                size="icon"
                className={searchTypeColor(type).bg}
                aria-label={`Pesquisar: ${searchTypeColor(type).label}`}
              >
                <Search aria-hidden />
              </Button>
            ),
          )}
        </Demo>
      </Showcase>

      <Showcase
        id="marcadores"
        title="Badge, tag e dot"
        description="Badge sólido com cor de dicionário; tag suave para contadores; dot sempre com rótulo."
      >
        <Demo label="Badge">
          <Badge>Doutorado</Badge>
          <Badge className="bg-search-speaker">Scopus</Badge>
          <Badge variant="outline">Índice H: 17</Badge>
          <Badge size="sm" className="bg-search-profile">
            12 evidências
          </Badge>
        </Demo>
        <Demo label="Tag">
          <Tag>
            Artigos <b>131</b>
          </Tag>
          <Tag variant="neutral">
            Patentes <b>5</b>
          </Tag>
          <Tag variant="outline">
            Atualização do Lattes <b>10/2026</b>
          </Tag>
        </Demo>
        <Demo label="Dot">
          <span className="inline-flex items-center gap-2 text-sm">
            <Dot className="bg-qualis-A1" />
            Qualis A1
          </span>
          <span className="inline-flex items-center gap-2 text-sm">
            <Dot />
            Sem informação
          </span>
        </Demo>
      </Showcase>

      <Showcase id="card" title="Card" bare>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card sem sombra</CardTitle>
              <CardDescription>
                Branco, borda neutral-200 e rounded-lg.
              </CardDescription>
              <CardAction>
                <Button size="icon-sm" variant="ghost" aria-label="Mais ações">
                  <MoreHorizontal aria-hidden />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="text-sm">
              A profundidade vem do contraste entre moldura, painel e
              superfície.
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Abrir</Button>
              <Button size="sm" variant="outline">
                <Copy aria-hidden />
                Copiar link
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-l-[6px] border-l-qualis-A1 p-4">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold">
                Revista Brasileira de Ciência
              </p>
              <p className="text-sm uppercase">
                Um título de artigo em caixa alta, como no Lattes
              </p>
              <p className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-muted-foreground">
                <span>2025</span>
                <span className="inline-flex items-center gap-1.5">
                  <Dot className="bg-qualis-A1" />
                  Qualis A1
                </span>
              </p>
            </div>
          </Card>
        </div>
      </Showcase>

      <Showcase id="formulario" title="Formulário">
        <Demo label="Input e select" className="items-stretch">
          <Input
            aria-label="Pesquisar instituição"
            placeholder="Pesquisar"
            className="max-w-xs"
          />
          <Select defaultValue="name">
            <SelectTrigger aria-label="Ordenar por">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ordenar por</SelectLabel>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger size="sm" aria-label="Ano">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
          <Input
            aria-label="Campo inválido"
            aria-invalid
            defaultValue="Valor inválido"
            className="max-w-48"
          />
        </Demo>
        <Demo label="Checkbox">
          <div className="flex w-full max-w-sm flex-col gap-2.5">
            {FILTER_OPTIONS.map((option, index) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <Checkbox defaultChecked={index === 0} />
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {numberFormat.format(option.count)}
                </span>
              </label>
            ))}
            <label className="flex items-center gap-2.5 text-sm">
              <Checkbox checked="indeterminate" />
              Seleção parcial
            </label>
            <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Checkbox disabled />
              Desabilitado
            </label>
          </div>
        </Demo>
        <Demo label="Toggle e toggle group">
          <ToggleGroup
            type="single"
            defaultValue="grid"
            aria-label="Visualização"
          >
            <ToggleGroupItem value="list" aria-label="Ver em lista">
              <Rows3 aria-hidden />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Ver em grade">
              <LayoutGrid aria-hidden />
            </ToggleGroupItem>
          </ToggleGroup>
          <Toggle size="default" aria-label="Somente bolsistas">
            Somente bolsistas
          </Toggle>
        </Demo>
      </Showcase>

      <Showcase
        id="tabs"
        title="Tabs segmentadas"
        description="Alternam o conteúdo do mesmo objeto. Em telas estreitas, a lista rola dentro do container."
      >
        <Tabs defaultValue="article">
          <TabsList>
            <TabsTrigger value="article">
              <FileText aria-hidden />
              Artigos
            </TabsTrigger>
            <TabsTrigger value="book">
              <BookOpen aria-hidden />
              Livros e capítulos
            </TabsTrigger>
            <TabsTrigger value="patent">
              <Lightbulb aria-hidden />
              Patentes
            </TabsTrigger>
            <TabsTrigger value="software">
              <CodeXml aria-hidden />
              Softwares
            </TabsTrigger>
          </TabsList>
          <TabsContent value="article" className="text-sm">
            Conteúdo de artigos.
          </TabsContent>
          <TabsContent value="book" className="text-sm">
            Conteúdo de livros e capítulos.
          </TabsContent>
          <TabsContent value="patent" className="text-sm">
            Conteúdo de patentes.
          </TabsContent>
          <TabsContent value="software" className="text-sm">
            Conteúdo de softwares.
          </TabsContent>
        </Tabs>
      </Showcase>

      <Showcase id="acordeao" title="Acordeão (filtros)">
        <div className="max-w-sm">
          <Accordion type="multiple" defaultValue={['instituicao']}>
            <AccordionItem value="instituicao">
              <AccordionTrigger>Instituição</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2.5">
                {FILTER_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-start gap-2.5"
                  >
                    <Checkbox className="mt-0.5 shrink-0" />
                    <span className="min-w-0 flex-1 leading-snug break-words">
                      {option.label}
                    </span>
                    <span className="mt-0.5 shrink-0 text-xs text-muted-foreground tabular-nums">
                      {numberFormat.format(option.count)}
                    </span>
                  </label>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="qualis">
              <AccordionTrigger>Qualis</AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2.5">
                {(['A1', 'A2', 'B1'] as const).map((qualis) => (
                  <label
                    key={qualis}
                    className="flex cursor-pointer items-center gap-2.5"
                  >
                    <Checkbox />
                    <Dot className={qualisColor(qualis).bg} />
                    {qualis}
                  </label>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ano">
              <AccordionTrigger>Ano</AccordionTrigger>
              <AccordionContent>Filtro por ano.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Showcase>

      <Showcase
        id="sobreposicoes"
        title="Sobreposições"
        description="Diálogo, sheet, menu, popover, tooltip e toast. São estado local de quem abre."
      >
        <Demo label="Abrir">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Diálogo</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compartilhar resultado</DialogTitle>
                <DialogDescription>
                  Copie o link da busca para enviar a outra pessoa.
                </DialogDescription>
              </DialogHeader>
              <Input
                aria-label="Link da busca"
                readOnly
                defaultValue="https://simcc.uesc.br/resultados?q=robotica"
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>
                    <Copy aria-hidden />
                    Copiar link
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal aria-hidden />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  No mobile, a coluna de filtros abre aqui.
                </SheetDescription>
              </SheetHeader>
              <div className="px-4 text-sm">Conteúdo dos filtros.</div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal aria-hidden />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem>
                <Share2 aria-hidden />
                Compartilhar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy aria-hidden />
                Copiar link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Mostrar bolsistas
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <Trash2 aria-hidden />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">Popover</Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <PopoverHeader>
                <PopoverTitle>Índice H</PopoverTitle>
                <PopoverDescription>
                  Maior número h de artigos com pelo menos h citações.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Copiar link">
                <Copy aria-hidden />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copiar link</TooltipContent>
          </Tooltip>
        </Demo>
        <Demo label="Toast (sonner)">
          <Button
            variant="outline"
            onClick={() => toast.success('Link copiado')}
          >
            Sucesso
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              toast.error('Não foi possível carregar', {
                description: 'Tente novamente em instantes.',
              })
            }
          >
            Erro
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.info('Os dados são atualizados toda semana')}
          >
            Informação
          </Button>
          <Button variant="outline" onClick={() => toast('Busca salva')}>
            Neutro
          </Button>
        </Demo>
      </Showcase>

      <Showcase
        id="tabela"
        title="Tabela"
        description="Números à direita com tabular-nums. Em telas estreitas, rola dentro do container."
        bare
      >
        <Card>
          <Table>
            <TableCaption className="mb-4">
              Instituições com pesquisadores no resultado
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Instituição</TableHead>
                <TableHead>Sigla</TableHead>
                <TableHead className="text-right">Pesquisadores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TABLE_ROWS.map((row) => (
                <TableRow key={row.acronym}>
                  <TableCell className="min-w-56">{row.name}</TableCell>
                  <TableCell>{row.acronym}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {numberFormat.format(row.researchers)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </Showcase>

      <Showcase id="rolagem" title="Scroll area, separador e skeleton">
        <div className="grid gap-6 md:grid-cols-2">
          <ScrollArea className="h-48 rounded-md border">
            <div className="p-4">
              <p className="mb-3 text-sm font-medium">Programas</p>
              {SCROLL_ITEMS.map((item, index) => (
                <div key={item}>
                  {index > 0 && <Separator className="my-2" />}
                  <p className="text-sm">{item}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex flex-col gap-4">
            <div className="flex h-5 items-center gap-3 text-sm">
              <span>Pesquisadores</span>
              <Separator orientation="vertical" />
              <span>Instituições</span>
              <Separator orientation="vertical" />
              <span>Mapa</span>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-lg" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-7 w-20" />
          </div>
        </div>
      </Showcase>
    </>
  );
}
