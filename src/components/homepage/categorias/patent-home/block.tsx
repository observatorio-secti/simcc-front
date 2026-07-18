import { useState } from "react";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Button } from "../../../ui/button";
import { Plus } from "phosphor-react";
import { BookItemGeral } from "../book-home/book-item";



type Articles = {
    articles: any[];
    distinct: boolean
    type: string
}




export function BlockItem(propsGeral: Articles) {

    const [count, setCount] = useState(12)



    return (
        <div>
            <ResponsiveMasonry
                columnsCountBreakPoints={{
                    350: 1,
                    750: 2,
                    900: 3,
                    1200: 3,
                    1700: 4
                }}
            >
                <Masonry gutter="16px">
                    {propsGeral.articles.slice(0, count).map((props: any) => {

                        return (
                            <BookItemGeral
                                id={props.id}
                                title={props.title}
                                year={props.year}
                                isbn={props.isbn}
                                publishing_company={props.publishing_company}
                                name={props.name}

                                type={propsGeral.type}

                                event_name={props.event_name}

                                nature={props.nature}
                                participation={props.participation}




                                grant_date={props.grant_date}

                                financing={props.financing}
                                project_name={props.project_name}


                                oriented={props.oriented}
                                status={props.status}

                            />
                        );
                    })}
                </Masonry>
            </ResponsiveMasonry>

            {propsGeral.articles.length > count && (
                <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 12)}><Plus size={16} />Mostrar mais</Button></div>
            )}

        </div>
    )
}