import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../ui/table";
import { Alert } from "../ui/alert";
import { Helmet } from "react-helmet";
import { useContext } from "react";
import { UserContext } from "../../context/context";

export function IndicePesquisador() {
      const history = useNavigate();
    
          const handleVoltar = () => {
            history(-1);
          }

          const researchers = [
            {
              level: "A+",
              phdYears: "≥ 10",
              academicProduction: "A + L + CL ≥ 5 (mínimo 2 A1)",
              pgExperience: "≥ 4 Doutorados",
              combinedRule: "≥ 1 A1 + ≥ 1 patente",
            },
            {
              level: "A",
              phdYears: "≥ 10",
              academicProduction: "A + L + CL ≥ 5 (mínimo 1 A1)",
              pgExperience: "≥ 2 Doutorados",
              combinedRule: "≥ 1 patente",
            },
            {
              level: "B+",
              phdYears: "≥ 8",
              academicProduction: "A + L + CL ≥ 4 (Mínimo 2 AA)",
              pgExperience: "≥ 2 Mestrados ou ≥ 1 Doutorado",
              combinedRule: "≥ 1 A* + (≥ 1 patente ou ≥ 3 softwares)",
            },
            {
              level: "B",
              phdYears: "≥ 8",
              academicProduction: "A + L + CL ≥ 4 (Mínimo 1 AA)",
              pgExperience: "≥ 2 Mestrados ou ≥ 1 Doutorado",
              combinedRule: "≥ 1 patente ou ≥ 3 softwares",
            },
            {
              level: "C+",
              phdYears: "≥ 6",
              academicProduction: "A + L + CL ≥ 3 (Mínimo 2 AA)",
              pgExperience: "≥ 1 Mestrado ou 1 Doutorado",
              combinedRule: "≥ 1 A* + (≥ 1 patente ou ≥ 3 softwares)",
            },
            {
              level: "C",
              phdYears: "≥ 6",
              academicProduction: "A + L + CL ≥ 3 (Mínimo 1 AA)",
              pgExperience: "≥ 1 Mestrado ou ≥ 1 Doutorado",
              combinedRule: "≥ 1 patente ou ≥ 3 softwares",
            },
            {
              level: "D+",
              phdYears: "≥ 3",
              academicProduction: "A + L + CL ≥ 2 (Mínimo 1 AA)",
              pgExperience: "-",
              combinedRule: "≥ 1 patente ou ≥ 3 softwares",
            },
            {
              level: "D",
              phdYears: "≥ 3",
              academicProduction: "A + L + CL ≥ 2 (Mínimo 1 AA)",
              pgExperience: "-",
              combinedRule: "≥ 1 patente ou ≥ 3 softwares",
            },
            {
              level: "E+",
              phdYears: "< 3",
              academicProduction: "A + L + CL ≥ 1",
              pgExperience: "-",
              combinedRule: "≥ 1 A* ou ≥ 1 patente ou ≥ 3 softwares",
            },
            {
              level: "E",
              phdYears: "-",
              academicProduction: "-",
              pgExperience: "-",
              combinedRule: "Todos que não foram classificados",
            },
          ];

          const classificationColors = {
            "A+": "bg-green-500",
            A: "bg-green-400",
            "B+": "bg-yellow-400",
            B: "bg-yellow-300",
            "C+": "bg-orange-400",
            C: "bg-orange-300",
            "D+": "bg-red-400",
            D: "bg-red-300",
            "E+": "bg-gray-400",
            E: "bg-gray-300",
          };
          const {version} = useContext(UserContext)

    return(
        <main className="flex  flex-1 flex-col gap-8 p-4  md:p-8">
           
           <Helmet>
          <title>Índice do pesquisador | {version ? ('Conectee'):('Simcc')}</title>
          <meta name="description" content={`Índice do pesquisador | ${version ? ('Conectee'):('Simcc')}`} />
          <meta name="robots" content="index, follow" />
        </Helmet>

 <div className="w-full  gap-4">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
              Índice do pesquisador
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              
               
          
             
              </div>
            </div>

            </div>

            <div>
                      

                        <h1 className="max-w-[650px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block mb-3">
                            Saiba mais sobre o  {" "}
                            <strong className="bg-eng-blue rounded-md px-3 pb-2 text-white font-medium">
                                cálculo
                            </strong>{" "}
                            do índice do pesquisador na plataforma
                        </h1>
                        <p className="max-w-[750px] text-lg font-light text-foreground">
                            Pesquise termos para auxiliar o seu filtro na plataforma
                        </p>
                       
                    </div>

                   <Alert>
                   <Table className="rounded-md">
  
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Nível</TableHead>
      <TableHead>Tempo de Doutorado (anos)</TableHead>
      <TableHead>Produção Acadêmica*</TableHead>
      <TableHead>Experiência PG (Orientação)</TableHead>
      <TableHead>Regra Combinada</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {researchers.map((researcher, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium flex gap-2 items-center"><div
className={`rounded-md h-4 w-4 ${
classificationColors[researcher.level] || "bg-neutral-200"
}`}
>
</div>{researcher.level}</TableCell>
        <TableCell>{researcher.phdYears}</TableCell>
        <TableCell>{researcher.academicProduction}</TableCell>
        <TableCell>{researcher.pgExperience}</TableCell>
        <TableCell>{researcher.combinedRule}</TableCell>
      </TableRow>
    ))}
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={5} className="text-center">
      (A - Artigo)
(AB – Qualquer artigo qualis B)
(AA – Qualquer artigo qualis A )
(A1 – Artigo qualis A1)
(L – Livro )
(CL – Capítulo Livro)

      </TableCell>
    </TableRow>
  </TableFooter>
</Table>
                   </Alert>

    <div className="grid lg:grid-cols-2 gap-8">
       <div className="gap-4 grid">
       <p className="text-gray-500 text-justify">
        A Tabela 1 apresenta os parâmetros utilizados para classificar os pesquisadores
em níveis que variam de E (mais baixo) a A+ (mais alto). Sendo realizada por meio de
uma análise multicritério que considera o tempo desde a conclusão do doutorado, a
produção acadêmica e técnica, além da experiência do pesquisador em programas de
pós-graduação Stricto Sensu.
        </p>

        <p className="text-gray-500 text-justify">
        A definição multicritério dos parâmetros da Tabela 1 baseou-se nos seguintes
documentos: a) Documento de área da Capes para a área 45 (Interdisciplinar); b)
Chamada pública CNPq 04/2021 para Bolsas de Produtividade em Pesquisa (PQ), que
valoriza pesquisadores com produção científica e tecnológica de destaque; c) Chamada
CNPq 05/2021 para Bolsas de Produtividade Sênior (PQ-Sr), que reconhece líderes em
suas áreas; d) Chamada 04/2023 para Bolsas de Desenvolvimento Tecnológico e
Extensão Inovadora (DT), que valoriza participação em atividades de desenvolvimento
tecnológico; e) Referência do Grupo de Trabalho Produção Técnica da CAPES, criado
em 2018, para desenvolver metodologia de avaliação da produção técnica e tecnológica.
A produção acadêmica dos pesquisadores, medida pela quantidade de artigos e
qualificação no Qualis, considera os últimos quatro anos, correspondendo ao período de
avaliação quadrienal da Capes. A análise está na ficha de avaliação da área
interdisciplinar, que calcula o indicador de produção intelectual em periódicos
(IndProdArt).
        </p>
       </div>

       <div>
       <p className="text-gray-500 text-justify">
       O tempo de doutorado, análise do estrato Qualis e experiência na pós-graduação
Stricto Sensu seguem o Edital CNPq Nº 04/2021, que exige 3 anos (Pesquisador 2), 8
anos (Pesquisador 1D) e 10 anos (Pesquisador 1C e 1B), com uma faixa intermediária
de 3 a 6 anos. O edital também valoriza artigos bem avaliados no Qualis-Capes e exige
pelo menos duas orientações concluídas para níveis mais elevados de bolsas.
Além desses critérios, há uma regra que permite substituir a produção acadêmica
por produção técnica, como patentes e softwares. Se o pesquisador não atingir a
produção acadêmica necessária, pode usar essa substituição. Nos níveis A+ e A, um
artigo A1 pode ser trocado por uma patente; nos níveis B+, B, C+, C e D+, qualquer
artigo pode ser substituído por uma patente ou três softwares.
       </p>
       </div>
    </div>
        </main>
    )
}