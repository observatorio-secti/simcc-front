import { ColumnDef } from '@tanstack/react-table';

import { ArrowUpDown } from 'lucide-react';
import { Button } from '../../ui/button';

type Livros = {
  technician_id: string;
  nome: string;
  genero: string;
  name: string;
  deno_sit: string;
  rt: string;
  classe: string;
  cargo: string;
  nivel: string;
  ref: string;
  titulacao: string;
  setor: string;
  detalhe_setor: string;
  dting_org: string;
  data_prog: string;
  semester: string;
};

export const columnsTecnicos: ColumnDef<Livros>[] = [
  {
    accessorKey: 'nome',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },

  {
    accessorKey: 'setor',
    header: 'Setor',
  },

  {
    accessorKey: 'cargo',
    header: 'Cargo',
  },

  {
    accessorKey: 'classe',
    header: 'Classe',
  },

  {
    accessorKey: 'nivel',
    header: 'Nível',
  },

  {
    accessorKey: 'rt',
    header: 'Regime de trabalho',
    cell: ({ row }) => {
      return <div className="">{row.original.rt}h</div>;
    },
  },
];
