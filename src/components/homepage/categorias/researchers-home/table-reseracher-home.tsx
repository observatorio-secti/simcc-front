import { columns } from "./columns";
import { DataTable } from "./data-table";

type Research = {
    researcher: any[];
}

export function TableReseracherhome(props: Research) {

    return (
        <div className="w-full overflow-auto ">
            <div className="rounded-md">
                <div className=" overflow-y-auto max-h-fit h-full ">
                    <DataTable columns={columns} data={props.researcher} />
                </div>
            </div>
        </div>
    )
}