import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { simccV2Url } from '@/test/msw/handlers';
import { renderRoute } from '@/test/render-route';

describe('Rota /indicadores', () => {
  it('carrega a série de artigos por padrão via MSW e exibe KPIs e pendências', async () => {
    await renderRoute('/indicadores');

    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      /estatísticas/i,
    );

    // Série padrão da fixture MSW: 2022 (310), 2023 (345), 2024 (380) => total 1.035
    expect(await screen.findByText('1.035')).toBeInTheDocument();
    expect(screen.getByText('2022 – 2024')).toBeInTheDocument();

    // Lista os indicadores do legado que aguardam novas rotas /v2/metrics/*
    expect(screen.getByText('Busca de informações')).toBeInTheDocument();
    expect(screen.getByText('Programas de pós-graduação')).toBeInTheDocument();
  });

  it('atualiza a URL e consulta outro tipo de produção ao clicar no atalho', async () => {
    const requestedKinds: string[] = [];

    const { router, user } = await renderRoute('/indicadores', {
      handlers: [
        http.get(simccV2Url('/metrics/production/{kind}'), ({ params }) => {
          const kind = String(params.kind);
          requestedKinds.push(kind);
          return HttpResponse.json({
            kind: kind === 'book-chapter' ? 'book_chapter' : kind,
            data:
              kind === 'patent'
                ? [
                    { period: 2023, value: 40 },
                    { period: 2024, value: 65 },
                  ]
                : [{ period: 2024, value: 380 }],
            filters_applied: {},
            meta: { total: 2 },
          });
        }),
      ],
    });

    await user.click(screen.getByRole('button', { name: /Patentes/i }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ kind: 'patent' });
    });

    expect(requestedKinds).toContain('patent');
    expect(await screen.findByText('105')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Série histórica — Patentes/i }),
    ).toBeInTheDocument();
  });

  it('aplica filtros na URL e envia os parâmetros para a API v2', async () => {
    const capturedUrls: URL[] = [];

    const { router, user } = await renderRoute('/indicadores', {
      handlers: [
        http.get(simccV2Url('/metrics/production/{kind}'), ({ request }) => {
          capturedUrls.push(new URL(request.url));
          return HttpResponse.json({
            kind: 'article',
            data: [{ period: 2023, value: 50 }],
            filters_applied: {},
            meta: { total: 1 },
          });
        }),
      ],
    });

    await user.type(screen.getByLabelText(/Termo nos títulos/i), 'energia');
    await user.type(screen.getByLabelText(/Ano inicial/i), '2020');
    await user.click(screen.getByRole('button', { name: 'Aplicar' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        q: 'energia',
        year_start: 2020,
      });
    });

    await waitFor(() => {
      const last = capturedUrls[capturedUrls.length - 1];
      expect(last?.searchParams.get('q')).toBe('energia');
      expect(last?.searchParams.get('year_start')).toBe('2020');
    });
  });

  it('exibe estado de erro com ação de tentar novamente quando a API falha', async () => {
    const { user } = await renderRoute('/indicadores', {
      handlers: [
        http.get(simccV2Url('/metrics/production/{kind}'), ({ params }) => {
          if (params.kind === 'patent') {
            return HttpResponse.json(
              {
                error: {
                  code: 'INTERNAL_ERROR',
                  message: 'Falha temporária no serviço de métricas',
                },
              },
              { status: 500 },
            );
          }
          return HttpResponse.json({
            kind: 'article',
            data: [{ period: 2024, value: 380 }],
            filters_applied: {},
            meta: { total: 1 },
          });
        }),
      ],
    });

    await user.click(screen.getByRole('button', { name: /Patentes/i }));

    expect(
      await screen.findByText(/Falha temporária no serviço de métricas/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Tentar novamente/i }),
    ).toBeInTheDocument();
  });
});
