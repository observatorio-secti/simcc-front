import { Laptop } from "phosphor-react";
import { Link } from "react-router-dom";
import bg_popup from '../assets/bg_home.png';
import { LogoConecteeWhite } from "./svg/LogoConecteeWhite";
import { LogoIaposWhite } from "./svg/LogoIaposWhite";
import { LogoIapos } from "./svg/LogoIapos";
import { LogoConectee } from "./svg/LogoConectee";
import { useContext } from "react";
import { UserContext } from "../context/context";
import { useTheme } from "next-themes";

export function Mobile() {
     const {version} = useContext(UserContext)
      const { theme } = useTheme()

    return(
        <div style={{ backgroundImage: `url(${bg_popup})` }} className="h-screen  z-[999999999999999999999999999] sm:hidden fixed top-0 left-0  bg-cover bg-no-repeat bg-center w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900">
               <Link to={'/'} className='h-10 mb-24 absolute top-16 '>
                                               {version ? (
                                                 theme == 'dark' ? (<LogoConecteeWhite/>):(<LogoConectee/>)
                                               ):(
                                                theme == 'dark' ? (<LogoIaposWhite/>):(<LogoIapos/>)
                                               )}
                                            </Link>
                    <div className="w-full flex flex-col items-center justify-center">
                    <p className="text-9xl text-[#719CB8] font-bold mb-16 animate-pulse">{`;[`}</p>
                    <h1 className=" text-2xl text-neutral-400 font-medium leading-tight text-center px-8 tracking-tighter lg:leading-[1.1] ">Página indisponível para o mobile, acesse por outro meio.</h1>
                           
                         
            
                          </div>
        </div>

    )
}