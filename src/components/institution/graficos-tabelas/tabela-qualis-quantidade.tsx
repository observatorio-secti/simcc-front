import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../../context/context';
import { DataTable } from '../../dashboard/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useQuery } from '../../dashboard/builder-page/tabelas/tabela-artigos';

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

interface Props {
  anoSelecionado: number | null;
  setAnoSelecionado: (ano: number) => void;
  setAnos: (anos: number[]) => void;
}

export function TabelaQualisQuantidade(props: Props) {
  const [dados, setDados] = useState<Dados[]>([]);

  const [year, setYear] = useState(new Date().getFullYear() - 4);

  const queryUrl = useQuery();

  const graduate_program_id = queryUrl.get('graduate_program_id');

  const dep_id = queryUrl.get('dep_id');

  const { urlGeral } = useContext(UserContext);
  const urlDados = `${urlGeral}graduate_program/${graduate_program_id && graduate_program_id}/article_production?year=${year}`;
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
      const data: Dados[] = await response.json();
      if (data) {
        setDados(data);

        // Extrair os anos únicos
        const uniqueYears = Array.from(
          new Set(data.map((item) => item.year)),
        ).sort((a, b) => a - b);
        // Enviar os anos únicos para o componente pai
        props.setAnos(uniqueYears);

        // Se o pai ainda não tiver um ano selecionado, definir o primeiro como padrão
        if (!props.anoSelecionado && uniqueYears.length > 0) {
          props.setAnoSelecionado(uniqueYears[0]);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [urlDados]);
  console.log(urlDados);
  console.log(dados);

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
    <div className="space-y-4 w-full pb-4">
      {/* Seletor de anos */}

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={
          Array.isArray(dados)
            ? dados.filter((item) => item.year === props.anoSelecionado)
            : []
        }
      />
    </div>
  );
}
