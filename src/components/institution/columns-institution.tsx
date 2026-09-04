import { ColumnDef } from '@tanstack/react-table';
import { Button } from '../ui/button';
import { ArrowUpDown, ExternalLink, GraduationCap, Users } from 'lucide-react';
import { Institution } from '../../services/institution';
import { Link } from 'react-router-dom';

export const columnsInstitution: ColumnDef<Institution>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Instituição
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
  },
  {
    accessorKey: 'acronym',
    header: 'Sigla',
    cell: ({ row }) => <div>{row.getValue('acronym')}</div>,
  },
  {
    accessorKey: 'count_r',
    header: () => <div>Docentes</div>,
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <Users size={12} className="text-muted-foreground" />
        {row.getValue('count_r')}
      </div>
    ),
  },
  {
    accessorKey: 'count_gp',
    header: () => <div>Pós</div>,
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <GraduationCap size={12} className="text-muted-foreground" />
        {row.getValue('count_gp')}
      </div>
    ),
  },
  {
    accessorKey: 'count_gps',
    header: () => <div>Grupos</div>,
    cell: ({ row }) => (
      <div className="flex gap-2 items-center">
        <Users size={12} className="text-muted-foreground" />
        {row.getValue('count_gps')}
      </div>
    ),
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const inst = row.original;
      const identifier = inst.acronym?.trim() || inst.id;
      return (
        <Link to={`/instituicao/${encodeURIComponent(identifier)}`}>
          <Button variant="outline" size="icon" className="h-8 w-8" title={`Ver ${inst.acronym || inst.name}`}>
            <ExternalLink size={14} />
          </Button>
        </Link>
      );
    },
  },
];
