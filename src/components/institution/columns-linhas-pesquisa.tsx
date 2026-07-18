import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { Alert } from "../ui/alert";
import { areasComCores } from "./institution-item";
import { Linhas } from "./linhas-pesquisa-programa";
import { CalendarBlank } from "phosphor-react";

export const columnsLinhasPesquisa: ColumnDef<Linhas>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Nome
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "area",
        header: "Área",
    },


    {
        accessorKey: "start_year",
        header: "Início",
        cell: ({ row }) => {
            return (
                <div className="  flex gap-1 items-center">
                    <CalendarBlank size={16} /> {row.getValue("start_year")}
                </div>
            )
        }
    },


    {
        accessorKey: "end_year",
        header: "Final",
        cell: ({ row }) => {
            return (
                <div className="  flex gap-1 items-center">
                    <CalendarBlank size={16} /> {!row.original.end_year ? ('Atual') : (row.original.end_year)}
                </div>
            )
        }
    }

];