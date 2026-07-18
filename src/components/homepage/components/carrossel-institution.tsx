import logo_ufba from '../../../assets/logo_ufba.png';
import logo_ebmsp from '../../../assets/logo_ebmsp.png';
import logo_ebmsp_dark from '../../../assets/logo_ebmsp_dark.png';
import logo_uesb from '../../../assets/logo_uesb.png';
import logo_uesb_dark from '../../../assets/logo_uesb_dark.png';
import logo_ufob from '../../../assets/logo_ufob.png';
import logo_ufob_dark from '../../../assets/logo_ufob_dark.png';
import logo_ufsb from '../../../assets/logo_ufsb.png';
import logo_ufsb_dark from '../../../assets/logo_ufsb_dark.png';
import logo_uefs from '../../../assets/logo_uefs.png';
import logo_uefs_dark from '../../../assets/logo_uefs_dark.png';
import logo_uesc from '../../../assets/logo_uesc.png';
import logo_ufrb20 from '../../../assets/logo_ufrb-20.png';
import logo_ufrb20_dark from '../../../assets/logo_ufrb-20_dark.png';
import logo_uneb from '../../../assets/logo_uneb.png';
import logo_ifba from '../../../assets/logo_ifba.png';
import logo_uneb_dark from '../../../assets/logo_uneb_dark.png';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../ui/carousel';
import { useRef, useState, useEffect, useContext } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../context/context';

const logoMap = {
    "EBMSP": { light: logo_ebmsp, dark: logo_ebmsp_dark },
    "UESB": { light: logo_uesb, dark: logo_uesb_dark },
    "UFOB": { light: logo_ufob, dark: logo_ufob_dark },
    "UFSB": { light: logo_ufsb, dark: logo_ufsb_dark },
    "UEFS": { light: logo_uefs, dark: logo_uefs_dark },
    "UESC": { light: logo_uesc, dark: logo_uesc },
    "UFRB": { light: logo_ufrb20, dark: logo_ufrb20_dark },
    "UNEB": { light: logo_uneb, dark: logo_uneb_dark },
};

const extractInstitutionAcronym = (institutionName: string): string => {
    const match = institutionName.match(/^([A-Z]{2,6})\s*[-–]\s*/);
    if (match) {
        return match[1];
    }

    const acronymMatch = institutionName.match(/^([A-Z]+)/);
    return acronymMatch ? acronymMatch[1] : institutionName.substring(0, 5).toUpperCase();
};


const instituicoesFallback = [
    {
        name: "UFBA",
        institution: "UFBA - Universidade Federal da Bahia",
        id: "153f05ef-01a1-4198-9f1b-88d3e9442386",
        img: logo_ufba,
        imgDark: logo_ufba,
    },
    {
        name: "EBMSP",
        institution: "EBMSP - Escola Bahiana de Medicina e Saúde Pública",
        id: "4163cc61-19ca-40fa-9378-4c09571a7d97",
        img: logo_ebmsp,
        imgDark: logo_ebmsp_dark,
    },
    {
        name: "UESB",
        institution: "UESB - Universidade Estadual do Sudoeste da Bahia",
        id: "78faa085-6c1a-41ec-9bc1-403604db9378",
        img: logo_uesb,
        imgDark: logo_uesb_dark,
    },
    {
        name: "UFOB",
        institution: "UFOB - Universidade Federal do Oeste da Bahia",
        id: "4f124839-5c11-4dcc-95db-65763202da82",
        img: logo_ufob,
        imgDark: logo_ufob_dark,
    },
    {
        name: "UFSB",
        institution: "UFSB - Universidade Federal do Sul da Bahia",
        id: "962f06a8-8fe9-4d10-a83a-a0368edd49fa",
        img: logo_ufsb,
        imgDark: logo_ufsb_dark,
    },
    {
        name: "UEFS",
        institution: "UEFS - Universidade Estadual de Feira de Santana",
        id: "b38787cc-01de-4b18-986a-f6973d4780e3",
        img: logo_uefs,
        imgDark: logo_uefs_dark,
    },
    {
        name: "UESC",
        institution: "UESC - Universidade Estadual de Santa Cruz",
        id: "4a94e51e-49f9-42a8-a5d0-9d2c2e26b250",
        img: logo_uesc,
        imgDark: logo_uesc,
    },
    {
        name: "UFRB",
        institution: "UFRB - Universidade Federal do Recôncavo da Bahia",
        id: "44a649ac-c91c-47a8-bc75-0464d9fd9021",
        img: logo_ufrb20,
        imgDark: logo_ufrb20_dark,
    },
    {
        name: "UNEB",
        institution: "UNEB - Universidade do Estado da Bahia",
        id: "df0e65ee-ea58-48cb-b8c0-1ddb51af3576",
        img: logo_uneb,
        imgDark: logo_uneb_dark,
    },
    {
        name: "IFBA",
        institution: "IFBA - Instituto Federal da Bahia",
        id: "003f6522-93fe-495c-a681-4768435d9e88",
        img: logo_ifba,
        imgDark: logo_ifba,
    },
];

export function CarrosselInstitution() {
    const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
    const { theme } = useTheme();
    const { urlGeral } = useContext(UserContext);

    const [instituicoes, setInstituicoes] = useState(instituicoesFallback);
    const [loading, setLoading] = useState(false);

    return (
        <div className='flex mb-8 md:m-0'>
            <Carousel
                plugins={[plugin.current]}
                className="w-full flex items-center gap-4"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
                opts={{ align: "start", loop: true }}
            >
                <div>
                    <CarouselPrevious />
                </div>

                <CarouselContent className="gap-3">
                    {instituicoes.map((inst, index) => (
                        <CarouselItem
                            key={index}
                            className="!basis-auto shrink-0 grow-0 w-auto px-2"
                        >
                            <Link to={`/instituicao?institution_id=${inst.id}`}>
                                <img
                                    src={theme === "dark" ? inst.imgDark : inst.img}
                                    alt={`Logo ${inst.name}`}
                                    className="h-16 w-auto object-contain hover:scale-105 transition-transform cursor-pointer"
                                    title={inst.institution}
                                />
                            </Link>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                <div>
                    <CarouselNext />
                </div>
            </Carousel>
        </div>
    );
}
