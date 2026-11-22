import { useEffect, useId, useMemo, useState } from 'react';

const VIEWBOX_WIDTH = 1200;
const VIEWBOX_HEIGHT = 600;
const TOP_PADDING = 64;
const BOTTOM_PADDING = 24;
const ROTATION_INTERVAL_MS = 8000;

interface ChartSeries {
  key: 'count_article' | 'count_patent' | 'count_guidance_in_progress';
  values: readonly number[];
}

/**
 * Dados reais agregados da plataforma (2022–2026) para artigos, patentes e
 * orientações em andamento, mantendo curvas suaves com poucas oscilações e
 * renderização imediata sem aguardar consulta à API.
 */
const STATIC_SERIES: readonly ChartSeries[] = [
  {
    key: 'count_article',
    values: [11955, 11989, 13224, 12490, 8986],
  },
  {
    key: 'count_patent',
    values: [109, 96, 138, 143, 133],
  },
  {
    key: 'count_guidance_in_progress',
    values: [1821, 3020, 5359, 10744, 8561],
  },
];

interface Point {
  x: number;
  y: number;
}

/**
 * Calcula os pontos (x, y) no sistema de coordenadas do SVG e gera um caminho
 * cúbico monótono (Fritsch–Carlson) equivalente ao `type="monotone"` do Recharts.
 */
function buildMonotonePath(
  values: readonly number[],
  maxValue: number,
): string {
  if (values.length === 0) return '';

  const usableHeight = VIEWBOX_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
  const stepX =
    values.length > 1 ? VIEWBOX_WIDTH / (values.length - 1) : VIEWBOX_WIDTH;

  const points: Point[] = values.map((value, index) => ({
    x: index * stepX,
    y:
      TOP_PADDING +
      usableHeight -
      (Math.max(0, value) / Math.max(1, maxValue)) * usableHeight,
  }));

  if (points.length === 1) {
    return `M ${points[0]!.x} ${points[0]!.y}`;
  }

  const n = points.length;
  const dx: number[] = [];
  const dy: number[] = [];
  const slopes: number[] = [];

  for (let i = 0; i < n - 1; i++) {
    const deltaX = points[i + 1]!.x - points[i]!.x;
    const deltaY = points[i + 1]!.y - points[i]!.y;
    dx.push(deltaX);
    dy.push(deltaY);
    slopes.push(deltaX === 0 ? 0 : deltaY / deltaX);
  }

  const tangents: number[] = [slopes[0] ?? 0];
  for (let i = 1; i < n - 1; i++) {
    const prev = slopes[i - 1]!;
    const next = slopes[i]!;
    if (prev * next <= 0) {
      tangents.push(0);
    } else {
      const w1 = 2 * dx[i]! + dx[i - 1]!;
      const w2 = dx[i]! + 2 * dx[i - 1]!;
      tangents.push((w1 + w2) / (w1 / prev + w2 / next));
    }
  }
  tangents.push(slopes[n - 2] ?? 0);

  let d = `M ${points[0]!.x.toFixed(2)} ${points[0]!.y.toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[i]!;
    const p1 = points[i + 1]!;
    const segDx = dx[i]! / 3;
    const cp1x = p0.x + segDx;
    const cp1y = p0.y + tangents[i]! * segDx;
    const cp2x = p1.x - segDx;
    const cp2y = p1.y - tangents[i + 1]! * segDx;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
  }

  return d;
}

function buildAreaPath(linePath: string): string {
  if (!linePath) return '';
  return `${linePath} L ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT} L 0 ${VIEWBOX_HEIGHT} Z`;
}

/**
 * Gráfico decorativo animado exibido ao fundo da tela inicial, alternando
 * automaticamente entre séries estáticas a cada 5 segundos.
 */
export function HomeBackgroundChart() {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const gradientId = useId().replace(/:/g, '');

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIndex((prev) => (prev + 1) % STATIC_SERIES.length);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  const computedSeries = useMemo(() => {
    return STATIC_SERIES.map((series, index) => {
      const seriesMax = Math.max(...series.values, 1);
      const linePath = buildMonotonePath(series.values, seriesMax);
      return {
        key: series.key,
        linePath,
        areaPath: buildAreaPath(linePath),
        inactiveOpacity: (STATIC_SERIES.length - index) / STATIC_SERIES.length,
      };
    });
  }, []);

  const activeSeries = computedSeries[visibleIndex] ?? computedSeries[0]!;

  return (
    <div
      aria-hidden="true"
      data-testid="home-background-chart"
      data-active-series={activeSeries.key}
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[75vh] overflow-hidden opacity-30 select-none"
    >
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#82AAC0" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#82AAC0" stopOpacity={0} />
          </linearGradient>
        </defs>

        {computedSeries.map((series, index) => {
          if (index === visibleIndex) return null;
          return (
            <path
              key={series.key}
              d={series.linePath}
              fill="none"
              strokeWidth={6}
              strokeOpacity={series.inactiveOpacity}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="stroke-[#A3A3A3] dark:stroke-[#404040]"
            />
          );
        })}

        <g key={activeSeries.key}>
          <path
            d={activeSeries.areaPath}
            fill={`url(#${gradientId})`}
            style={{
              animation: 'home-chart-area 1600ms ease-out forwards',
            }}
          />
          <path
            d={activeSeries.linePath}
            fill="none"
            stroke="#559FB8"
            strokeWidth={6}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength={1}
            strokeDasharray="1"
            style={{
              animation: 'home-chart-draw 2600ms ease-in-out forwards',
            }}
          />
        </g>
      </svg>
    </div>
  );
}
