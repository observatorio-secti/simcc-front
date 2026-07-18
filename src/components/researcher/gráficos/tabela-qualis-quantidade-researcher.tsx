import { useContext, useEffect, useState } from "react";

import { ColumnDef } from "@tanstack/react-table";
import { UserContext } from "../../../context/context";
import { DataTable } from "../../popup/columns/popup-data-table";

interface Props {
  graduate_program_id: string;
  year: string;
}

type Dados = {
  year: number;
  citations: number;
  qualis: Qualis;
};

type Qualis = {
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

export function TabelaQualisQuantidadeResarcher(props: Props) {
  const [dados, setDados] = useState<Dados[]>([]);
  const { urlGeral } = useContext(UserContext);

  const urlDados = `${urlGeral}researcher/${props.graduate_program_id}/article_metrics?year=${props.year}`;

  const fetchData = async () => {
    try {
      const response = await fetch(urlDados, {
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
          "Content-Type": "text/plain",
        },
      });
      const data: Dados[] = await response.json();
      if (data) {
        // Ordenar os dados por ano em ordem decrescente
        const sortedData = data.sort((a, b) => b.year - a.year);
        setDados(sortedData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [urlDados]);

  // Definição das colunas com anos como linhas
  const columns: ColumnDef<Dados>[] = [
    {
      accessorKey: "year",
      header: "Ano",
    },
    {
      accessorKey: "qualis.A1",
      header: "A1",
    },
    {
      accessorKey: "qualis.A2",
      header: "A2",
    },
    {
      accessorKey: "qualis.A3",
      header: "A3",
    },
    {
      accessorKey: "qualis.A4",
      header: "A4",
    },
    {
      accessorKey: "qualis.B1",
      header: "B1",
    },
    {
      accessorKey: "qualis.B2",
      header: "B2",
    },
    {
      accessorKey: "qualis.B3",
      header: "B3",
    },
    {
      accessorKey: "qualis.B4",
      header: "B4",
    },
    {
      accessorKey: "qualis.C",
      header: "C",
    },
    {
      accessorKey: "qualis.SQ",
      header: "SQ",
    },
    {
      accessorKey: "citations",
      header: "Citações",
    },
  ];

  return (
    <div className="space-y-4">

      <DataTable
        columns={columns}
        data={dados} // Dados ordenados em ordem decrescente por ano
      />
    </div>
  );
}
