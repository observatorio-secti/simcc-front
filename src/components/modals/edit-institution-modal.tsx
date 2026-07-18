import { Check, CheckCheck, Pencil } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useContext, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { ColorPicker } from "../ui/color-picker";

export interface Props {
  name: string;
  acronym: string;
  institution_id: string;
  profile: {
      img_perfil: string;
      img_background: string;
      institution_id: string;
      color: string;
      site: string;
      name: string;
  };
  setProfile: React.Dispatch<React.SetStateAction<{
      img_perfil: string;
      img_background: string;
      institution_id: string;
      color: string;
      site: string;
      name: string;
  }>>;
}


export function EditInstitutionModal(props:Props) {

  const { profile, setProfile } = props;

    const [name, setName] = useState(props.name)
    const [acronym, setAcronym] = useState(props.acronym)

   
    const [institutionId, setInstitutionId] = useState(props.institution_id)
 
const {urlGeralAdm} = useContext(UserContext)

    const handleSubmitPesquisador = async () => {


        try {
          const data = [
            {
              
                name: name,
                acronym: acronym,
                institution_id: institutionId,
               
              }
          ]

          console.log(data)

          let urlProgram = urlGeralAdm + '/InstitutionRest/Update'

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
                        description: "Instituição atualizada na plataforma",
                        action: {
                          label: "Fechar",
                          onClick: () => { },
                        },
                      })
                    } else {
                      if (response.status === 400) {
                        toast("Instituição já existe", {
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
              <h4 className="font-medium leading-none">Editar instituição</h4>
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
                <Label htmlFor="maxWidth">Sigla</Label>
                <Input
                  id="maxWidth"
                  value={acronym}
                  onChange={(e) => setAcronym(e.target.value)}
                  className="col-span-2 h-8"
                />
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Site</Label>
                <Input
  type="text" className="col-span-2"
  value={profile.site}
  onChange={(e) => {
    setProfile((prev) => ({ ...prev, site: e.target.value }));
    
  }}
/>
              </div>

              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Cor base</Label>
                <div className="flex gap-4 col-span-2">
  <Input
    type="text"
    value={profile.color}
    onChange={(e) => {
      setProfile((prev) => ({ ...prev, color: e.target.value }));
    
    }}
  />
  <ColorPicker
    value={profile.color}
    onChange={(v) => {
      setProfile((prev) => ({ ...prev, color: v }));
     
    }}
  />
</div>
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
           
             


              <Button onClick={handleSubmitPesquisador}>
                <Check size={16}/> Atualizar dados
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
}