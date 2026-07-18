
import { columns } from "./columns";

import { DataTable } from "../../categorias/researchers-home/data-table";

type Institutions = {
  institutions: any[];
};
export function TableReseracherInstitutionshome(props: Institutions) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columns} data={props.institutions} />
        </div>
      </div>
    </div>
  );
}
