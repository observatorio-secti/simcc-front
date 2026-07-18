import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion";
import { RefreshCcw, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { Alert } from "../../ui/alert";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { toast } from "sonner";

interface User {
  institution_id: string;
  user_id: string;
  display_name: string;
  email: string;
  uid: string;
  photo_url: string;
  dep_id: string;
  roles: Roles[];
  linkedin: string;
  lattes_id: string;
  shib_id: string;
  graduate_program: GraduateProgram[];
  researcger_name: string;
}

interface GraduateProgram {
  graduate_program_id: string;
  name: string;
}

interface Roles {
  id: string;
  role_id: string;
}

export interface Props {
  name: string
  institution_id: string
  acronym:string
  lattes_id:string
}

export function EditarInfoUsuarios() {
  const { urlGeralAdm, user } = useContext(UserContext);

  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<Record<string, Partial<User>>>({});

  const urlGetResearcher = urlGeralAdm + `InstitutionRest/Query`;
  const [researcher, setResearcher] = useState<Props[]>([]);
  const urlUser = `${urlGeralAdm}/s/user/entrys?uid=${user?.uid}`;
  console.log(urlUser);

  const fetchDataTable = async () => {
   
    try {
      const response = await fetch(urlGetResearcher, {
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '3600',
          'Content-Type': 'text/plain',
        },
      });
      const data = await response.json();
      if (data) {
        setResearcher(data);
      
     
      }
    } catch (err) {
      console.log(err);
   
    }
  };

  useEffect(() => {
    fetchDataTable();
  }, [urlGetResearcher]);


  const fetchData = async () => {
    try {
      const response = await fetch(urlUser, {
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
          "Content-Type": "text/plain",
        },
      });
      const data = await response.json();
      if (data) {
        setUsers(data);
        // Initialize form data with user data
        const initialFormData = data.reduce((acc: Record<string, Partial<User>>, user: User) => {
          acc[user.user_id] = { ...user };
          return acc;
        }, {});
        setFormData(initialFormData);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  console.log(users);

  const handleInputChange = (userId: string, field: keyof User, value: string) => {
    setFormData({
      ...formData,
      [userId]: {
        ...formData[userId],
        [field]: value,
      },
    });
  };

  const handleSubmit = async (userId: string) => {
    try {
      const data = formData[userId];
      if (data && data.display_name?.length === 0) {
        toast("O nome não pode ser vazio", {
          description: "Por favor, tente novamente",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }

      const urlGruposPesquisaInsert = `${urlGeralAdm}s/user`;

      const response = await fetch(urlGruposPesquisaInsert, {
        mode: "cors",
        method: "PUT",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "PUT",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
          "Content-Type": "application/json",
        },
        body: JSON.stringify([data]),
      });

      if (response.ok) {
        toast("Dados enviados com sucesso", {
          description: "Todos os dados foram enviados.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
      }
    } catch (error) {
      console.error("Erro ao processar a requisição:", error);
      toast("Erro ao processar a requisição", {
        description: "Tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };

  return (
    <div>
      <Accordion type="single" collapsible className="flex flex-col gap-4">
        {users.map((user, index) => (
          <Alert key={user.user_id}>
            <AccordionItem value={String(index)}>
              <div className="flex justify-between items-center h-10">
                <div className="h-10">
                  <div className="flex items-center gap-2">
                    <Avatar className="cursor-pointer rounded-md h-8 w-8">
                      <AvatarImage className="rounded-md h-8 w-8" src={`${user.photo_url}`} />
                      <AvatarFallback className="flex items-center justify-center">
                        <UserIcon size={12} />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.display_name}</p>
                      <div className="text-xs text-gray-500">({user.email})</div>
                    </div>
                  </div>
                </div>
                <AccordionTrigger></AccordionTrigger>
              </div>

              <AccordionContent className="p-0">
                <div className="flex w-full gap-4 items-end">
                  <div className="flex w-full flex-col gap-2 mt-4">
                    <Label>Nome completo</Label>
                    <Input
                      value={formData[user.user_id]?.display_name || ""}
                      onChange={(e) => handleInputChange(user.user_id, "display_name", e.target.value)}
                      type="text"
                    />
                  </div>
                </div>

                <div className="flex w-full gap-4 items-end">
                  <div className="flex w-full flex-col gap-2 mt-4">
                    <Label>LinkedIn</Label>
                    <Input
                      value={formData[user.user_id]?.linkedin || ""}
                      onChange={(e) => handleInputChange(user.user_id, "linkedin", e.target.value)}
                      type="text"
                    />
                  </div>

                  <div className="flex w-full flex-col gap-2 mt-4">
                    <Label>Id da instituição</Label>
                    <Input
                      value={formData[user.user_id]?.institution_id || ""}
                      onChange={(e) => handleInputChange(user.user_id, "institution_id", e.target.value)}
                      type="text"
                    />
                  </div>

                  <div className="flex w-full flex-col gap-2 mt-4">
                    <Label>Id Lattes</Label>
                    <Input
                      value={formData[user.user_id]?.lattes_id || ""}
                      onChange={(e) => handleInputChange(user.user_id, "lattes_id", e.target.value)}
                      type="text"
                    />
                  </div>

                  <Button onClick={() => handleSubmit(user.user_id)}>
                    <RefreshCcw size={16} /> Atualizar dados
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Alert>
        ))}
      </Accordion>
    </div>
  );
}
