import React from 'react';
import { Helmet } from 'react-helmet';
import {
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useAnalyticsMetrics } from '../../hooks/use-analytics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-sm-wave-gray rounded p-2.5 shadow-none text-xs space-y-1">
        <p className="font-extrabold text-sm-navy border-b border-sm-wave-gray pb-1">
          Dia: {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-sm-navy-600 font-medium">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-extrabold text-sm-navy">
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

      <div className="flex-1 w-full p-6 md:p-8 space-y-8 max-w-[1200px] mx-auto bg-sm-canvas min-h-screen">
        {/* Header do Módulo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sm-wave-gray pb-5">
          <div className="space-y-1">
            <p className="sm-eyebrow">ADMINISTRAÇÃO · <b>MÉTRICAS</b></p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-sm-navy font-sans">
              Métricas de Acesso
            </h1>
            <p className="text-xs md:text-sm text-sm-navy-600 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sm-navy-600" />
                Consolidado dos últimos 30 dias
              </span>
            </p>
          </div>
        </div>

        {/* Estado de Erro */}
        {isError && (
          <div className="sm-card border-sm-red-100 bg-sm-red-100/30 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center md:text-left">
              <h3 className="font-extrabold text-sm-red-700 text-xs">
                Não foi possível conectar ao serviço de métricas
              </h3>
              <p className="text-xs text-sm-navy-600">
                {error?.message ||
                  'Certifique-se de que a API geral (simcc-back) está ativa e configurada com as credenciais do Google Analytics.'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-sm-red-700 text-sm-red-700 hover:bg-sm-red-100 text-xs h-8 rounded-sm"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Estado de Carregamento (Skeletons) */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="sm-card p-5 space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
            <div className="sm-card p-6">
              <Skeleton className="h-[280px] w-full" />
            </div>
          </div>
        )}

        {/* Conteúdo com Dados Reais */}
        {!isLoading && data && (
          <>
            {/* Grade de KPIs Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Visualizações (com filete vermelho da marca) */}
              <div className="sm-card sm-card--accent p-5 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sm-navy-600 block">
                  Visualizações
                </span>
                <div className="sm-kpi">
                  {data.totalPageViews.toLocaleString('pt-BR')}
                </div>
                <p className="text-[11px] text-sm-navy-600">
                  Média diária de <b>{data.avgDailyPageViews.toLocaleString('pt-BR')}</b> páginas
                </p>
              </div>

              {/* Card 2: Sessões */}
              <div className="sm-card p-5 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sm-navy-600 block">
                  Sessões
                </span>
                <div className="sm-kpi">
                  {data.totalSessions.toLocaleString('pt-BR')}
                </div>
                <p className="text-[11px] text-sm-navy-600">
                  Visitas totais no período
                </p>
              </div>

              {/* Card 3: Novos Usuários */}
              <div className="sm-card p-5 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sm-navy-600 block">
                  Novos Visitantes
                </span>
                <div className="sm-kpi">
                  {data.totalNewUsers.toLocaleString('pt-BR')}
                </div>
                <p className="text-[11px] text-sm-navy-600">
                  Primeiro acesso ao site
                </p>
              </div>

              {/* Card 4: Interações */}
              <div className="sm-card p-5 space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sm-navy-600 block">
                  Interações Totais
                </span>
                <div className="sm-kpi">
                  {data.totalEvents.toLocaleString('pt-BR')}
                </div>
                <p className="text-[11px] text-sm-navy-600">
                  Ações registradas na plataforma
                </p>
              </div>
            </div>

            {/* Gráfico de Linhas Chapadas (Sem degradê) */}
            <div className="sm-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-sm-wave-gray pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-sm-navy">
                    Evolução Diária de Tráfego
                  </h3>
                  <p className="text-xs text-sm-navy-600">
                    Comparativo diário entre visualizações de páginas e sessões de usuários.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-sm-navy">
                    <span className="w-3 h-3 rounded-sm bg-sm-navy" />
                    Visualizações
                  </span>
                  <span className="flex items-center gap-1.5 text-sm-navy-600">
                    <span className="w-3 h-3 rounded-sm bg-sm-sky" />
                    Sessões
                  </span>
                </div>
              </div>

              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.dailyTrends}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#DEE0E3"
                    />
                    <XAxis
                      dataKey="dateFormatted"
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="#4A4C8F"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      fontSize={11}
                      stroke="#4A4C8F"
                      tickFormatter={(value) =>
                        value >= 1000
                          ? `${(value / 1000).toFixed(0)}k`
                          : value
                      }
                    />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="pageViews"
                      name="Visualizações"
                      stroke="#2B2D74"
                      strokeWidth={2.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      name="Sessões"
                      stroke="#5B9BDD"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grid 2 Colunas: Países & Eventos com Barras Chapadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna 1: Origem Geográfica */}
              <div className="sm-card p-6 space-y-4">
                <div className="border-b border-sm-wave-gray pb-3">
                  <h3 className="text-sm font-extrabold text-sm-navy">
                    Principais Origens Geográficas
                  </h3>
                  <p className="text-xs text-sm-navy-600">
                    Distribuição percentual por visualizações
                  </p>
                </div>
                <div className="space-y-3.5 pt-1">
                  {data.topCountries.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm-navy">
                          {item.country}
                        </span>
                        <span className="font-mono text-sm-navy-600">
                          <b>{item.pageViews.toLocaleString('pt-BR')}</b> ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-sm-wash rounded-sm overflow-hidden">
                        <div
                          className="h-full bg-sm-navy"
                          style={{ width: `${Math.max(4, item.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coluna 2: Ações Mais Frequentes */}
              <div className="sm-card p-6 space-y-4">
                <div className="border-b border-sm-wave-gray pb-3">
                  <h3 className="text-sm font-extrabold text-sm-navy">
                    Ações Mais Frequentes
                  </h3>
                  <p className="text-xs text-sm-navy-600">
                    Interações de pesquisa e navegação realizadas
                  </p>
                </div>
                <div className="space-y-3 pt-1">
                  {data.eventBreakdown.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded border border-sm-wave-gray bg-white text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-sm-navy block">
                          {item.eventLabel}
                        </span>
                        <span className="font-mono text-[10px] text-sm-navy-600 block">
                          {item.eventName}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm-navy block">
                          {item.count.toLocaleString('pt-BR')}
                        </span>
                        <span className="text-[10px] text-sm-navy-600">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
