import React from 'react';
import { Helmet } from 'react-helmet';
import { ResearcherListTable } from './researcher-list-table';

export function ResearchersPage() {
  return (
    <>
      <Helmet>
        <title>Pesquisadores | Console Simcc</title>
        <meta
          name="description"
          content="Gerenciamento global de pesquisadores cadastrados no observatório"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-[1200px] mx-auto bg-sm-canvas min-h-screen">
        {/* Cabeçalho da Página */}
        <div className="border-b border-sm-wave-gray pb-5 space-y-1">
          <p className="sm-eyebrow">CADASTRO ACADÊMICO · <b>PESQUISADORES</b></p>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-sm-navy font-sans">
            Pesquisadores
          </h1>
          <p className="text-xs md:text-sm text-sm-navy-600">
            Base cadastral de docentes e pesquisadores monitorados pela
            plataforma, com identificadores Lattes, afiliações e coleções ativas.
          </p>
        </div>

        {/* Tabela Global de Pesquisadores */}
        <ResearcherListTable />
      </div>
    </>
  );
}
