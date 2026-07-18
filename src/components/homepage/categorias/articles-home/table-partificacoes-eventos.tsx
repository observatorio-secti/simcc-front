import { DataTable } from "../researchers-home/data-table";
import { columnsParcicipacaoEvento } from "../../../popup/columns/columns-participacao-eventos";
import { columns } from "../../../popup/columns/columns-articles";

type Participacoes = {
  p: any[];
};

export function TableParticipacoesEventos(props: Participacoes) {
  return (
    <div className="w-full overflow-auto ">
      <div className="rounded-md">
        <div className=" overflow-y-auto max-h-fit h-full ">
          <DataTable columns={columnsParcicipacaoEvento} data={props.p} />
        </div>
      </div>
    </div>
  );
}
