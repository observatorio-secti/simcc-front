import { formatRgb, formatHsl, formatHex, formatOklch, parse } from "culori";
import { useState } from "react";
import { Alert } from "../ui/alert";
import { ChevronDown, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

export function Colors() {
    const colors = [
        { name: "Qualis A1", color: "#34663C" },
        { name: "Qualis A2", color: "#9DC356" },
        { name: "Qualis A3", color: "#B1C38A" },
        { name: "Qualis A4", color: "#BEC4B3" },
        { name: "Qualis B1", color: "#D56438" },
        { name: "Qualis B2", color: "#DD883D" },
        { name: "Qualis B3", color: "#E3B081" },
        { name: "Qualis B4", color: "#E3AC96" },
        { name: "Qualis C", color: "#CE3830" },
        { name: "Qualis SQ", color: "#4A1314" },
        { name: "Artigos", color: "#5F82ED" },
        { name: "Livros e Capítulos", color: "#D15697" },
        { name: "Livros", color: "#792F4C" },
        { name: "Capítulos", color: "#DBAFD0" },
        { name: "Patentes", color: "#66B4D0" },
        { name: "Softwares", color: "#096670" },
        { name: "Marcas", color: "#1B1464" },
        { name: "Área", color: "#6BC26B" },
        { name: "Nome", color: "#D2524C" },
        { name: "Participação em evento", color: "#DE7A36" },
        { name: "Congresso", color: "#FF5800" },
        { name: "Encontro", color: "#E9A700" },
        { name: "Outra", color: "#7F400B" },
        { name: "Seminário", color: "#FFBD7B" },
        { name: "Simpósio", color: "#D53A2C" },
        { name: "Oficina", color: "#FCEE21" },
        { name: "Relatório Técnico", color: "#662D91" },
        { name: "Concluída", color: "#6BC26B" },
        { name: "Em andamento", color: "#DBB540" },
        { name: "Feminino", color: "#D15697" },
        { name: "Masculino", color: "#5F82ED" },
        { name: "GET", color: "#DBB540" },
        { name: "POST", color: "#CE3830" },
        { name: "PQ", color: "#00D000" },
        { name: "DT", color: "#183EFF" },
        { name: "Cor 1", color: "#213E59" },
        { name: "Cor 2", color: "#354E68" },
        { name: "Cor 3", color: "#485F78" },
        { name: "Cor 4", color: "#5C7188" },
        { name: "Cor 5", color: "#6F8399" },
        { name: "Cor 6", color: "#98A8BA" },
        { name: "Iniciação científica", color: "#8BFBD3" },
        { name: "Dissertação De Mestrado", color: "#67A896" },
        { name: "Tese de Doutorado", color: "#425450" },
        { name: "Trabalho de Conclusao de Curso Graduação", color: "#77D2B6" },
        { name: "Orientacao-De-Outra-Natureza", color: "#577E74" },
        {
          name: "Monografia de Conclusao de Curso Aperfeicoamento e Especializacao",
          color: "#2F7F7C",
        },
        { name: "Supervisão de Pós-Doutorado", color: "#46724B" },
    
        // Adicionando as áreas acadêmicas com suas respectivas cores
        { name: "ASTRONOMIA", color: "bg-red-200" },
        { name: "FÍSICA", color: "bg-blue-200" },
        { name: "GEOCIÊNCIAS", color: "bg-green-200" },
        { name: "MATEMÁTICA", color: "bg-yellow-200" },
        { name: "OCEANOGRAFIA", color: "bg-teal-200" },
        { name: "PROBABILIDADE E ESTATÍSTICA", color: "bg-purple-200" },
        { name: "QUÍMICA", color: "bg-orange-200" },
        { name: "AGRONOMIA", color: "bg-red-800" },
        { name: "CIÊNCIA E TECNOLOGIA DE ALIMENTOS", color: "bg-blue-800" },
        { name: "ENGENHARIA AGRÍCOLA", color: "bg-green-800" },
        { name: "MEDICINA VETERINÁRIA", color: "bg-yellow-800" },
        {
          name: "RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL",
          color: "bg-teal-800",
        },
        {
          name: "RECURSOS PESQUEIROS E ENGENHARIA DE PESCA",
          color: "bg-purple-800",
        },
        { name: "ZOOTECNIA", color: "bg-orange-800" },
        { name: "BIOFÍSICA", color: "bg-red-600" },
        { name: "BIOLOGIA GERAL", color: "bg-blue-600" },
        { name: "BIOQUÍMICA", color: "bg-green-600" },
        { name: "BIOTECNOLOGIA", color: "bg-yellow-600" },
        { name: "BOTÂNICA", color: "bg-teal-600" },
        { name: "ECOLOGIA", color: "bg-purple-600" },
        { name: "FARMACOLOGIA", color: "bg-orange-600" },
        { name: "FISIOLOGIA", color: "bg-red-400" },
        { name: "GENÉTICA", color: "bg-blue-400" },
        { name: "IMUNOLOGIA", color: "bg-green-400" },
        { name: "MICROBIOLOGIA", color: "bg-yellow-400" },
        { name: "MORFOLOGIA", color: "bg-teal-400" },
        { name: "PARASITOLOGIA", color: "bg-purple-400" },
        { name: "ZOOLOGIA", color: "bg-orange-400" },
        { name: "EDUCAÇÃO FÍSICA", color: "bg-red-300" },
        { name: "ENFERMAGEM", color: "bg-blue-300" },
        { name: "FARMÁCIA", color: "bg-green-300" },
        { name: "FISIOTERAPIA E TERAPIA OCUPACIONAL", color: "bg-yellow-300" },
        { name: "FONOAUDIOLOGIA", color: "bg-teal-300" },
        { name: "MEDICINA", color: "bg-purple-300" },
        { name: "NUTRIÇÃO", color: "bg-orange-300" },
        { name: "ODONTOLOGIA", color: "bg-red-100" },
        { name: "SAÚDE COLETIVA", color: "bg-blue-100" },
        { name: "ANTROPOLOGIA", color: "bg-green-100" },
        { name: "ARQUEOLOGIA", color: "bg-yellow-100" },
        { name: "CIÊNCIA POLÍTICA", color: "bg-teal-100" },
        { name: "EDUCAÇÃO", color: "bg-purple-100" },
        { name: "FILOSOFIA", color: "bg-orange-100" },
        { name: "GEOGRAFIA", color: "bg-red-900" },
        { name: "HISTÓRIA", color: "bg-blue-900" },
        { name: "PSICOLOGIA", color: "bg-green-900" },
        { name: "SOCIOLOGIA", color: "bg-yellow-900" },
        { name: "TEOLOGIA", color: "bg-teal-900" },
        { name: "CIÊNCIA DA COMPUTAÇÃO", color: "bg-purple-900" },
        { name: "DESENHO INDUSTRIAL", color: "bg-orange-900" },
        { name: "ENGENHARIA AEROESPACIAL", color: "bg-red-500" },
        { name: "ENGENHARIA BIOMÉDICA", color: "bg-blue-500" },
        { name: "ENGENHARIA CIVIL", color: "bg-green-500" },
        { name: "ENGENHARIA DE ENERGIA", color: "bg-yellow-500" },
        { name: "ENGENHARIA DE MATERIAIS E METALÚRGICA", color: "bg-teal-500" },
        { name: "ENGENHARIA DE MINAS", color: "bg-purple-500" },
        { name: "ENGENHARIA DE PRODUÇÃO", color: "bg-orange-500" },
        { name: "ENGENHARIA DE TRANSPORTES", color: "bg-red-700" },
        { name: "ENGENHARIA ELÉTRICA", color: "bg-blue-700" },
        { name: "ENGENHARIA MECÂNICA", color: "bg-green-700" },
        { name: "ENGENHARIA NAVAL E OCEÂNICA", color: "bg-yellow-700" },
        { name: "ENGENHARIA NUCLEAR", color: "bg-teal-700" },
        { name: "ENGENHARIA QUÍMICA", color: "bg-purple-700" },
        { name: "ENGENHARIA SANITÁRIA", color: "bg-orange-700" },
        { name: "ARTES", color: "bg-red-50" },
        { name: "LETRAS", color: "bg-blue-50" },
        { name: "LINGÜÍSTICA", color: "bg-green-50" },
        { name: "BIOÉTICA", color: "bg-yellow-50" },
        { name: "CIÊNCIAS AMBIENTAIS", color: "bg-teal-50" },
        { name: "DEFESA", color: "bg-purple-50" },
        { name: "DIVULGAÇÃO CIENTÍFICA", color: "bg-orange-50" },
        { name: "MICROELETRÔNICA", color: "bg-red-700" },
        { name: "ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO", color: "bg-blue-700" },
        { name: "SEGURANÇA CONTRA INCÊNDIO", color: "bg-green-700" },
        { name: "ADMINISTRAÇÃO", color: "bg-yellow-700" },
        { name: "ARQUITETURA E URBANISMO", color: "bg-teal-700" },
        { name: "CIÊNCIA DA INFORMAÇÃO", color: "bg-purple-700" },
        { name: "COMUNICAÇÃO", color: "bg-orange-700" },
        { name: "DEMOGRAFIA", color: "bg-red-100" },
        { name: "DIREITO", color: "bg-blue-100" },
        { name: "ECONOMIA", color: "bg-green-100" },
        { name: "ECONOMIA DOMÉSTICA", color: "bg-yellow-100" },
        { name: "MUSEOLOGIA", color: "bg-teal-100" },
        { name: "PLANEJAMENTO URBANO E REGIONAL", color: "bg-purple-100" },
        { name: "SERVIÇO SOCIAL", color: "bg-orange-100" },
        { name: "TURISMO", color: "bg-red-200" },
      ];
    
      const groupColorsByCategory = (colors) => {
        return { 'Todas as cores': colors };
      };
    
      const Box = ({ color }: { color: string }) => {
        const isHexColor = color.includes("#");
        const isBgClass = color.startsWith("bg-");
    
        let boxStyle = {};
        if (isHexColor) {
          boxStyle = { backgroundColor: color };
        } else if (isBgClass) {
          const oklch = tailwindColors[color];
          if (oklch) {
            boxStyle = { backgroundColor: oklchToRgb(oklch) }; // Converte para RGB para exibição
          }
        }
    
        return (
          <div
            className={`w-24 h-24 rounded-md flex-shrink-0 ${
              isBgClass ? color : ""
            }`}
            style={isHexColor || isBgClass ? boxStyle : {}}
          ></div>
        );
      };
    
      // Função para converter cores
      const convertColor = (color: string, format: string): string => {
        if (color.startsWith("bg-")) {
          // Encontra o valor oklch correspondente à classe bg-*
          const oklch = tailwindColors[color];
          if (!oklch) return color; // Retorna a cor original se não encontrada
    
          switch (format) {
            case "hex":
              return oklchToHex(oklch);
            case "rgb":
              return oklchToRgb(oklch);
            case "hsl":
              return oklchToHsl(oklch);
            case "className":
              return color; // Retorna a classe original
            default:
              return oklch.replace("deg", ""); // Remove "deg" do valor oklch
          }
        }
    
        // Para cores hexadecimais
        if (color.includes("#")) {
          const [r, g, b] = hexToRgb(color); // Converte HEX para RGB
          const oklch = rgbToOklch(r, g, b); // Converte RGB para OKLCH
    
          switch (format) {
            case "hex":
              return color;
            case "rgb":
              return `rgb(${r}, ${g}, ${b})`; // Formato RGB
            case "hsl": {
              const hsl = rgbToHsl(r, g, b);
              return `hsl(${hsl[0]} ${hsl[1]}% ${hsl[2]}%)`;
            }
            case "oklch": {
              return `oklch(${oklch[0]}% ${oklch[1]} ${oklch[2]})`; // Remove "deg" do valor OKLCH
            }
            case "className":
              return `bg-[${color}]`;
            default:
              return color;
          }
        }
    
        // Caso padrão: retorna a cor original
        return color;
      };
    
      // Função auxiliar para converter HEX para RGB
      const hexToRgb = (hex: string): [number, number, number] => {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
      };
    
      // Função auxiliar para converter RGB para HSL
      const rgbToHsl = (
        r: number,
        g: number,
        b: number
      ): [number, number, number] => {
        r /= 255;
        g /= 255;
        b /= 255;
    
        const max = Math.max(r, g, b),
          min = Math.min(r, g, b);
        let h = 0,
          s = 0;
        const l = (max + min) / 2;
    
        if (max !== min) {
          const d = max - min;
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          switch (max) {
            case r:
              h = (g - b) / d + (g < b ? 6 : 0);
              break;
            case g:
              h = (b - r) / d + 2;
              break;
            case b:
              h = (r - g) / d + 4;
              break;
          }
          h /= 6;
        }
    
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
      };
    
      // Função auxiliar para converter RGB para OKLCH
      const rgbToOklch = (
        r: number,
        g: number,
        b: number
      ): [number, number, number] => {
        // Converte RGB sRGB para linear RGB
        const toLinear = (c: number) =>
          c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    
        const linearR = toLinear(r / 255);
        const linearG = toLinear(g / 255);
        const linearB = toLinear(b / 255);
    
        // Converte RGB linear para XYZ
        const x = 0.4124564 * linearR + 0.3575761 * linearG + 0.1804375 * linearB;
        const y = 0.2126729 * linearR + 0.7151522 * linearG + 0.072175 * linearB;
        const z = 0.0193339 * linearR + 0.119192 * linearG + 0.9503041 * linearB;
    
        // Converte XYZ para OKLAB
        const l_ = 0.818933 * x + 0.361866 * y - 0.128859 * z;
        const m_ = 0.032984 * x + 0.929311 * y + 0.036145 * z;
        const s_ = 0.0482 * x + 0.264366 * y + 0.633851 * z;
    
        const l = Math.cbrt(l_);
        const m = Math.cbrt(m_);
        const s = Math.cbrt(s_);
    
        const L = 0.210454 * l + 0.793617 * m - 0.004072 * s;
        const a_ = 1.977998 * l - 2.428592 * m + 0.450593 * s;
        const b_ = 0.025904 * l + 0.782771 * m - 0.808675 * s;
    
        // Converte OKLAB para OKLCH
        const C = Math.sqrt(a_ * a_ + b_ * b_);
        const H = (Math.atan2(b_, a_) * 180) / Math.PI;
        const H_fixed = H < 0 ? H + 360 : H; // Garante que o ângulo seja positivo
    
        // Formata valores
        const format = (num: number, decimals: number) =>
          Math.round(num * 10 ** decimals) / 10 ** decimals;
    
        return [format(L * 100, 2), format(C, 4), format(H_fixed, 2)];
      };
    
      const oklchToRgb = (oklch: string): string => {
        const color = parse(oklch); // Converte oklch para um objeto de cor
        return formatRgb(color); // Formata como RGB
      };
    
      const oklchToHex = (oklch: string): string => {
        const color = parse(oklch); // Converte oklch para um objeto de cor
        return formatHex(color); // Formata como HEX
      };
    
      const oklchToHsl = (oklch: string): string => {
        const color = parse(oklch); // Converte oklch para um objeto de cor
        return formatHsl(color); // Formata como HSL
      };
    
      // Função para alternar o estado do dropdown
      const toggleDropdown = (category: string) => {
        setDropdownStates((prevState) => ({
          ...prevState,
          [category]: !prevState[category], // Alterna o estado do dropdown da categoria clicada
        }));
      };
    
      const groupedColors = groupColorsByCategory(colors); // Agrupa as cores por categoria
    
      const [colorFormat, setColorFormat] = useState("hex"); // Estado para controlar o formato selecionado
      const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>(
        {}
      ); // Estado para controlar dropdowns por categoria
    
      const tailwindColors = {
        "bg-red-50": "oklch(0.971 0.013 17.38)",
        "bg-red-100": "oklch(0.936 0.032 17.717)",
        "bg-red-200": "oklch(0.885 0.062 18.334)",
        "bg-red-300": "oklch(0.808 0.114 19.571)",
        "bg-red-400": "oklch(0.704 0.191 22.216)",
        "bg-red-500": "oklch(0.637 0.237 25.331)",
        "bg-red-600": "oklch(0.577 0.245 27.325)",
        "bg-red-700": "oklch(0.505 0.213 27.518)",
        "bg-red-800": "oklch(0.444 0.177 26.899)",
        "bg-red-900": "oklch(0.396 0.141 25.723)",
        "bg-red-950": "oklch(0.258 0.092 26.042)",
        "bg-orange-50": "oklch(0.98 0.016 73.684)",
        "bg-orange-100": "oklch(0.954 0.038 75.164)",
        "bg-orange-200": "oklch(0.901 0.076 70.697)",
        "bg-orange-300": "oklch(0.837 0.128 66.29)",
        "bg-orange-400": "oklch(0.75 0.183 55.934)",
        "bg-orange-500": "oklch(0.705 0.213 47.604)",
        "bg-orange-600": "oklch(0.646 0.222 41.116)",
        "bg-orange-700": "oklch(0.553 0.195 38.402)",
        "bg-orange-800": "oklch(0.47 0.157 37.304)",
        "bg-orange-900": "oklch(0.408 0.123 38.172)",
        "bg-orange-950": "oklch(0.266 0.079 36.259)",
        "bg-amber-50": "oklch(0.987 0.022 95.277)",
        "bg-amber-100": "oklch(0.962 0.059 95.617)",
        "bg-amber-200": "oklch(0.924 0.12 95.746)",
        "bg-amber-300": "oklch(0.879 0.169 91.605)",
        "bg-amber-400": "oklch(0.828 0.189 84.429)",
        "bg-amber-500": "oklch(0.769 0.188 70.08)",
        "bg-amber-600": "oklch(0.666 0.179 58.318)",
        "bg-amber-700": "oklch(0.555 0.163 48.998)",
        "bg-amber-800": "oklch(0.473 0.137 46.201)",
        "bg-amber-900": "oklch(0.414 0.112 45.904)",
        "bg-amber-950": "oklch(0.279 0.077 45.635)",
        "bg-yellow-50": "oklch(0.987 0.026 102.212)",
        "bg-yellow-100": "oklch(0.973 0.071 103.193)",
        "bg-yellow-200": "oklch(0.945 0.129 101.54)",
        "bg-yellow-300": "oklch(0.905 0.182 98.111)",
        "bg-yellow-400": "oklch(0.852 0.199 91.936)",
        "bg-yellow-500": "oklch(0.795 0.184 86.047)",
        "bg-yellow-600": "oklch(0.681 0.162 75.834)",
        "bg-yellow-700": "oklch(0.554 0.135 66.442)",
        "bg-yellow-800": "oklch(0.476 0.114 61.907)",
        "bg-yellow-900": "oklch(0.421 0.095 57.708)",
        "bg-yellow-950": "oklch(0.286 0.066 53.813)",
        "bg-lime-50": "oklch(0.986 0.031 120.757)",
        "bg-lime-100": "oklch(0.967 0.067 122.328)",
        "bg-lime-200": "oklch(0.938 0.127 124.321)",
        "bg-lime-300": "oklch(0.897 0.196 126.665)",
        "bg-lime-400": "oklch(0.841 0.238 128.85)",
        "bg-lime-500": "oklch(0.768 0.233 130.85)",
        "bg-lime-600": "oklch(0.648 0.2 131.684)",
        "bg-lime-700": "oklch(0.532 0.157 131.589)",
        "bg-lime-800": "oklch(0.453 0.124 130.933)",
        "bg-lime-900": "oklch(0.405 0.101 131.063)",
        "bg-lime-950": "oklch(0.274 0.072 132.109)",
        "bg-green-50": "oklch(0.982 0.018 155.826)",
        "bg-green-100": "oklch(0.962 0.044 156.743)",
        "bg-green-200": "oklch(0.925 0.084 155.995)",
        "bg-green-300": "oklch(0.871 0.15 154.449)",
        "bg-green-400": "oklch(0.792 0.209 151.711)",
        "bg-green-500": "oklch(0.723 0.219 149.579)",
        "bg-green-600": "oklch(0.627 0.194 149.214)",
        "bg-green-700": "oklch(0.527 0.154 150.069)",
        "bg-green-800": "oklch(0.448 0.119 151.328)",
        "bg-green-900": "oklch(0.393 0.095 152.535)",
        "bg-green-950": "oklch(0.266 0.065 152.934)",
        "bg-emerald-50": "oklch(0.979 0.021 166.113)",
        "bg-emerald-100": "oklch(0.95 0.052 163.051)",
        "bg-emerald-200": "oklch(0.905 0.093 164.15)",
        "bg-emerald-300": "oklch(0.845 0.143 164.978)",
        "bg-emerald-400": "oklch(0.765 0.177 163.223)",
        "bg-emerald-500": "oklch(0.696 0.17 162.48)",
        "bg-emerald-600": "oklch(0.596 0.145 163.225)",
        "bg-emerald-700": "oklch(0.508 0.118 165.612)",
        "bg-emerald-800": "oklch(0.432 0.095 166.913)",
        "bg-emerald-900": "oklch(0.378 0.077 168.94)",
        "bg-emerald-950": "oklch(0.262 0.051 172.552)",
        "bg-teal-50": "oklch(0.984 0.014 180.72)",
        "bg-teal-100": "oklch(0.953 0.051 180.801)",
        "bg-teal-200": "oklch(0.91 0.096 180.426)",
        "bg-teal-300": "oklch(0.855 0.138 181.071)",
        "bg-teal-400": "oklch(0.777 0.152 181.912)",
        "bg-teal-500": "oklch(0.704 0.14 182.503)",
        "bg-teal-600": "oklch(0.6 0.118 184.704)",
        "bg-teal-700": "oklch(0.511 0.096 186.391)",
        "bg-teal-800": "oklch(0.437 0.078 188.216)",
        "bg-teal-900": "oklch(0.386 0.063 188.416)",
        "bg-teal-950": "oklch(0.277 0.046 192.524)",
        "bg-cyan-50": "oklch(0.984 0.019 200.873)",
        "bg-cyan-100": "oklch(0.956 0.045 203.388)",
        "bg-cyan-200": "oklch(0.917 0.08 205.041)",
        "bg-cyan-300": "oklch(0.865 0.127 207.078)",
        "bg-cyan-400": "oklch(0.789 0.154 211.53)",
        "bg-cyan-500": "oklch(0.715 0.143 215.221)",
        "bg-cyan-600": "oklch(0.609 0.126 221.723)",
        "bg-cyan-700": "oklch(0.52 0.105 223.128)",
        "bg-cyan-800": "oklch(0.45 0.085 224.283)",
        "bg-cyan-900": "oklch(0.398 0.07 227.392)",
        "bg-cyan-950": "oklch(0.302 0.056 229.695)",
        "bg-sky-50": "oklch(0.977 0.013 236.62)",
        "bg-sky-100": "oklch(0.951 0.026 236.824)",
        "bg-sky-200": "oklch(0.901 0.058 230.902)",
        "bg-sky-300": "oklch(0.828 0.111 230.318)",
        "bg-sky-400": "oklch(0.746 0.16 232.661)",
        "bg-sky-500": "oklch(0.685 0.169 237.323)",
        "bg-sky-600": "oklch(0.588 0.158 241.966)",
        "bg-sky-700": "oklch(0.5 0.134 242.749)",
        "bg-sky-800": "oklch(0.443 0.11 240.79)",
        "bg-sky-900": "oklch(0.391 0.09 240.876)",
        "bg-sky-950": "oklch(0.293 0.066 243.157)",
        "bg-blue-50": "oklch(0.97 0.014 254.604)",
        "bg-blue-100": "oklch(0.932 0.032 255.585)",
        "bg-blue-200": "oklch(0.882 0.059 254.128)",
        "bg-blue-300": "oklch(0.809 0.105 251.813)",
        "bg-blue-400": "oklch(0.707 0.165 254.624)",
        "bg-blue-500": "oklch(0.623 0.214 259.815)",
        "bg-blue-600": "oklch(0.546 0.245 262.881)",
        "bg-blue-700": "oklch(0.488 0.243 264.376)",
        "bg-blue-800": "oklch(0.424 0.199 265.638)",
        "bg-blue-900": "oklch(0.379 0.146 265.522)",
        "bg-blue-950": "oklch(0.282 0.091 267.935)",
        "bg-indigo-50": "oklch(0.962 0.018 272.314)",
        "bg-indigo-100": "oklch(0.93 0.034 272.788)",
        "bg-indigo-200": "oklch(0.87 0.065 274.039)",
        "bg-indigo-300": "oklch(0.785 0.115 274.713)",
        "bg-indigo-400": "oklch(0.673 0.182 276.935)",
        "bg-indigo-500": "oklch(0.585 0.233 277.117)",
        "bg-indigo-600": "oklch(0.511 0.262 276.966)",
        "bg-indigo-700": "oklch(0.457 0.24 277.023)",
        "bg-indigo-800": "oklch(0.398 0.195 277.366)",
        "bg-indigo-900": "oklch(0.359 0.144 278.697)",
        "bg-indigo-950": "oklch(0.257 0.09 281.288)",
        "bg-violet-50": "oklch(0.969 0.016 293.756)",
        "bg-violet-100": "oklch(0.943 0.029 294.588)",
        "bg-violet-200": "oklch(0.894 0.057 293.283)",
        "bg-violet-300": "oklch(0.811 0.111 293.571)",
        "bg-violet-400": "oklch(0.702 0.183 293.541)",
        "bg-violet-500": "oklch(0.606 0.25 292.717)",
        "bg-violet-600": "oklch(0.541 0.281 293.009)",
        "bg-violet-700": "oklch(0.491 0.27 292.581)",
        "bg-violet-800": "oklch(0.432 0.232 292.759)",
        "bg-violet-900": "oklch(0.38 0.189 293.745)",
        "bg-violet-950": "oklch(0.283 0.141 291.089)",
        "bg-purple-50": "oklch(0.977 0.014 308.299)",
        "bg-purple-100": "oklch(0.946 0.033 307.174)",
        "bg-purple-200": "oklch(0.902 0.063 306.703)",
        "bg-purple-300": "oklch(0.827 0.119 306.383)",
        "bg-purple-400": "oklch(0.714 0.203 305.504)",
        "bg-purple-500": "oklch(0.627 0.265 303.9)",
        "bg-purple-600": "oklch(0.558 0.288 302.321)",
        "bg-purple-700": "oklch(0.496 0.265 301.924)",
        "bg-purple-800": "oklch(0.438 0.218 303.724)",
        "bg-purple-900": "oklch(0.381 0.176 304.987)",
        "bg-purple-950": "oklch(0.291 0.149 302.717)",
        "bg-fuchsia-50": "oklch(0.977 0.017 320.058)",
        "bg-fuchsia-100": "oklch(0.952 0.037 318.852)",
        "bg-fuchsia-200": "oklch(0.903 0.076 319.62)",
        "bg-fuchsia-300": "oklch(0.833 0.145 321.434)",
        "bg-fuchsia-400": "oklch(0.74 0.238 322.16)",
        "bg-fuchsia-500": "oklch(0.667 0.295 322.15)",
        "bg-fuchsia-600": "oklch(0.591 0.293 322.896)",
        "bg-fuchsia-700": "oklch(0.518 0.253 323.949)",
        "bg-fuchsia-800": "oklch(0.452 0.211 324.591)",
        "bg-fuchsia-900": "oklch(0.401 0.17 325.612)",
        "bg-fuchsia-950": "oklch(0.293 0.136 325.661)",
        "bg-pink-50": "oklch(0.971 0.014 343.198)",
        "bg-pink-100": "oklch(0.948 0.028 342.258)",
        "bg-pink-200": "oklch(0.899 0.061 343.231)",
        "bg-pink-300": "oklch(0.823 0.12 346.018)",
        "bg-pink-400": "oklch(0.718 0.202 349.761)",
        "bg-pink-500": "oklch(0.656 0.241 354.308)",
        "bg-pink-600": "oklch(0.592 0.249 0.584)",
        "bg-pink-700": "oklch(0.525 0.223 3.958)",
        "bg-pink-800": "oklch(0.459 0.187 3.815)",
        "bg-pink-900": "oklch(0.408 0.153 2.432)",
        "bg-pink-950": "oklch(0.284 0.109 3.907)",
        "bg-rose-50": "oklch(0.969 0.015 12.422)",
        "bg-rose-100": "oklch(0.941 0.03 12.58)",
        "bg-rose-200": "oklch(0.892 0.058 10.001)",
        "bg-rose-300": "oklch(0.81 0.117 11.638)",
        "bg-rose-400": "oklch(0.712 0.194 13.428)",
        "bg-rose-500": "oklch(0.645 0.246 16.439)",
        "bg-rose-600": "oklch(0.586 0.253 17.585)",
        "bg-rose-700": "oklch(0.514 0.222 16.935)",
        "bg-rose-800": "oklch(0.455 0.188 13.697)",
        "bg-rose-900": "oklch(0.41 0.159 10.272)",
        "bg-rose-950": "oklch(0.271 0.105 12.094)",
        "bg-slate-50": "oklch(0.984 0.003 247.858)",
        "bg-slate-100": "oklch(0.968 0.007 247.896)",
        "bg-slate-200": "oklch(0.929 0.013 255.508)",
        "bg-slate-300": "oklch(0.869 0.022 252.894)",
        "bg-slate-400": "oklch(0.704 0.04 256.788)",
        "bg-slate-500": "oklch(0.554 0.046 257.417)",
        "bg-slate-600": "oklch(0.446 0.043 257.281)",
        "bg-slate-700": "oklch(0.372 0.044 257.287)",
        "bg-slate-800": "oklch(0.279 0.041 260.031)",
        "bg-slate-900": "oklch(0.208 0.042 265.755)",
        "bg-slate-950": "oklch(0.129 0.042 264.695)",
        "bg-gray-50": "oklch(0.985 0.002 247.839)",
        "bg-gray-100": "oklch(0.967 0.003 264.542)",
        "bg-gray-200": "oklch(0.928 0.006 264.531)",
        "bg-gray-300": "oklch(0.872 0.01 258.338)",
        "bg-gray-400": "oklch(0.707 0.022 261.325)",
        "bg-gray-500": "oklch(0.551 0.027 264.364)",
        "bg-gray-600": "oklch(0.446 0.03 256.802)",
        "bg-gray-700": "oklch(0.373 0.034 259.733)",
        "bg-gray-800": "oklch(0.278 0.033 256.848)",
        "bg-gray-900": "oklch(0.21 0.034 264.665)",
        "bg-gray-950": "oklch(0.13 0.028 261.692)",
        "bg-zinc-50": "oklch(0.985 0 0)",
        "bg-zinc-100": "oklch(0.967 0.001 286.375)",
        "bg-zinc-200": "oklch(0.92 0.004 286.32)",
        "bg-zinc-300": "oklch(0.871 0.006 286.286)",
        "bg-zinc-400": "oklch(0.705 0.015 286.067)",
        "bg-zinc-500": "oklch(0.552 0.016 285.938)",
        "bg-zinc-600": "oklch(0.442 0.017 285.786)",
        "bg-zinc-700": "oklch(0.37 0.013 285.805)",
        "bg-zinc-800": "oklch(0.274 0.006 286.033)",
        "bg-zinc-900": "oklch(0.21 0.006 285.885)",
        "bg-zinc-950": "oklch(0.141 0.005 285.823)",
        "bg-neutral-50": "oklch(0.985 0 0)",
        "bg-neutral-100": "oklch(0.97 0 0)",
        "bg-neutral-200": "oklch(0.922 0 0)",
        "bg-neutral-300": "oklch(0.87 0 0)",
        "bg-neutral-400": "oklch(0.708 0 0)",
        "bg-neutral-500": "oklch(0.556 0 0)",
        "bg-neutral-600": "oklch(0.439 0 0)",
        "bg-neutral-700": "oklch(0.371 0 0)",
        "bg-neutral-800": "oklch(0.269 0 0)",
        "bg-neutral-900": "oklch(0.205 0 0)",
        "bg-neutral-950": "oklch(0.145 0 0)",
        "bg-stone-50": "oklch(0.985 0.001 106.423)",
        "bg-stone-100": "oklch(0.97 0.001 106.424)",
        "bg-stone-200": "oklch(0.923 0.003 48.717)",
        "bg-stone-300": "oklch(0.869 0.005 56.366)",
        "bg-stone-400": "oklch(0.709 0.01 56.259)",
        "bg-stone-500": "oklch(0.553 0.013 58.071)",
        "bg-stone-600": "oklch(0.444 0.011 73.639)",
        "bg-stone-700": "oklch(0.374 0.01 67.558)",
        "bg-stone-800": "oklch(0.268 0.007 34.298)",
        "bg-stone-900": "oklch(0.216 0.006 56.043)",
        "bg-stone-950": "oklch(0.147 0.004 49.25)",
        "bg-black": "oklch(0% 0 0)",
        "bg-white": "oklch(100% 0 0)",
      };

      const formats = ["hex", "rgb", "className", "hsl", "oklch"]
    


    return(
        <div>
               <h3 className="text-2xl font-medium mb-8">Dicionário de cores</h3>

<div className="space-y-8">
              {Object.entries(groupedColors).map(([category, items]) => (
                <Alert key={category} className="p-6 ">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold">{category}</h4>
                    {/* Dropdown para escolher o formato */}
                    <div className="relative w-fit">
      <Select value={colorFormat} onValueChange={setColorFormat}>
        <SelectTrigger className="">
          <SelectValue>{colorFormat.toUpperCase()}</SelectValue>
         
        </SelectTrigger>
        <SelectContent className="">
          {formats.map((format) => (
            <SelectItem key={format} value={format} className="">
              {format.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
                  </div>
                  <ScrollArea className="">
                  <div className="flex gap-4">
                    {(items as { name: string; color: string }[]).map(
                      (item, index) => {
                        // Função para determinar a cor do ícone com base na luminosidade da cor da box
                    

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center relative group"
                          >
                            {/* Box com evento de clique */}
                            <div
                              onClick={() => {
                                const convertedColor = convertColor(
                                  item.color,
                                  colorFormat
                                );
                                navigator.clipboard.writeText(convertedColor);
                                toast.success(`Cor copiada: ${convertedColor}`);
                              }}
                              className="cursor-pointer relative"
                            >
                              {/* Usando o componente Box para renderizar a cor */}
                              <Box color={item.color} />
                              {/* Ícone de Copiar no Hover */}
                              <Button size={'icon'} variant={'ghost'}
                                className="absolute top-2 h-6 w-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                
                              >
                                <Copy size={12} />
                              </Button>
                            </div>
                            {/* Descrição com efeito de hover */}
                            <p className="text-sm mt-2 text-center  transition-all duration-200">
                              {item.name}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>

                  <ScrollBar orientation="horizontal"/>
                  </ScrollArea>
                </Alert>
              ))}
            </div>

        </div>
    )
}