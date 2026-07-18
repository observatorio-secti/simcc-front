import { useContext } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { UserContext } from "../../../context/context"
import { User } from "lucide-react"
import { Alert } from "../../ui/alert"
import { CardHeader } from "../../ui/card"

export function DashboardMinhasProducoes() {

  const { user } = useContext(UserContext)
  return (
    <main className="h-full w-full flex flex-col p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Avatar className="cursor-pointer rounded-lg  h-24 w-24">
            <AvatarImage className={'rounded-md h-24 w-24'} src={`${user?.photo_url}`} />
            <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
          </Avatar>

          <div>
            <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
              Olá, {user?.display_name}
            </p>

            <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
              Dashboard
            </h1>
          </div>
        </div>

        <div>

        </div>
      </div>


      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        <Alert className="bg-eng-blue dark:bg-eng-blue">
          <CardHeader>
            <div className="flex mb-1 gap-3 justify-between">
              <h3 className="font-semibold text-2xl text-white">Índices de produção</h3>

              <div className="flex items-center gap-3">


              </div>
            </div>
          </CardHeader>
        </Alert>

        <div>

        </div>
      </div>
    </main>
  )
}