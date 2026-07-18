import { Alert } from "../../ui/alert";

interface Props {
titulo:string
chidren:any
}

export function AddItem(props:Props) {
    return(
        <Alert className="aspect-square flex flex-col gap-1 items-center justify-center">
            <div>
            {props.chidren}
            </div>
            <p className="text-center">{props.titulo}</p>
        </Alert>
    )
}