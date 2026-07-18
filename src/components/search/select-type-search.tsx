import { useContext } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { UserContext } from "../../context/context"
import { useModalResult } from "../hooks/use-modal-result"
import { useLocation, useNavigate } from "react-router-dom"


const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

export function SelectTypeSearch() {

  const location = useLocation();
  const navigate = useNavigate();
  const posGrad = location.pathname == '/pos-graduacao'

  const resultados = location.pathname == '/resultados'

  const { onOpen } = useModalResult()
  const queryUrl = useQuery()
  const { searchType, setSearchType } = useContext(UserContext)
  let type_search = ''

  return (
    <div className="min-w-max">
      <Select
        defaultValue={searchType}
        value={searchType}
        onValueChange={(value) => {
          setSearchType(value);
          onOpen("researchers-home");

          if(resultados) {
            queryUrl.set('type_search', value);
    navigate({
      pathname: '/resultados',
      search: queryUrl.toString(),
    });
          }
        }}
      >
        <SelectTrigger className="w-full whitespace-nowrap">
          <div className="hidden md:block">
            <SelectValue placeholder="Escolha o tipo de pesquisa" />
          </div>
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          <SelectItem value="article">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-blue-500 flex rounded-sm h-4 w-4"></div> Artigos
            </div>
          </SelectItem>
          <SelectItem value="book">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-pink-500 flex rounded-sm h-4 w-4"></div> Livros e capítulos
            </div>
          </SelectItem>
          <SelectItem value="patent">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-cyan-500 flex rounded-sm h-4 w-4"></div> Patentes
            </div>
          </SelectItem>
          <SelectItem value="name">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-red-500 flex rounded-sm h-4 w-4"></div> Nome
            </div>
          </SelectItem>
          <SelectItem value="area">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-green-500 flex rounded-sm h-4 w-4"></div> Áreas
            </div>
          </SelectItem>
          <SelectItem value="abstract">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-yellow-500 flex rounded-sm h-4 w-4"></div> Resumo
            </div>
          </SelectItem>
          <SelectItem value="speaker">
            <div className="flex gap-4 items-center mr-2">
              <div className="bg-orange-500 flex rounded-sm h-4 w-4"></div> Participação em eventos
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

    </div>
  )
}