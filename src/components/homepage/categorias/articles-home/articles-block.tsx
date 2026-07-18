import { useContext } from "react";
import { useModalSidebar } from "../../../hooks/use-modal-sidebar";
import { UserContext } from "../../../../context/context";
import { ArticleItem } from "./article-item";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Button } from "../../../ui/button";
import { Plus } from "phosphor-react";

type Articles = {
    articles: any[];
    distinct: boolean;
    onLoadMore: () => void;
    hasMore: boolean;
}

export function ArticleBlock(props: Articles) {
    const { navbar, isCollapsed } = useContext(UserContext)
    const { isOpen } = useModalSidebar()

    const breakpoints = {
        350: 1,
        750: 2,
        900: 3,
        1200: 4,
        1700: 5
    };

    return (
        <div>
            <ResponsiveMasonry columnsCountBreakPoints={breakpoints}>
                <Masonry gutter="16px">
                    {props.articles.map((item: any) => (
                        <ArticleItem
                            key={item.id}
                            id={item.id}
                            doi={item.doi}
                            name_periodical={item.name_periodical}
                            qualis={item.qualis}
                            title={item.title.toUpperCase()}
                            year={item.year}
                            color={item.color}
                            researcher={item.researcher}
                            lattes_id={item.lattes_id}
                            magazine={item.magazine}
                            lattes_10_id={item.lattes_10_id}
                            jcr_link={item.jcr_link}
                            jif={item.jif}
                            researcher_id={item.researcher_id}
                            distinct={props.distinct}
                            abstract={item.abstract}
                            article_institution={item.article_institution}
                            authors={item.authors}
                            authors_institution={item.authors_institution}
                            citations_count={item.citations_count}
                            issn={item.issn}
                            keywords={item.keywords}
                            landing_page_url={item.landing_page_url}
                            language={item.language}
                            pdf={item.pdf}
                            has_image={item.has_image}
                            relevance={item.relevance}
                        />
                    ))}
                </Masonry>
            </ResponsiveMasonry>

            {props.hasMore && (
                <div className="w-full flex justify-center mt-8">
                    <Button onClick={props.onLoadMore}>
                        <Plus size={16} />
                        Mostrar mais
                    </Button>
                </div>
            )}
        </div>
    )
}