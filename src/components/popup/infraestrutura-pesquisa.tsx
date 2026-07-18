

import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { Link } from "react-router-dom";
import { Alert } from "../ui/alert";
import { Building2, FlaskConical, Map, MapPin } from "lucide-react";

interface Props {
    lattes_id: string
}

interface Item {
    id: string
    hashed_id: string
    type: string
    location: string
    name: string
    description: string
    website: string
    activities: string
    areas: string
    campus: string
    institution_id: string
    researcher_id: string
    responsible: string
}

export function InfraestruturaPesquisa(props: Props) {
    const normalizeArea = (area: string): string => {
        return area
            .toUpperCase();
    };

    const [item, setItem] = useState<Item[]>([]);
    const { urlGeral } = useContext(UserContext)

    let url = urlGeral + `labs?lattes_id=${props.lattes_id}`;

    useEffect(() => {
        const fetchData = async () => {

            try {
                const response = await fetch(url, {
                    mode: 'cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Max-Age': '3600',
                        'Content-Type': 'application/json',
                    }
                });
                const data = await response.json();
                if (data) {
                    setItem(data)
                }
            } catch (err) {
                console.log(err);
            } finally {

            }
        };
        fetchData();
    }, [url]);

    if (item.length > 0) {
        return (
            <div>
                <div className="font-medium text-2xl mb-6 ">
                    Infraestrutura de pesquisa
                </div>

                <div className="flex flex-col mb-6 gap-6">
                    {item.slice(0, 5).map((props) => (
                        <Link to={props.website.startsWith("http") ? `${props.website}` : `https://${props.website}`} target="_blank" className="w-full">
                            <div className="flex ">
                                <div className={`w-2 min-w-2 rounded-l-md bg-eng-blue dark:border-neutral-800 border  border-neutral-200 border-r-0  min-h-full relative`}></div>

                                <Alert className="flex justify-center flex-col  rounded-l-none gap-2 ">
                                    <div className="flex flex-col flex-1 justify-center h-full">
                                        <div className="text-xs text-gray-500 mb-2 flex items-center gap-2 justify-between">
                                            <p className="truncate">{props.areas}</p>

                                            <FlaskConical size={14} />
                                        </div>
                                        <p className="font-medium">{props.name}</p>
                                    </div>

                                    <div className="flex gap-1 mt-1 flex-col">
                                        <div className="text-gray-500 text-sm flex gap-1 items-start">
                                            <Building2 size={12} className="flex-shrink-0 mt-1" />
                                            <div className="flex-1 min-w-0">
                                                <p title={props.activities} className="truncate">{props.activities}</p>
                                            </div>
                                        </div>

                                        <div className="text-gray-500 text-sm flex gap-1 items-center">
                                            <Map size={12} className="flex-shrink-0" />
                                            <div className=" gap-1 items-center flex truncate" ><p title={props.campus}>{props.campus}</p> </div>
                                        </div>

                                        <div className="text-gray-500 text-sm flex gap-1 items-center">
                                            <MapPin size={12} className="flex-shrink-0" />
                                            <div className=" gap-1 items-center flex truncate" ><p className="truncate" title={props.location}> {props.location}</p></div>
                                        </div>
                                    </div>
                                </Alert>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )
    }
}