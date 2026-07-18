
import { columnsRelatorioTecnico } from "./columns-relatorio-tecnico";
import { DataTable } from "./popup-data-table";

type RelatorioTecnico = {
  relatorios: any[];
};

export function TableRelatorioTecnico(props: RelatorioTecnico) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columnsRelatorioTecnico} data={props.relatorios} />
        </div>
      </div>
    </div>
  );
}
