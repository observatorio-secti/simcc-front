import React from 'react';
import { Helmet } from 'react-helmet';
import { Badge } from '../ui/badge';
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

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho da Página */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5 space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-[#559FB8] text-[#07677e] dark:text-[#559FB8] bg-[#559FB8]/10 text-xs font-semibold px-2 py-0.5"
            >
              Plataforma
            </Badge>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Módulo Acadêmico
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
            Pesquisadores
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400">
            Base cadastral de docentes e pesquisadores monitorados pela
            plataforma, com identificadores Lattes e afiliações ativas.
          </p>
        </div>

        {/* Tabela Global de Pesquisadores */}
        <ResearcherListTable />
      </div>
    </>
  );
}
