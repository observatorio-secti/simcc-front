import { useRouter } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { indexLevelColor } from '@/shared/lib/design-tokens';
import { Button } from '@/shared/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import {
  RESEARCHER_INDEX_LEGEND,
  RESEARCHER_INDEX_LEVELS,
} from './researcher-index-data';

/** Página documental que explica os níveis e critérios do índice do pesquisador. */
export function ResearcherIndexPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={() => router.history.back()}
          aria-label="Voltar"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">
          Índice do pesquisador
        </h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 pt-6">
          <h2 className="max-w-[700px] text-2xl font-bold tracking-tight md:text-4xl md:leading-[1.15]">
            Saiba mais sobre o{' '}
            <strong className="inline-block rounded-md bg-eng-blue px-2.5 py-0.5 font-semibold text-white">
              cálculo
            </strong>{' '}
            do índice do pesquisador na plataforma
          </h2>
          <p className="max-w-[750px] text-sm font-light text-muted-foreground md:text-lg">
            Classificação multicritério de E a A+ que combina tempo de
            doutorado, produção acadêmica e técnica e experiência em orientação
            na pós-graduação Stricto Sensu.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Tabela de parâmetros por nível
          </CardTitle>
          <CardDescription>
            Requisitos mínimos considerados em cada faixa de classificação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[110px]">Nível</TableHead>
                <TableHead>Tempo de doutorado (anos)</TableHead>
                <TableHead>Produção acadêmica*</TableHead>
                <TableHead>Experiência PG (orientação)</TableHead>
                <TableHead>Regra combinada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RESEARCHER_INDEX_LEVELS.map((row) => {
                const levelColor = indexLevelColor(row.level);
                return (
                  <TableRow key={row.level}>
                    <TableCell className="font-medium">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'h-3.5 w-3.5 shrink-0 rounded-sm',
                            levelColor.bg,
                          )}
                        />
                        <span>{row.level}</span>
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.phdYears}
                    </TableCell>
                    <TableCell>{row.academicProduction}</TableCell>
                    <TableCell>{row.pgExperience}</TableCell>
                    <TableCell>{row.combinedRule}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-xs text-muted-foreground"
                >
                  {RESEARCHER_INDEX_LEGEND}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Metodologia e documentos de referência
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              A tabela acima apresenta os parâmetros utilizados para classificar
              os pesquisadores em níveis que variam de E (mais baixo) a A+ (mais
              alto), por meio de uma análise multicritério que considera o tempo
              desde a conclusão do doutorado, a produção acadêmica e técnica e a
              experiência em programas de pós-graduação Stricto Sensu.
            </p>
            <p>
              A definição dos parâmetros baseou-se nos seguintes documentos: a)
              Documento de área da Capes para a área 45 (Interdisciplinar); b)
              Chamada pública CNPq 04/2021 para Bolsas de Produtividade em
              Pesquisa (PQ); c) Chamada CNPq 05/2021 para Bolsas de
              Produtividade Sênior (PQ-Sr); d) Chamada CNPq 04/2023 para Bolsas
              de Desenvolvimento Tecnológico e Extensão Inovadora (DT); e e)
              Referência do Grupo de Trabalho Produção Técnica da CAPES (2018).
            </p>
            <p>
              A produção acadêmica dos pesquisadores, medida pela quantidade de
              artigos e qualificação no Qualis, considera os últimos quatro
              anos, correspondendo ao período de avaliação quadrienal da Capes e
              ao indicador de produção intelectual em periódicos (IndProdArt).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Tempo de doutorado, orientações e substituição técnica
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              O tempo de doutorado, a análise do estrato Qualis e a experiência
              na pós-graduação Stricto Sensu seguem o Edital CNPq Nº 04/2021,
              que exige 3 anos (Pesquisador 2), 8 anos (Pesquisador 1D) e 10
              anos (Pesquisador 1C e 1B), com uma faixa intermediária de 3 a 6
              anos.
            </p>
            <p>
              O edital também valoriza artigos bem avaliados no Qualis-Capes e
              exige pelo menos duas orientações concluídas para os níveis mais
              elevados de bolsas.
            </p>
            <p>
              Além desses critérios, há uma regra combinada que permite
              substituir parte da produção acadêmica por produção técnica
              (patentes e softwares). Nos níveis A+ e A, um artigo A1 pode ser
              trocado por uma patente; nos níveis B+, B, C+, C e D+, qualquer
              artigo pode ser substituído por uma patente ou três softwares.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
