import { MagnifyingGlass } from "phosphor-react";
import { Alert } from "../../ui/alert";
import { Button } from "../../ui/button";
import { Filter, List, MessagesSquare, TextCursorInput } from "lucide-react";
import { Link } from "react-router-dom";
import { CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { useContext } from "react";
import { UserContext } from "../../../context/context";
import { SectionHome } from "./section";

export function Instrucoes() {

    const {version} = useContext(UserContext)

    return(
        <div className="flex flex-col gap-8">
           

            <SectionHome
                    title="Use palavras-chave específicas"
                    description={`Tente usar palavras-chave específicas que descrevem o tópico que você está procurando. Por exemplo, em vez de pesquisar por "robótica", pesquise por "robótica educacional". Você pode fazer a pesquisa com mais de uma palavra-chave e concatenar com 'E' ou 'OU'`}
                    image="aefaer"
                    meta="Passo 1"
                    orientation='right'
                    />

<SectionHome
                    title="Você pode utilizar a MarIA para aprimorar a busca"
                    description={`Tente usar palavras-chave específicas que descrevem o tópico que você está procurando. Por exemplo, em vez de pesquisar por "robótica", pesquise por "robótica educacional". Você pode fazer a pesquisa com mais de uma palavra-chave e concatenar com 'E' ou 'OU'`}
                    image="aefaer"
                    meta="Passo 2"
                    orientation='left'
                    />

<SectionHome
                    title="Utilize filtros de pesquisa"
                    description={`Limite os resultados da pesquisa usando categorias que possuem diferentes critérios de seleção. Por exemplo, é possível buscar por termos em artigos, em resumo, patentes, nome de pesquisador ou por área de especialidade. Você pode usar os filtros na plataforma para refinar o resultado da pesquisa por qualis, ano ou área de atuação.`}
                    image="aefaer"
                    meta="Passo 3"
                    orientation='right'
                    />

                    <SectionHome
                    title="Veja o dicionário de termos"
                    description={`Em caso de dúvida de qual palavra utilizar para realizar sua pesquisa, acesse o dicionário de termos com mais de 36 mil palavras disponíveis para refinar a sua busca. Você também pode pesquisar as informações das revistas (ISSN, qualis e JCR).`}
                    image="aefaer"
                    meta="Passo 4"
                    orientation='left'
                    />

        </div>
    )
}