import { columns } from "./columns-orientacoes";
import { DataTable } from "./popup-data-table";

type Orientacoes = {
  orientacoes: any[];
};

export function TableReseracherOrientacoesPopup(props: Orientacoes) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columns} data={props.orientacoes} />
        </div>
      </div>
    </div>
  );
}
