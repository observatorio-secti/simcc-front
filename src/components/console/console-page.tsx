import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Construction,
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';

export function ConsolePage() {
  return (
    <>
      <Helmet>
        <title>Console | Simcc</title>
        <meta name="description" content="Área de gestão e console do Simcc" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full h-full p-6 md:p-10 flex flex-col justify-center items-center">
        <div className="max-w-2xl w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Construction className="w-12 h-12 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 text-xs px-2.5 py-0.5 font-medium"
              >
                Em construção
              </Badge>
              <Badge
                variant="secondary"
                className="text-xs px-2.5 py-0.5 font-normal text-muted-foreground"
              >
                v2.0
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Console Administrativo
            </h1>
            <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
              Esta área está sendo desenvolvida para centralizar a gestão de módulos,
              dados e configurações avançadas da plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-4">
            <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur">
              <CardContent className="p-4 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Painel de Gestão
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Visão executiva dos indicadores da plataforma.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur">
              <CardContent className="p-4 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Novos Módulos
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Funcionalidades em planejamento e integração.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur">
              <CardContent className="p-4 space-y-2">
                <div className="p-2 w-fit rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  Acesso Protegido
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Ambiente exclusivo para usuários autenticados.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="pt-2 flex justify-center">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                Voltar para a Plataforma Pública
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
