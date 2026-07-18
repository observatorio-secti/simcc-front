import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Button } from "../../../ui/button";
import { Plus } from "phosphor-react";
import { BookItem } from "./Livro";

type Articles = {
    articles: any[];
    distinct: boolean;
    type: string;
    onLoadMore: () => void;
    hasMore: boolean;
}

export function BlockItemGeral(propsGeral: Articles) {
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
                    {propsGeral.articles.map((props: any, index: number) => {
                        return (
                            <BookItem
                                key={props.id || index}
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
                                distinct={propsGeral.distinct}
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

            {propsGeral.hasMore && (
                <div className="w-full flex justify-center mt-8">
                    <Button onClick={propsGeral.onLoadMore}>
                        <Plus size={16} />
                        Mostrar mais
                    </Button>
                </div>
            )}
        </div>
    )
}