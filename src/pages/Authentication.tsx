

import { useLocation } from "react-router-dom";
import { SignUpContent } from "../components/authentication/signUp";
import { SignInContent } from "../components/authentication/signIn";
import { MinhaUfmg } from "../components/authentication/minhaUFMG";
import { Password } from "../components/authentication/Password";
import { UpdatePassword } from "../components/authentication/UpdatePassword";
import { Toaster } from "sonner";

export function Authentication() {
    const location = useLocation();

    return(
        <>
        {location.pathname === '/signIn' && (<SignInContent/>)}
        {location.pathname === '/signUp' && (<SignUpContent/>)}
        
        {location.pathname === '/recoverPassword' && (<Password/>)}
        {location.pathname === '/updatePassword' && (<UpdatePassword/>)}
        {location.pathname === '/ufmg/' && (<MinhaUfmg/>)}

        <Toaster/>
        </>
    )
}