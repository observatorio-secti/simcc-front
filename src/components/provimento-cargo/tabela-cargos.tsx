import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../dashboard/data-table";
import { Dados } from "./info-provimento-cargo";

const intersticio_tabela = {
  A: { 1: 365, 2: 730 },
  B: { 1: 180, 2: 540 },
};

const columns: ColumnDef<Dados>[] = [
  {
    accessorKey: "classe",
    header: "Classe",
  },
  {
    accessorKey: "nivel",
    header: "Nível",
  },
  {
    accessorKey: "inicio",
    header: "Início",
    cell: ({ row }) => new Date(row.original.inicio).toLocaleDateString("pt-BR"),
  },
  {
    accessorKey: "fim",
    header: "Fim",
    cell: ({ row }) =>
      row.original.fim
        ? new Date(row.original.fim).toLocaleDateString("pt-BR")
        : "N/A",
  },
  {
    accessorKey: "tempo_nivel",
    header: "Tempo no Cargo",
    cell: ({ row }) => (row.original.tempo_nivel ? `${row.original.tempo_nivel} dias` : "N/A"),
  },
  {
    accessorKey: "inicioCorreto",
    header: "Início Correto",
    cell: ({ row }) =>
      row.original.inicioCorreto
        ? new Date(row.original.inicioCorreto).toLocaleDateString("pt-BR")
        : "N/A",
  },
  {
    accessorKey: "fimCorreto",
    header: "Fim Correto",
    cell: ({ row }) =>
      row.original.fimCorreto
        ? new Date(row.original.fimCorreto).toLocaleDateString("pt-BR")
        : "N/A",
  },
];

interface Props {
  combinedData: any[];
}

export function TabelasCargos({ combinedData }: Props) {
  const processData = combinedData.map((item, index) => {
    const inicioDate = new Date(item.inicio);
    const fimDate =
      index === combinedData.length - 1 && !item.fim
        ? new Date(
            inicioDate.getTime() +
              (intersticio_tabela[item.classe]?.[item.nivel] ?? 0) * 24 * 60 * 60 * 1000
          )
        : new Date(item.fim);

    const hasPriorValidItem = combinedData.some(
      (prevItem, prevIndex) =>
        prevIndex < index &&
        prevItem.tempo_acumulado > 0 &&
        prevItem.tempo_nivel != null
    );

    let inicioCorreto = "";
    let fimCorreto = "";

    if (hasPriorValidItem || (item.tempo_acumulado > 0 && item.tempo_nivel != null)) {
      inicioCorreto = new Date(
        index === 0
          ? inicioDate.getTime() + 1 * 24 * 60 * 60 * 1000
          : new Date(combinedData[index - 1]?.fim).getTime() + 1 * 24 * 60 * 60 * 1000
      ).toISOString();

      fimCorreto = new Date(
        new Date(inicioCorreto).getTime() +
          (intersticio_tabela[item.classe]?.[item.nivel] ?? 0) * 24 * 60 * 60 * 1000
      ).toISOString();

      item.fimCorreto = fimCorreto;
    }

    return { ...item, inicioCorreto, fimCorreto };
  });

  return <DataTable columns={columns} data={processData} />;
}
