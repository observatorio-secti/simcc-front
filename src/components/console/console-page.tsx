import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Eye,
  Globe2,
  MousePointerClick,
  Server,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { useAnalyticsMetrics } from '../../hooks/use-analytics';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// Custom Tooltip estilizado para o gráfico
function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 shadow-lg text-xs space-y-1.5">
        <p className="font-semibold text-neutral-900 dark:text-neutral-100 border-b border-neutral-100 dark:border-neutral-800 pb-1">
          Dia: {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
              {Number(entry.value).toLocaleString('pt-BR')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function ConsolePage() {
  const { data, isLoading, isError, error, refetch } = useAnalyticsMetrics();

  const gaPropertyId = import.meta.env.VITE_GA4_PROPERTY_ID || '376604622';
  const siteDomain = import.meta.env.VITE_URL_SITE
    ? import.meta.env.VITE_URL_SITE.replace(/%/g, '')
    : 'observatoriocti.secti.ba.gov.br';

  return (
    <>
      <Helmet>
        <title>Métricas de Acesso | Console Simcc</title>
        <meta
          name="description"
          content="Painel de métricas analíticas e tráfego da plataforma Simcc"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="flex-1 w-full p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Header do Módulo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-[#559FB8] text-[#07677e] dark:text-[#559FB8] bg-[#559FB8]/10 text-xs font-semibold px-2 py-0.5"
              >
                Módulo Administrativo
              </Badge>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1 font-mono">
                <Server className="w-3 h-3" />
                GA4: {gaPropertyId}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 font-sans">
              Métricas de Acesso da Plataforma
            </h1>
            <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
              <span>Domínio: <strong className="font-mono text-neutral-700 dark:text-neutral-300">{siteDomain}</strong></span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Últimos 30 dias
              </span>
            </p>
          </div>
        </div>

        {/* Estado de Erro */}
        {isError && (
          <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
            <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="font-semibold text-red-900 dark:text-red-300 text-sm">
                  Não foi possível conectar ao serviço de métricas
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {error?.message ||
                    'Certifique-se de que o servidor local está ativo em http://localhost:3000.'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950 text-xs"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Estado de Carregamento (Skeletons) */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="border-neutral-200 dark:border-neutral-800">
                  <CardContent className="p-5 space-y-3">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-8 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="border-neutral-200 dark:border-neutral-800">
              <CardContent className="p-6">
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Conteúdo com Dados Reais */}
        {!isLoading && data && (
          <>
            {/* Grade de KPIs Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Visualizações */}
              <Card className="border border-neutral-200 dark:border-neutral-800 border-l-4 border-l-[#559FB8] bg-white dark:bg-neutral-900 shadow-sm">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Visualizações
                    </span>
                    <div className="p-2 rounded-lg bg-[#559FB8]/10 text-[#07677e] dark:text-[#559FB8]">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                      {data.totalPageViews.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Média diária de{' '}
                      <strong className="font-mono text-neutral-700 dark:text-neutral-300">
                        {data.avgDailyPageViews.toLocaleString('pt-BR')}
                      </strong>{' '}
                      páginas
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Sessões */}
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Sessões Iniciadas
                    </span>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                      {data.totalSessions.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Visitas totais no período
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Novos Usuários */}
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Novos Visitantes
                    </span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <UserPlus className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                      {data.totalNewUsers.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Primeiro acesso ao site
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card 4: Eventos */}
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                    <span className="text-xs font-medium uppercase tracking-wider">
                      Total de Interações
                    </span>
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <Activity className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100">
                      {data.totalEvents.toLocaleString('pt-BR')}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Cliques, rolagens e visualizações
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Evolução Temporal */}
            <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
              <CardHeader className="p-5 pb-2 border-b border-neutral-100 dark:border-neutral-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#559FB8]" />
                    Evolução Diária de Tráfego
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                    Comparativo diário entre visualizações de páginas e sessões de usuários.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
                    <span className="w-3 h-3 rounded-sm bg-[#07677e]" />
                    Visualizações
                  </span>
                  <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 font-medium">
                    <span className="w-3 h-3 rounded-sm bg-[#719CB8]" />
                    Sessões
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-6">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.dailyTrends}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorPageViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#07677e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#07677e" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#719CB8" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#719CB8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        className="stroke-neutral-200 dark:stroke-neutral-800"
                      />
                      <XAxis
                        dataKey="dateFormatted"
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        className="text-neutral-500 dark:text-neutral-400 font-mono"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        fontSize={11}
                        className="text-neutral-500 dark:text-neutral-400 font-mono"
                        tickFormatter={(value) =>
                          value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
                        }
                      />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="pageViews"
                        name="Visualizações"
                        stroke="#07677e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPageViews)"
                      />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        name="Sessões"
                        stroke="#719CB8"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorSessions)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Grid 2 Colunas: Países & Eventos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1: Origem Geográfica */}
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <CardHeader className="p-5 pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
                  <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe2 className="w-4 h-4 text-[#559FB8]" />
                      Principais Origens Geográficas
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                      Por visualizações
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {data.topCountries.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                          <span className="w-4 text-center font-mono text-[10px] text-neutral-400">
                            {idx + 1}
                          </span>
                          {item.country}
                        </span>
                        <span className="font-mono text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          <strong>{item.pageViews.toLocaleString('pt-BR')}</strong>
                          <span className="text-neutral-400 text-[10px]">
                            ({item.percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Coluna 2: Detalhamento de Eventos */}
              <Card className="border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <CardHeader className="p-5 pb-3 border-b border-neutral-100 dark:border-neutral-800/60">
                  <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <MousePointerClick className="w-4 h-4 text-[#559FB8]" />
                      Ações e Eventos Registrados
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">
                      Distribuição
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3">
                  {data.eventBreakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-neutral-800 dark:text-neutral-200">
                          {item.eventLabel}
                        </div>
                        <div className="text-[10px] font-mono text-neutral-400">
                          {item.eventName}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                          {item.count.toLocaleString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                          {item.percentage.toFixed(1)}% do volume
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
