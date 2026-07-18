"use client"

interface Props {
    meta:string
    title:string
    description:string
    image:string
    orientation: "right" | "left"
}


export function SectionHome(props:Props) {
    return(
        <div className={`flex flex-col md:flex-row gap-8 md:gap-16 mt-8 md:mt-16 min-h-[50vh] ${props.orientation == "right"? ('flex-col md:flex-row '):('flex-col-reverse md:flex-row-reverse ')}`}>
        <div className="flex flex-col gap-3 w-full md:w-1/2  justify-center">
        <p className="text-eng-blue font-medium text-sm">{props.meta}</p>
            <h2 className="mb-4 font-medium text-4xl">{props.title}</h2>
            <p className="text-gray-500 max-w-[450px]">{props.description}</p>
        </div>

        <div className=" w-full md:w-1/2 bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(${props.image})` }} >

        </div>
    </div>
    )
}