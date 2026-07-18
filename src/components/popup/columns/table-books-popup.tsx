import { columns } from "./columns-books";
import { DataTable } from "./popup-data-table";

type Livros = {
  books: any[];
};

export function TableReseracherBookPopup(props: Livros) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columns} data={props.books} />
        </div>
      </div>
    </div>
  );
}
