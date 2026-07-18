import { useEffect, useState } from "react";

import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Button } from "../ui/button";
import { Plus } from "phosphor-react";

import { ArticleItem } from "../homepage/categorias/articles-home/article-item";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";

type Articles = {
  articles: any[];
  distinct: boolean
  onRefresh?: () => void;
}

export function ArticleBlockPopUp(props: Articles) {

  const [count, setCount] = useState(12)
  const { isOpen, type: typeModal, onClose } = useModalSecundary();

  const [columns, setColumns] = useState<number>(3); // Definindo o valor inicial de colunas

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newColumns = 1; // Valor padrão
      if (width >= 1700) newColumns = 4;
      else if (width >= 1200) newColumns = 3;
      else if (width >= 900) newColumns = 2;
      else if (width >= 750) newColumns = 1;
      else if (width >= 350) newColumns = 1;

      setColumns(newColumns);
    };

    handleResize(); // Iniciar com a largura da janela
    window.addEventListener("resize", handleResize); // Atualizar ao redimensionar

    return () => window.removeEventListener("resize", handleResize); // Limpeza ao desmontar
  }, []);


  useEffect(() => {
    // When the edit modal closes, trigger a refresh if provided
    if (!isOpen && typeModal === "edit-article" && props.onRefresh) {
      props.onRefresh();
    }
  }, [isOpen, typeModal, props.onRefresh]);

  return (
    <div>
      <ResponsiveMasonry
        columnsCountBreakPoints={{
          350: 1,
          750: 1,
          900: 2,
          1200: 3,
          1700: 4
        }}
      >
        <Masonry gutter="16px" className="" columnsCount={columns}>
          {props.articles.slice(0, count).map((props: any) => {

            return (
              <ArticleItem
                key={props.id}
                id={props.id}
                doi={props.doi}
                name_periodical={props.name_periodical}
                qualis={props.qualis}
                title={props.title.toUpperCase()}
                year={props.year}
                color={props.color}
                researcher={props.researcher}
                lattes_id={props.lattes_id}
                magazine={props.magazine}
                lattes_10_id={props.lattes_10_id}
                jcr_link={props.jcr_link}
                jif={props.jif}
                researcher_id={props.researcher_id}
                distinct={props.distinct}
                abstract={props.abstract}
                article_institution={props.article_institution}
                authors={props.authors}
                authors_institution={props.authors_institution}
                citations_count={props.citations_count}
                issn={props.issn}
                keywords={props.keywords}
                landing_page_url={props.landing_page_url}
                language={props.language}
                pdf={props.pdf}
                has_image={props.has_image}
                relevance={props.relevance}
              />
            );
          })}
        </Masonry>
      </ResponsiveMasonry>

      {props.articles.length > count && (
        <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 12)}><Plus size={16} />Mostrar mais</Button></div>
      )}

    </div>
  )
}