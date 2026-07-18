import { useContext } from "react";
import { UserContext } from "../../context/context";

interface Props {
    title: string,
    children: any,
    type: string,
    on: boolean,
}

export function CategoriasItemHome(props: Props) {
    const {  setMapModal} = useContext(UserContext)

    return (
        <div onClick={()=> setMapModal(false)} className={`rounded-full px-6 py-2 flex gap-3 transition-all cursor-pointer items-center ${
            (props.on && props.type === 'article') && 'bg-blue-500 dark:bg-blue-500 text-white' ||
            (props.on && props.type === 'abstract') && 'bg-yellow-500 dark:bg-yellow-500 text-white' ||
            (props.on && props.type === 'speaker') && 'bg-orange-500 dark:bg-orange-500 text-white' ||
            (props.on && props.type === 'book') && 'bg-pink-500 dark:bg-pink-500 text-white' ||
            (props.on && props.type === 'patent') && 'bg-cyan-500 dark:bg-cyan-500 text-white' ||
            (props.on && props.type === 'name') && 'bg-red-500 dark:bg-red-500 text-white' ||
            (props.on && props.type === 'area') && 'bg-green-500 dark:bg-green-500 text-white' ||
            (!props.type && 'hover:bg-gray-200 dark:hover:bg-black')
        }`}>
            {props.children}<p className=" dark:text-white text-sm">{props.title}</p>
        </div>
    );
}