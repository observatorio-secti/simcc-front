import { Link } from 'react-router-dom';
import { File, Info } from 'lucide-react';

export function FooterHome() {
    return (
        <div className="w-full mb-8">
            <div className="w-full bg-blue-900 rounded-xl overflow-hidden shadow-lg border-t-4 border-red-600 flex flex-col md:flex-row">
                
                {/* Lado Esquerdo - "Logo" em formato de texto */}
                <div className="md:w-1/3 bg-blue-800 p-8 flex items-center justify-center min-h-[250px]">
                    <div className="flex justify-center hover:scale-105 transition-transform duration-300">
                        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest drop-shadow-md text-center">
                            Observatório
                        </h2>
                    </div>
                </div>

                {/* Lado Direito - Sobre o Observatório e Links */}
                <div className="md:w-2/3 p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-white mb-4">
                        Sobre o Observatório
                    </h3>
                    
                    <p className="text-blue-50 text-sm leading-relaxed text-justify mb-8 opacity-90">
                        O Observatório da Ciência da Bahia integra sistemas e painéis temáticos 
                        que apresentam informações sobre produção científica, laboratórios e 
                        equipamentos, pós-graduação, grupos de pesquisa, INCITEs, inovação 
                        tecnológica, clubes de ciência e iniciativas de popularização científica.
                    </p>

                    {/* Rodapé Interno com Links Úteis */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-6 mt-auto pt-6 border-t border-blue-700">
                        
                        {/* Links de Informações e Termos */}
                        <div className="flex items-center gap-6 text-sm font-medium">
                            <Link to={'/informacoes'} className="text-blue-100 hover:text-white flex items-center gap-2 transition-colors">
                                <Info size={16} className="text-red-400" /> Informações
                            </Link>
                            <Link to={'/termos-uso'} className="text-blue-100 hover:text-white flex items-center gap-2 transition-colors">
                                <File size={16} className="text-red-400" /> Termos de Uso
                            </Link>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    );
}