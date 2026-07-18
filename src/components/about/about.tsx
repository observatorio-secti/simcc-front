import { Instrucoes } from "../homepage/components/instrucoes";
import { Newsletter } from "../homepage/components/newsletter";
import { HomeAbout } from "./home-about";

export function About() {
    return(
        <main>
            <HomeAbout/>

            <div className="px-8 xl:px-40">
            <Instrucoes/>
            </div>


            <Newsletter/>
        </main>
    )
}