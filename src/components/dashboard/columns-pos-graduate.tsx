import { ColumnDef } from "@tanstack/react-table"

import { Button } from "../../components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,

    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { MoreHorizontal, Trash, UserCheck } from "lucide-react"
import { ArrowSquareOut, PencilSimple, Student } from "phosphor-react"
import { Eye, EyeSlash, Hash, MapPin, Star } from "phosphor-react";
import { GraduationCapIcon } from "lucide-react";
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { useModal } from "../hooks/use-modal-store"





export type PosGraduationsProps = {
    graduate_program_id: string
    code: string
    name: string
    area: string
    modality: string
    type: string
    rating: string
    institution_id: string
    description: string
    url_image: string
    city: string
    visible: boolean
    menagers: string[]
}


export const columns: ColumnDef<PosGraduationsProps>[] = [



    {
        accessorKey: "name",
        header: "Nome do programa",
        cell: ({ row }) => {

            return <div className="flex gap-2 items-center"> <img className="w-4  object-cover object-center  whitespace-nowrap" src={row.original.url_image} /> {row.getValue("name")}</div>
        }
    },
    {
        accessorKey: "code",
        header: "Código",
        cell: ({ row }) => {

            return <div className="flex gap-1 items-center"><Hash size={12} /> {row.getValue("code")}</div>
        }
    },
    {
        accessorKey: "type",
        header: "Tipo",
        cell: ({ row }) => {

            return <div className="flex gap-1 items-center"><GraduationCapIcon size={12} /> {row.getValue("type")}</div>
        }
    },
    {
        accessorKey: "city",
        header: "Cidade",
        cell: ({ row }) => {

            return <div className="flex gap-1 items-center"><MapPin size={12} /> {row.getValue("city")}</div>
        }

    },
    {
        accessorKey: "rating",
        header: "Classificação",
        cell: ({ row }) => {

            return <div className="flex gap-1 items-center"><Star size={12} /> {row.getValue("rating")}</div>
        }

    },

    {
        id: "actions",
        cell: ({ row }) => {


            const API_KEY = import.meta.env.VITE_URLGERALADMIN
            const handleVisibleProgram = (id: string) => {

                const urlVisibleProgram = API_KEY + `GraduateProgramRest/Update?graduate_program_id=${id}`
                const fetchData = async () => {

                    console.log(urlVisibleProgram)

                    try {
                        const response = await fetch(urlVisibleProgram, {
                            mode: 'cors',
                            method: 'POST',
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'POST',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Access-Control-Max-Age': '3600',
                                'Content-Type': 'text/plain'
                            }
                        });
                        if (response.ok) {


                            toast("Visibilidade alterada", {
                                description: "Operação realizada com sucesso!",
                                action: {
                                    label: "Fechar",
                                    onClick: () => { },
                                },
                            })
                        }


                    } catch (err) {
                        toast("Erro ao mudar visibilidade", {
                            description: "Tente novamente",
                            action: {
                                label: "Fechar",
                                onClick: () => { },
                            },
                        })
                    }
                };
                fetchData();
            };

            const { onOpen } = useModal()

            return (
                <div className="flex gap-3 items-center">


                    <Button onClick={() => handleVisibleProgram(row.original.graduate_program_id)} variant="outline" className="ml-auto p-0  h-8 w-8 text-sm text-gray-500 dark:text-gray-300 flex items-center">
                        {row.original.visible ? (<EyeSlash size={16} />) : (<Eye size={16} />)}</Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size={'icon'} className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Link to={`/pos-graducao/${row.original.code}`}><DropdownMenuItem className="flex items-center gap-3"><ArrowSquareOut className="h-4 w-4" />Visualizar página</DropdownMenuItem></Link>
                            <DropdownMenuItem className="flex items-center gap-3" onClick={() => onOpen('edit-graduate-program', {
                                graduate_program_id: row.original.graduate_program_id,
                                code: row.original.code,
                                name: row.original.name,
                                area: row.original.area,
                                modality: row.original.modality,
                                type: row.original.type,
                                rating: row.original.rating,
                                institution_id: row.original.institution_id,
                                description: row.original.description,
                                url_image: row.original.url_image,
                                city: row.original.city,
                                visible: String(row.original.visible),
                                menagers: row.original.menagers
                            })}  ><PencilSimple className="h-4 w-4" />Editar informações</DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center gap-3" onClick={() => onOpen('add-researcher-graduation', { graduate_program_id: row.original.graduate_program_id, name: row.original.name })}><UserCheck className="h-4 w-4" />
                                Docentes do programa
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center gap-3" onClick={() => onOpen('list-student-program', { graduate_program_id: row.original.graduate_program_id, name: row.original.name })}><Student className="h-4 w-4" />
                                Discentes do programa
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onOpen('confirm-delete-pos-graduate-program', { id_delete: row.original.graduate_program_id, name: row.original.name })} className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white"><Trash className="h-4 w-4" />
                                Deletar programa
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    },
]
