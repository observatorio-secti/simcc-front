import { columnsTrabalhoEvento } from "./columns-trabalho-eventos";
import { DataTable } from "./popup-data-table";

type TrabalhoEvento = {
  trabalho_evento: any[];
};

export function TableTrabalhoEventos(props: TrabalhoEvento) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columnsTrabalhoEvento} data={props.trabalho_evento} />
        </div>
      </div>
    </div>
  );
}
