# Ícones

**Biblioteca oficial: `lucide-react`** (`^0.354.0`, já instalada e presente em 155 arquivos públicos).
Nas páginas de exemplo os mesmos desenhos vêm de `assets/icons/lucide-sprite.svg`:

```html
<svg class="sc-icon"><use href="../assets/icons/lucide-sprite.svg#search"/></svg>
```

Para regenerar o sprite com mais ícones, rode `node design-kit/reference/build-assets.mjs "$PWD" "search,user,…"` a partir da raiz do projeto.

## Tamanhos

| Contexto | px | Tailwind |
|---|---|---|
| Metadado (ano, citações, instituição no card) | 12 | `h-3 w-3` |
| Botão `sm`, tabs, badges | 14 | `h-3.5 w-3.5` |
| **Padrão** (nav, botões, KPI, inputs) | 16 | `h-4 w-4` |
| Cabeçalho de seção, título “Filtros” | 20 | `h-5 w-5` |
| Estado vazio | 40 | `h-10 w-10` |

Traço sempre 2 (padrão). Cor herdada (`currentColor`); em cabeçalho de card/KPI use `text-muted-foreground`.

## Um conceito, um ícone

### Navegação (sidebar pública)
| Conceito | Ícone |
|---|---|
| Página inicial | `Home` |
| Pesquisar | `SearchCheck` |
| Pesquisar com IA / MarIA | `Sparkles` |
| Ferramentas | `Wrench` |
| Listagens | `Download` |
| Dados / painéis externos | `Link2` |
| Páginas | `PanelsTopLeft` |
| Grupos de pesquisa | `Users` |
| Indicadores | `BarChart3` |
| Instituições | `Building2` |
| Institutos de CT&I | `Landmark` |
| Pós-graduação | `GraduationCap` |
| Vídeos | `SquarePlay` |
| Outros | `MoreHorizontal` |
| Índice do pesquisador | `AArrowUp` |
| Observatório | logo `observatorio.svg` |

### Entidades
| Conceito | Ícone |
|---|---|
| Pesquisador | `User` |
| Pesquisadores (contagem) | `Users` |
| Instituição | `Building2` |
| Programa de pós-graduação | `GraduationCap` |
| Grupo de pesquisa | `FlaskConical` |
| Território / cidade | `MapPin` |
| Mapa (visão) | `Map` |
| Rede de colaboração / coautores | `Network` |
| Bolsa / bolsista (fomento) | `HandCoins` |
| Revista (aba e total do catálogo) | `Newspaper` |

### Produção
| Conceito | Ícone |
|---|---|
| Artigo | `FileText` |
| Livro / capítulo | `BookOpen` |
| Patente / produção técnica | `Lightbulb` |
| Software | `CodeXml` |
| Marca | `Copyright` |
| Relatório técnico | `FileSpreadsheet` |
| Participação em evento | `Presentation` |
| Texto em jornal ou revista | `BookOpenText` |
| Trabalho em evento | `ScrollText` |
| Orientação | `GraduationCap` |
| Citações | `Quote` |
| JCR / índice | `Hash` |
| Índice H / i10 | `BarChart3` |
| Ano / data | `Calendar` |
| Qualis | `CheckCircle2` |
| Prêmio | `Award` |

### Ações e controles
| Conceito | Ícone |
|---|---|
| Buscar (submit, campo) | `Search` |
| Filtros | `SlidersHorizontal` |
| Baixar resultado / CSV | `Download` |
| Baixar relatório (PDF) | `FileDown` |
| Abrir em nova aba / link externo | `ExternalLink` |
| Compartilhar | `Share2` |
| Copiar | `Copy` |
| Limpar busca / excluir | `Trash2` |
| Remover termo / fechar | `X` |
| Expandir / recolher seção | `ChevronDown` / `ChevronUp` |
| Voltar | `ChevronLeft` (botão) · `ArrowLeft` (link de texto) |
| Avançar / “Saiba mais” | `ArrowRight` |
| Ver em grade / lista | `LayoutGrid` / `Rows3` |
| Ordenar | `ArrowUpDown` |
| Tela cheia | `Maximize2` |
| Mais ações | `MoreHorizontal` |
| Informação | `Info` |
| Ajuda | `CircleHelp` |
| Carregando | `Loader2` + `animate-spin` |
| Sucesso / ativo | `Check` |
| Alerta | `AlertTriangle` |
| Tema | `Sun` / `Moon` |
| Entrar / sair | `LogIn` / `LogOut` |
| Recolher menu | `PanelLeft` |
| LinkedIn | `Linkedin` |
| Orcid | `OrcidIcon` (SVG próprio em `components/svg`) |

## Duplicatas lucide a eliminar

