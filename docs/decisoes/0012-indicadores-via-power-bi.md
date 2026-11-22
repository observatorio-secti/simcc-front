# 0012. Indicadores pelos painéis do Power BI

- **Status:** aceita
- **Data:** 2026-11-22

## Contexto

No legado, `/indicadores` era uma página com abas, cada uma com um painel do Power BI embutido ("Indicadores de produção", "Busca de informações", "Programas de pós-graduação"), e os detalhes de instituição e de programa também embutiam painéis. A primeira versão da T7 trocou isso por gráficos próprios sobre `/v2/metrics/production/{kind}` e listou como "aguardando backend" os indicadores que dependiam de rotas novas (`/v2/metrics/search`, `/v2/metrics/graduate-program`).

Os painéis do Power BI são mantidos pela equipe do observatório e não podem ser abandonados. Recalcular os mesmos indicadores na plataforma duplicaria regra de negócio e criaria duas fontes de número para a mesma pergunta.

## Decisão

- Os indicadores ficam nos **painéis do Power BI**. A plataforma **não calcula indicadores próprios**: `/indicadores` embute os painéis, um por aba (`?painel=producao|busca|pos-graduacao`).
- Os detalhes de instituição (aba "Painel", `?tab=panel`) e de programa (seção "Painel", `?painel=producao|discentes`) embutem os painéis do legado. Como no legado, são painéis gerais, não filtrados pela entidade aberta.
- O embed é um componente genérico de `src/shared/ui/power-bi-embed.tsx` (iframe com `title`, `loading="lazy"`, `allowFullScreen` e link "Abrir no Power BI"). Em telas estreitas mostra um card com pré-visualização e link, só por CSS.
- Os links ficam em arquivos de dados das features (`indicators-data.ts`, `institution-panel.ts`, `program-panels.ts`), não em `.env`.
- Os pedidos de `/v2/metrics/search` e `/v2/metrics/graduate-program` ao backend ficam **cancelados**. `/v2/metrics/production/{kind}` continua, usado pelos KPIs da busca (T2).
- Os links são do tipo "publicar na web" (`app.powerbi.com/view?r=…`): **públicos por natureza**. O conteúdo de cada painel é responsabilidade de quem o publica; a plataforma não põe nada sensível neles.

## Consequências

- Mudar um indicador é mudar o painel no Power BI, sem deploy do front. Trocar um link é editar o arquivo de dados da feature.
- O iframe depende do Power BI estar no ar e do relatório seguir publicado. Painel despublicado: marque `unavailable` no arquivo de dados, e a tela mostra um aviso no lugar do iframe.
- Os erros de console de dentro do iframe são do Power BI, não da plataforma.
