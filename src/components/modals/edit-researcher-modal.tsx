import { Check, CheckCheck, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useContext, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { UserContext } from "../../context/context";

export interface Props {
    name: string
    lattes_id: string
    researcher_id: string
    institution_id: string
    status:boolean
  }

export function EditResearcherModal(props:Props) {

    const [name, setName] = useState(props.name)
    const [lattesId, setLattesId] = useState(props.lattes_id)
    const [researcherId, setResearcherId] = useState(props.researcher_id)
    const [institutionId, setInstitutionId] = useState(props.institution_id)
    const [status, setStatus] = useState(props.status ? ('ativo'):('inativo'))
const {urlGeralAdm} = useContext(UserContext)

    const handleSubmitPesquisador = async () => {


        try {
          const data = [
            {
                researcher_id: props.researcher_id,
                name: name,
                lattes_id: props.lattes_id,
                institution_id: institutionId,
                status:(status == 'ativo' ? (true):(false))
              }
          ]

          console.log(data)

          let urlProgram = urlGeralAdm + '/ResearcherRest/Update'

          const fetchData = async () => {
          
                try {
                    const response = await fetch(urlProgram, {
                      mode: 'cors',
                      method: 'PUT',
                      headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'PUT',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Max-Age': '3600',
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(data),
                    });
      
                    if (response.ok) {
                    
                      toast("Dados enviados com sucesso", {
                          description: "Pesquisador atualizado na instituição",
                          action: {
                            label: "Fechar",
                            onClick: () => { },
                          },
                        })
                    } else {
                      if (response.status === 400) {
                        toast("Pesquisador já existe", {
                          description: "Tente novamente",
                          action: {
                            label: "Fechar",
                            onClick: () => { },
                          },
                        });
                      } else {
                        toast("Erro ao enviar os dados ao servidor", {
                          description: "Tente novamente",
                          action: {
                            label: "Fechar",
                            onClick: () => { },
                          },
                        });
                      }
                    }
                    
                  } catch (err) {
                    console.log(err);
                  } 
          
          };
          fetchData();
    
          
        } catch (error) {
          console.error('Erro ao processar a requisição:', error);
        }
      };

    return(
        <Popover>
        <PopoverTrigger asChild>
        <Button variant={'outline'} className="h-8 w-8 p-0 ">
  <Pencil size={8} className="h-4 w-4" />
  </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Editar pesquisador</h4>
              <p className="text-sm text-muted-foreground">
                {props.name}
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Nome</Label>
                <Input
                  id="width"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Lattes Id</Label>
                <Input
                  id="maxWidth"
                  value={lattesId}
                  onChange={(e) => setLattesId(e.target.value)}
                  className="col-span-2 h-8"
                />
              </div>

             {/* <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Instituição</Label>
                <Input
                  id="height"
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="col-span-2 h-8"
                />
              </div>*/}
           
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxHeight">Status</Label>
                <Select value={status} onValueChange={setStatus}>
  <SelectTrigger className="h-8 col-span-2">
    <SelectValue placeholder="" />
  </SelectTrigger>
  <SelectContent>
  <SelectItem value="ativo">Ativo</SelectItem>
  <SelectItem value="inativo">Inativo</SelectItem>

  </SelectContent>
</Select>
              </div>


              <Button onClick={handleSubmitPesquisador}>
                <Check size={16}/> Atualizar dados
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
}