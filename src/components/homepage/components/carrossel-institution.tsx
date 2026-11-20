import logo_ufba from '../../../assets/logo_ufba.png';
import logo_ufba_dark from '../../../assets/logo_ufba_dark.png';
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
import logo_uneb_dark from '../../../assets/logo_uneb_dark.png';
import logo_ifba from '../../../assets/logo_ifba.png';
import logo_fiocruz from '../../../assets/logo_fiocruz.png';
import logo_fiocruz_dark from '../../../assets/logo_fiocruz_dark.png';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../ui/carousel';
import { useRef, useState, useContext } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../context/context';

const extractInstitutionAcronym = (institutionName: string): string => {
  const match = institutionName.match(/^([A-Z]{2,6})\s*[-–]\s*/);
  if (match) {
    return match[1];
  }

  const acronymMatch = institutionName.match(/^([A-Z]+)/);
  return acronymMatch
    ? acronymMatch[1]
    : institutionName.substring(0, 5).toUpperCase();
};

const instituicoesFallback = [
  {
    name: 'UFBA',
    institution: 'UFBA - Universidade Federal da Bahia',
    id: 'f1ac00a8-15d9-4306-a893-c611636601d6',
    img: logo_ufba,
    imgDark: logo_ufba_dark,
  },
  {
    name: 'EBMSP',
    institution: 'EBMSP - Escola Bahiana de Medicina e Saúde Pública',
    id: 'dc6b3b63-2ada-49cb-bbca-f888ff31d56b',
    img: logo_ebmsp,
    imgDark: logo_ebmsp_dark,
  },
  {
    name: 'UESB',
    institution: 'UESB - Universidade Estadual do Sudoeste da Bahia',
    id: '36422e54-342b-4a4d-9879-edac6235343d',
    img: logo_uesb,
    imgDark: logo_uesb_dark,
  },
  {
    name: 'UFOB',
    institution: 'UFOB - Universidade Federal do Oeste da Bahia',
    id: 'ecafd569-d31f-429b-ba33-26780f46b990',
    img: logo_ufob,
    imgDark: logo_ufob_dark,
  },
  {
    name: 'UFSB',
    institution: 'UFSB - Universidade Federal do Sul da Bahia',
    id: '3c0594c8-ffbe-43e2-901a-b109e2e99985',
    img: logo_ufsb,
    imgDark: logo_ufsb_dark,
  },
  {
    name: 'UEFS',
    institution: 'UEFS - Universidade Estadual de Feira de Santana',
    id: 'd752090d-8ecf-458f-a9fb-3e7b3659a9f0',
    img: logo_uefs,
    imgDark: logo_uefs_dark,
  },
  {
    name: 'UESC',
    institution: 'UESC - Universidade Estadual de Santa Cruz',
    id: 'f670bac4-e1ab-452c-af25-300e994759c3',
    img: logo_uesc,
    imgDark: logo_uesc,
  },
  {
    name: 'UFRB',
    institution: 'UFRB - Universidade Federal do Recôncavo da Bahia',
    id: '73cdfd5f-e313-42c9-a90d-38ed38260d48',
    img: logo_ufrb20,
    imgDark: logo_ufrb20_dark,
  },
  {
    name: 'UNEB',
    institution: 'UNEB - Universidade do Estado da Bahia',
    id: '815f5ab1-3340-45b0-97d1-c16f93909caa',
    img: logo_uneb,
    imgDark: logo_uneb_dark,
  },
  {
    name: 'IFBA',
    institution: 'IFBA - Instituto Federal da Bahia',
    id: 'f1e4790b-5053-4aa2-89f4-37c2978d4086',
    img: logo_ifba,
    imgDark: logo_ifba,
  },
  {
    name: 'Fundação Oswaldo Cruz',
    institution: 'FIOCRUZ - Fundação Oswaldo Cruz',
    id: 'd18e767a-72d4-43a9-beef-8999feb57266',
    img: logo_fiocruz,
    imgDark: logo_fiocruz_dark,
  },
];

export const TotalInstitutions = instituicoesFallback.length;

export function CarrosselInstitution() {
  const plugin = useRef(Autoplay({ delay: 2000, stopOnInteraction: true }));
  const { theme } = useTheme();
  const { urlGeral } = useContext(UserContext);

  const [instituicoes, setInstituicoes] = useState(instituicoesFallback);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex mb-8 md:m-0">
      <Carousel
        plugins={[plugin.current]}
        className="w-full flex items-center gap-4"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{ align: 'start', loop: true }}
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
              <Link to={`/instituicao/${encodeURIComponent(inst.name || inst.id)}`}>
                <img
                  src={theme === 'dark' ? inst.imgDark : inst.img}
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
