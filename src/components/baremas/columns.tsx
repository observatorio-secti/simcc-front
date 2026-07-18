import { ColumnDef } from "@tanstack/react-table";

// Define your interfaces
interface SomaTotalPorGrupoEPesquisador {
  [grupoId: string]: {
    titulo: string;
    pesquisadores: { id: string; name: string; total: number }[];
  } | { [pesquisadorId: string]: string };
}

export interface PesquisadorProps {
  somaTotalPorGrupoEPesquisador: SomaTotalPorGrupoEPesquisador;
}


// Function to generate columns dynamically
export function generateColumns(somaTotalPorGrupoEPesquisador: SomaTotalPorGrupoEPesquisador): ColumnDef<PesquisadorProps>[] {
  const columns: ColumnDef<PesquisadorProps>[] = [];

  Object.keys(somaTotalPorGrupoEPesquisador).forEach((grupoId) => {
    columns.push({
      accessorKey: grupoId as keyof PesquisadorProps,
      header: somaTotalPorGrupoEPesquisador[grupoId].titulo,
    });
  });
  

  return columns;
}


