import { Link } from "react-router-dom";
import * as React from "react"
import logo_5 from '../../assets/logo_cimatec.svg';
import { Accessibility } from "lucide-react";
import { Separator } from "../ui/separator";

export function Header() {
    // ==========================================
    // LÓGICA DE ACESSIBILIDADE (Fonte e Tamanho)
    // ==========================================
    const [fontScale, setFontScale] = React.useState(100);

    React.useEffect(() => {
        const savedScale = localStorage.getItem('fontScale');
        if (savedScale) {
            const scale = parseInt(savedScale);
            setFontScale(scale);
            document.documentElement.style.fontSize = `${scale}%`;
        }
    }, []);

    const handleIncreaseFont = () => {
        setFontScale(prev => {
            const newScale = Math.min(prev + 10, 130);
            document.documentElement.style.fontSize = `${newScale}%`;
            localStorage.setItem('fontScale', newScale.toString());
            return newScale;
        });
    };

    const handleDecreaseFont = () => {
        setFontScale(prev => {
            const newScale = Math.max(prev - 10, 80);
            document.documentElement.style.fontSize = `${newScale}%`;
            localStorage.setItem('fontScale', newScale.toString());
            return newScale;
        });
    };

    const handleResetFont = () => {
        setFontScale(100);
        document.documentElement.style.fontSize = '100%';
        localStorage.setItem('fontScale', '100');
    };

    return (
        <div className="top-0 w-full border-b border-neutral-200">
            <header className="h-[40px] px-4 md:mb-2 flex bg-neutral-50 md:bg-white gap-2 items-center w-full relative">
                <div className="flex w-full md:gap-3 gap-1 items-center h-full">
                    
                    <div className="min-w-max">
                        <Link to={"https://www.ba.gov.br/secti/"} target="_blank" className="whitespace-nowrap ">
                            <img
                                src={logo_5}
                                alt="Logo Secti"
                                className="whitespace-nowrap flex flex-1 h-[50px]"
                            />
                        </Link>
                    </div>

                    <Separator orientation="vertical" className="mx-2 md:mx-0 h-6 bg-slate-300" />

                    {/* MENU DE ACESSIBILIDADE FUNCIONAL */}
                    <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-600 uppercase tracking-wider min-w-max">
                        <div className="flex items-center gap-1.5 cursor-default">
                            <Accessibility size={14} className="text-blue-800" />
                            <span>Acessibilidade</span>
                        </div>

                        <div className="flex items-center gap-2.5 mx-1">
                            <button onClick={handleIncreaseFont} className="hover:text-blue-700 transition-colors" title="Aumentar texto">A+</button>
                            <button onClick={handleResetFont} className="hover:text-blue-700 transition-colors" title="Texto original">A</button>
                            <button onClick={handleDecreaseFont} className="hover:text-blue-700 transition-colors" title="Diminuir texto">A-</button>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}