import { columnsProjetoPesquisa } from "./columns-projetos-pesquisa";
import { DataTable } from "./popup-data-table";

type ProjetosPesquisa = {
  projetos: any[];
};

export function TableReseracherProject(props: ProjetosPesquisa) {
  // Formatar o status de cada projeto
  const projetosFormatados = props.projetos.map((projeto) => ({
    ...projeto,
    status: projeto.status.split('_').join(' '), // Formatar o status
  }));

  return (
    <div className="w-full overflow-auto">
      <div className="rounded-md">
        <div className="overflow-y-auto max-h-fit h-full">
          <DataTable columns={columnsProjetoPesquisa} data={projetosFormatados} />
        </div>
      </div>
    </div>
  );
}
