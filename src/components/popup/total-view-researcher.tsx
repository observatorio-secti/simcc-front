import { Book, Books, Code, Copyright, Quotes, StripeLogo } from "phosphor-react";
import { Alert } from "../ui/alert";

interface Props {
    among: number,
    articles: number,
    book: number,
    book_chapters: number,
    patent: string,
    software: string,
    brand: string,
}

export function TotalViewResearcher(props: Props) {
    return (

        <div className="w-full">
            <div className="text-left font-medium text-2xl mb-6 pr-12">Total de produção científica e técnica</div>
            <div
                className="
                    gap-6 grid grid-cols-2 text-left
                    mb-6
                    md:grid-cols-3
                    
                    xl:grid-cols-2
                "
            >
                <Alert className="flex items-center gap-3">
                    <Quotes size={16} className="" />
                    <div>
                        <p className="font-bold">{props.articles != 0 ? props.articles : "0"} </p><div className="text-sm text-gray-500">Artigos</div>
                    </div>
                </Alert>

                <Alert className="flex items-center gap-3">
                    <Book size={16} className="" />
                    <div>
                        <p className="font-bold">{props.book != 0 ? props.book : "0"} </p><div className="text-sm text-gray-500">Livros</div>
                    </div>
                </Alert>

                <Alert className="flex items-center gap-3">
                    <Books size={16} className="" />
                    <div>
                        <p className="font-bold">{props.book_chapters != 0 ? props.book_chapters : "0"} </p><div className="text-sm text-gray-500">Capítulos</div>
                    </div>
                </Alert>

                <Alert className="flex items-center gap-3">
                    <Copyright size={16} className="" />
                    <div>
                        <p className="font-bold">{Number(props.patent) != 0 ? props.patent : "0"} </p><div className="text-sm text-gray-500">Patentes</div>
                    </div>
                </Alert>

                <Alert className="flex items-center gap-3">
                    <StripeLogo size={16} className="" />
                    <div>
                        <p className="font-bold">{Number(props.brand) != 0 ? props.brand : "0"} </p><div className="text-sm text-gray-500">Marcas</div>
                    </div>
                </Alert>

                <Alert className="flex items-center gap-3">
                    <Code size={16} className="" />
                    <div>
                        <p className="font-bold">{Number(props.software) != 0 ? props.software : "0"} </p><div className="text-sm text-gray-500">Softwares</div>
                    </div>
                </Alert>
            </div>
        </div>

    )
}