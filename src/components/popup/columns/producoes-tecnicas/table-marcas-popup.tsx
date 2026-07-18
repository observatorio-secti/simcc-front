
import { columns } from "./columns-marcas";
import { DataTable } from "../popup-data-table";

type Livros = {
  livros: any[];
};

export function TableReseracherMarcasPopup(props: Livros) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columns} data={props.livros} />
        </div>
      </div>
    </div>
  );
}