| Hoje | Padronizar em |
|---|---|
| `LoaderCircle`, `Loader2` | `Loader2` |
| `MapIcon`, `Map` | `Map` |
| `InfoIcon`, `Info` | `Info` |
| `GraduationCapIcon`, `GraduationCap` | `GraduationCap` |
| `MapPinIcon`, `MapPinned`, `MapPin` | `MapPin` |
| `BarChart`, `BarChartBig`, `BarChart3` | `BarChart3` |
| `SquareArrowOutUpRight`, `ExternalLink`, `ArrowUpRight` (como link) | `ExternalLink` |
| `Building`, `Building2` | `Building2` |
| `Users2`, `Users` | `Users` |
| `CircleAlert`, `AlertCircle`, `OctagonAlert` | `AlertTriangle` (aviso) · `AlertCircle` (erro de campo) |
| `Grip`, `GripVertical` | `GripVertical` |

## Migração phosphor-react → lucide-react

`phosphor-react` (114 arquivos), `@phosphor-icons/react` (`XLogoIcon`) e `@tabler/icons-react` (`IconCheck`, `IconCopy`) saem do projeto. Equivalências (contagem de importações entre parênteses):

| phosphor | lucide | | phosphor | lucide |
|---|---|---|---|---|
| `SquaresFour` (39) | `LayoutGrid` | | `Rows` (39) | `Rows3` |
| `ChartBar` (31) | `BarChart3` | | `CalendarBlank` (29) | `Calendar` |
| `MagnifyingGlass` (17) | `Search` | | `Plus` (10) | `Plus` |
| `LinkBreak` (10) | `Unlink` | | `StripeLogo` (9) | `Hash` (JCR) |
| `X` (8) | `X` | | `UserList` (8) | `Users` |
| `Quotes` (8) | `Quote` | | `Student` (7) | `GraduationCap` |
| `Ticket` (6) | `Ticket` | | `FadersHorizontal` (6) | `SlidersHorizontal` |
| `Buildings` (6) | `Building2` | | `PuzzlePiece` (5) | `Puzzle` |
| `IdentificationBadge` (5) | `BadgeCheck` | | `FileCsv` (5) | `FileSpreadsheet` |
| `Copyright` (5) | `Copyright` | | `Books` (5) | `Library` |
| `ArrowUDownLeft` (5) | `CornerDownLeft` | | `ShareNetwork` (4) | `Share2` |
| `MapPin` (4) | `MapPin` | | `Trash` (3) | `Trash2` |
| `PenNib` (3) | `PenTool` | | `Paperclip` (3) | `Paperclip` |
| `LinkSimple` (3) | `Link2` | | `Globe` (3) | `Globe` |
| `Files` (3) | `Files` | | `File` (3) | `File` |
| `CurrencyCircleDollar` (3) | `CircleDollarSign` | | `Columns` (3) | `Columns2` |
| `Code` (3) | `CodeXml` | | `BracketsCurly` (3) | `Braces` |
| `Book` (3) | `Book` | | `AppWindow` (3) | `AppWindow` |
| `Star` (2) | `Star` | | `Stamp` (2) | `Stamp` |
| `ListNumbers` (2) | `ListOrdered` | | `LinkedinLogo` (2) | `Linkedin` |
| `DotsThree` (2) | `MoreHorizontal` | | `CheckCircle` (2) | `CheckCircle2` |
| `CaretDown` (2) | `ChevronDown` | | `ArrowSquareOut` (2) | `ExternalLink` |
| `WhatsappLogo` (1) | `MessageCircle` | | `FacebookLogo` (1) | `Facebook` |
| `Users`, `User` | `Users`, `User` | | `Sparkle` (1) | `Sparkles` |
| `Hash` (1) | `Hash` | | `GraduationCap` (1) | `GraduationCap` |
| `Funnel` (1) | `Filter` | | `FileText` (1) | `FileText` |
| `EyeClosed` (1) | `EyeOff` | | `EnvelopeSimple`, `Envelope` | `Mail` |
| `DownloadSimple` (1) | `Download` | | `Copy` (1) | `Copy` |
| `CheckSquare` (1) | `SquareCheck` | | `Check` (1) | `Check` |
| `ChartLine` (1) | `LineChart` | | `ArrowUUpLeft` (1) | `Undo2` |
| tabler `IconCheck` / `IconCopy` | `Check` / `Copy` | | phosphor `XLogoIcon` | `Twitter` (ou SVG próprio) |

Os nomes `SquareCheck`, `Columns2`, `CircleDollarSign` e `CodeXml` existem na v0.354; ao subir a versão do lucide, confira os renomeios no changelog (`BarChart3` → `ChartColumn`, `AlertTriangle` → `TriangleAlert`; os nomes antigos continuam como alias).
