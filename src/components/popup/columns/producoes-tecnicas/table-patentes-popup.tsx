
import { columns } from "./columns-patentes";
import { DataTable } from "../popup-data-table";

type Patentes = {
  patentes: any[];
};

export function TableReseracherPatentesPopup(props: Patentes) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columns} data={props.patentes} />
        </div>
      </div>
    </div>
  );
}
