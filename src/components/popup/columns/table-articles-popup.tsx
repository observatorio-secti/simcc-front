
import { columns } from "./columns-articles";
import { DataTable } from "./popup-data-table";

type Articles = {
  articles: any[];
};

export function TableReseracherArticlesPopup(props: Articles) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columns} data={props.articles} />
        </div>
      </div>
    </div>
  );
}
