import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/context';
import { DataTable } from '../../dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

interface Props {
  graduate_program_id: string;
}

type Dados = {
  citations: number;
  year: number;
  name: string;
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

export function TabelaQualisQuantidade(props: Props) {
  const [dados, setDados] = useState<Dados[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);
  const [year] = useState(new Date().getFullYear() - 4);

  const { urlGeral } = useContext(UserContext);
  const urlDados = `${urlGeral}graduate_program/${props.graduate_program_id}/article_production?year=${year}`;

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      if (!urlGeral || !props.graduate_program_id) return;
      try {
        const response = await fetch(urlDados, {
          mode: 'cors',
          signal: controller.signal,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });
        if (!response.ok) throw new Error(`article_production ${response.status}`);
        const raw = await response.json();
        if (!Array.isArray(raw)) throw new Error('article_production not array');
        const normalized: Dados[] = raw.map((r: Record<string, unknown>) => ({
          name: String((r.name as string) ?? (r.researcher as string) ?? ''),
          year: Number(r.year as number),
          citations: Number((r.citations as number) ?? (r.citations_count as number) ?? 0),
          A1: Number((r.A1 as number) ?? (r.a1 as number) ?? ((r.qualis as Record<string, unknown>)?.A1 as number) ?? ((r.qualis as Record<string, unknown>)?.a1 as number) ?? 0),
          A2: Number((r.A2 as number) ?? (r.a2 as number) ?? ((r.qualis as Record<string, unknown>)?.A2 as number) ?? ((r.qualis as Record<string, unknown>)?.a2 as number) ?? 0),
          A3: Number((r.A3 as number) ?? (r.a3 as number) ?? ((r.qualis as Record<string, unknown>)?.A3 as number) ?? ((r.qualis as Record<string, unknown>)?.a3 as number) ?? 0),
          A4: Number((r.A4 as number) ?? (r.a4 as number) ?? ((r.qualis as Record<string, unknown>)?.A4 as number) ?? ((r.qualis as Record<string, unknown>)?.a4 as number) ?? 0),
          B1: Number((r.B1 as number) ?? (r.b1 as number) ?? ((r.qualis as Record<string, unknown>)?.B1 as number) ?? ((r.qualis as Record<string, unknown>)?.b1 as number) ?? 0),
          B2: Number((r.B2 as number) ?? (r.b2 as number) ?? ((r.qualis as Record<string, unknown>)?.B2 as number) ?? ((r.qualis as Record<string, unknown>)?.b2 as number) ?? 0),
          B3: Number((r.B3 as number) ?? (r.b3 as number) ?? ((r.qualis as Record<string, unknown>)?.B3 as number) ?? ((r.qualis as Record<string, unknown>)?.b3 as number) ?? 0),
          B4: Number((r.B4 as number) ?? (r.b4 as number) ?? ((r.qualis as Record<string, unknown>)?.B4 as number) ?? ((r.qualis as Record<string, unknown>)?.b4 as number) ?? 0),
          C: Number((r.C as number) ?? (r.c as number) ?? ((r.qualis as Record<string, unknown>)?.C as number) ?? ((r.qualis as Record<string, unknown>)?.c as number) ?? 0),
          SQ: Number((r.SQ as number) ?? (r.sq as number) ?? ((r.qualis as Record<string, unknown>)?.SQ as number) ?? ((r.qualis as Record<string, unknown>)?.sq as number) ?? 0),
        }));
        setDados(normalized);
        const uniqueYears = Array.from(new Set(normalized.map((item) => item.year))).sort((a, b) => a - b);
        setAnos(uniqueYears);
        setAnoSelecionado(uniqueYears[0] ?? null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setDados([]);
        setAnos([]);
        setAnoSelecionado(null);
      }
    };
    fetchData();
    return () => controller.abort();
  }, [urlDados]);

  // Definição das colunas para o DataTable
  const columns: ColumnDef<Dados>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
    },
    {
      accessorKey: 'A1',
      header: 'A1',
    },
    {
      accessorKey: 'A2',
      header: 'A2',
    },
    {
      accessorKey: 'A3',
      header: 'A3',
    },
    {
      accessorKey: 'A4',
      header: 'A4',
    },
    {
      accessorKey: 'B1',
      header: 'B1',
    },
    {
      accessorKey: 'B2',
      header: 'B2',
    },
    {
      accessorKey: 'B3',
      header: 'B3',
    },
    {
      accessorKey: 'B4',
      header: 'B4',
    },
    {
      accessorKey: 'C',
      header: 'C',
    },
    {
      accessorKey: 'SQ',
      header: 'SQ',
    },
    {
      accessorKey: 'citations',
      header: 'Citações',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Seletor de anos */}
      <div className="flex items-center gap-4">
        <Label htmlFor="year" className="text-sm font-medium">
          Selecione o ano:
        </Label>
        <Select
          value={String(anoSelecionado) ?? ''}
          onValueChange={(value) => setAnoSelecionado(Number(value))}
        >
          <SelectTrigger className="gap-3 w-fit">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {anos.map((ano) => (
              <SelectItem key={ano} value={String(ano)}>{ano}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={dados.filter((item) => item.year === anoSelecionado)}
      />
    </div>
  );
}
