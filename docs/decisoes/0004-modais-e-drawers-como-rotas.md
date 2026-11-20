# 0004. Modais e drawers: rota quando há identidade, estado local quando é efêmero

- **Status:** aceita
- **Data:** 2026-11-20

## Contexto

No legado, quatro stores zustand (`useModal`, `useModalSecundary`, `useModalResult`, `useModalSidebar`) controlavam modais pela aplicação inteira. Os dados iam num objeto com cerca de 90 campos opcionais, o tipo do modal aceitava qualquer string, e a store secundária existia só para permitir um modal sobre outro. O drawer do pesquisador buscava dados sozinho, fechava a si mesmo quando a API voltava vazio e simulava progresso com `setTimeout`. Abrir um pesquisador não gerava link.

## Decisão

- **Entidade com identidade** (pesquisador, programa, grupo, instituição, produção) é **rota**. Se a experiência pedir um drawer sobre a lista, o drawer é uma rota com overlay: a lista continua montada por baixo, a URL muda e o botão voltar fecha o drawer.
- **Interação efêmera** (confirmar, compartilhar, filtros no mobile, menu) é **estado local** do componente que abre, com os primitivos `Dialog`, `Sheet` e `Drawer` de `src/shared/ui/`.
- **Não existe store global de modais.** Se um caso exigir abrir algo de longe, a solução é navegar.

## Consequências

- Todo pesquisador, programa ou produção aberto tem link compartilhável.
- Não há como um modal herdar dados de outro.
- A página e o drawer de uma entidade usam os mesmos componentes da entidade, com variações de layout.
