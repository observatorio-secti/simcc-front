import { useState } from "react";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Button } from "../ui/button";
import { Plus } from "phosphor-react";

import { BookItem } from "./Livro";

type Articles = {
    articles: any[];
    distinct: boolean
    type: string
}

export function BookBlockPopUp(propsGeral: Articles) {
    const [count, setCount] = useState(12)
    return (
        <div>
            <ResponsiveMasonry
                columnsCountBreakPoints={{
                    350: 1,
                    750: 1,
                    900: 2,
                    1200: 2,
                    1700: 3
                }}
            >
                <Masonry gutter="16px">
                    {propsGeral.articles.slice(0, count).map((props: any) => {

                        return (
                            <BookItem
                                id={props.id}
                                title={props.title}
                                year={props.year}
                                isbn={props.isbn}
                                publishing_company={props.publishing_company}
                                type={propsGeral.type}
                                event_name={props.event_name}
                                nature={props.nature}
                                participation={props.participation}
                                grant_date={props.grant_date}
                                financing={props.financing}
                                project_name={props.project_name}
                                oriented={props.oriented}
                                status={props.status}
                                agency_code={props.agency_code}
                                agency_name={props.agency_name}
                                description={props.description}
                                end_year={props.end_year}
                                number_academic_masters={props.number_academic_masters}
                                number_phd={props.number_phd}
                                number_specialists={props.number_specialists}
                                number_undergraduates={props.number_undergraduates}
                                start_year={props.start_year}
                                researcher_id={props.researcher_id}
                                production={props.production}
                                foment={props.foment}
                                components={props.components}
                                authors={props.authors}
                                homepage={props.homepage}
                                language={props.language}
                                means_divulgation={props.means_divulgation}

                                relevance={props.relevance}
                                scientific_divulgation={props.scientific_divulgation}
                                researcher_name={props.researcher_name}
                                title_en={props.title_en}
                                year_={props.year_}
                                has_image={props.has_image}

                                researcher={props.researcher}
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