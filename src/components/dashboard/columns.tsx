import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

import { ArrowUpDown, Maximize2, User } from 'lucide-react';
import { Copy, Trash } from 'phosphor-react';
import { useModal } from '../hooks/use-modal-store';
import { useContext, useState } from 'react';
import { EditResearcherModal } from '../modals/edit-researcher-modal';
import { UserContext } from '../../context/context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export interface PesquisadorProps {
  name: string;
  lattes_id: string;
  researcher_id: string;
  institution_id: string;
  last_update: string;
  status: boolean;
  create_at: string;
}

export const columns: ColumnDef<PesquisadorProps>[] = [
  {
    accessorKey: 'name',
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
    cell: ({ row }) => {
      const lattes_id = row.original.name;
      const { urlGeral } = useContext(UserContext);
      return (
        <div className="flex gap-3 items-center">
          <Avatar className="cursor-pointer rounded-md  h-8 w-8">
            <AvatarImage
              className={'rounded-md h-8 w-8'}
              src={`${urlGeral}ResearcherData/Image?name=${lattes_id}`}
            />
            <AvatarFallback className="flex items-center justify-center">
              <User size={16} />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex">{row.getValue('name')}</div>
        </div>
      );
    },
  },
  {
    accessorKey: 'lattes_id',
    header: 'ID Lattes',
  },
  {
    accessorKey: 'researcher_id',
    header: 'ID do pesquisador',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 items-center">
          <div
            className={` rounded-md h-4 w-4 ${row.original.status ? 'bg-green-500' : 'bg-red-500'}`}
          ></div>
          <div className="flex-1 flex">
            {row.original.status ? 'Ativo' : 'Inativo'}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const payment = row.original;
      const id_pesquisador = row.original.researcher_id;
      const name = row.original.name;

      const { onOpen } = useModal();
      const [status, setStatus] = useState(row.original.status);

      return (
        <div className="flex gap-3">
          <Button
            onClick={() =>
              onOpen('confirm-delete-researcher', {
                id_delete: id_pesquisador,
                name: name,
              })
            }
            variant={'destructive'}
            className="h-8 w-8 p-0 text-white  dark:text-white"
          >
            <Trash size={8} className="h-4 w-4" />
          </Button>

          <EditResearcherModal
            researcher_id={row.original.researcher_id}
            name={row.original.name}
            lattes_id={row.original.lattes_id}
            institution_id={row.original.institution_id}
            status={row.original.status}
          />

          <Button
            onClick={() => onOpen('researcher-modal', { name: name })}
            variant={'outline'}
            className="h-8 w-8 p-0 "
          >
            <Maximize2 size={8} className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => {
              navigator.clipboard.writeText(payment.lattes_id);

              toast('Operação realizada', {
                description: 'ID Lattes copiado para área de transferência',
                action: {
                  label: 'Fechar',
                  onClick: () => {},
                },
              });
            }}
            variant={'outline'}
            className="h-8 w-8 p-0 "
          >
            <Copy size={16} />
          </Button>
        </div>
      );
    },
  },
];
