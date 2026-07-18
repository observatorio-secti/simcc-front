import { columnsTextoRevista } from "./columns-texto-revista";
import { DataTable } from "./popup-data-table";

type TextosRevistas = {
  textos_revistas: any[];
};

export function TableTextoRevista(props: TextosRevistas) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columnsTextoRevista} data={props.textos_revistas} />
        </div>
      </div>
    </div>
  );
}
