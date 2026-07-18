import { GraficoArtigoEvolucaoJcr } from "./graficos-tabelas/grafico-artigo-evolucao-jcr"
import { GraficoArtigoJcr } from "./graficos-tabelas/grafico-artigos-jcr"
import { TabelaQualisQuantidade } from "./graficos-tabelas/tabela-qualis-quantidade"

interface Props {
    graduate_program_id: string
}

export function AdminGraficoGraduateProgram(props: Props) {
    return (
        <div className="hidden md:block md:mt-4" >
            <TabelaQualisQuantidade graduate_program_id={props.graduate_program_id} />

            <div className="grid lg:grid-cols-2 gap-8">
                <GraficoArtigoEvolucaoJcr graduate_program_id={props.graduate_program_id} />

                <GraficoArtigoJcr graduate_program_id={props.graduate_program_id} />
            </div>
        </div>
    )
}