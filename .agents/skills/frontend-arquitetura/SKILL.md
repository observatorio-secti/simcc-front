---
name: frontend-arquitetura
description: >-
  Diretrizes de arquitetura frontend profissional (Design System como contrato, Design Tokens, arquitetura de acessibilidade a11y, foco dinâmico, ARIA, observabilidade de frontend, Error Boundaries e Core Web Vitals). Use ao estruturar componentes, implementar acessibilidade, definir contratos visuais ou configurar observabilidade.
---

# Diretrizes de Arquitetura de Frontend Profissional

Este documento estabelece as diretrizes e padrões arquiteturais para o desenvolvimento de aplicações frontend de alta escala, garantindo consistência visual, acessibilidade nativa e visibilidade operacional sob cenários reais de uso.

---

## 1. Utilizar Design System como Contrato

Um **Design System (DS)** maduro e profissional vai muito além de uma simples biblioteca de componentes visuais ou guia de estilos (style guide); ele atua como um **contrato técnico e visual rígido** entre design e engenharia, e entre diferentes times de desenvolvimento.

### Descrição e Princípios
* **Consistência por Herança:** As regras de interface (como a cor que representa um estado de erro, o espaçamento entre seções, o comportamento de carregamento de um botão e a forma como as validações de campo são exibidas) devem ser encapsuladas e padronizadas dentro dos componentes base do DS. 
* **Prevenção de Exceções:** Sem um contrato bem definido, cada tela do sistema tende a virar uma exceção de implementação. Por exemplo, um campo de formulário implementado de forma isolada pode exibir uma mensagem de erro acima do campo, enquanto em outra tela a mensagem aparece abaixo, e em uma terceira tela apenas a borda muda de cor. Ao embutir essas regras de comportamento diretamente no componente de input básico do DS, qualquer tela (seja de cadastro ou checkout) herdará exatamente o mesmo comportamento consistente e previsível.
* **Tokens de Design (Design Tokens):** Toda propriedade visual fundamental (cores, tipografia, espaçamentos, sombras) deve ser parametrizada através de tokens. Se a cor primária da marca mudar, a alteração no token propaga automaticamente para todos os componentes. Inserir cores "hardcoded" (na mão) diretamente nos arquivos do projeto viola este contrato, quebra o padrão visual do produto e introduz débito técnico de difícil manutenção.

### Requisitos Arquiteturais
1. **Proibição de Estilos Hardcoded:** É proibido o uso de valores arbitrários para propriedades de cores, espaçamentos ou fontes fora do catálogo de tokens oficiais.
2. **Componentização Centralizada:** Telas novas não devem recriar elementos básicos. Toda e qualquer variação de componentes deve ser discutida para ser integrada ao Design System corporativo em vez de tratada como uma regra local customizada.

---

## 2. Implementar Arquitetura de Acessibilidade

Acessibilidade avançada e profissional (a11y) não é uma camada opcional adicionada após a entrega da tela; ela deve ser implementada como parte da própria **arquitetura fundacional do componente** de interface desde o primeiro dia.

### Descrição e Princípios
* **Comportamento Dinâmico de Foco:** Componentes interativos complexos devem gerenciar ativamente o foco do teclado para garantir usabilidade sem mouse. 
  * **Menus Suspensos / Popovers:** Ao serem abertos, o foco do teclado deve ser movido para dentro do menu, permitir a navegação entre os itens com as setas do teclado, fechar a interface ao pressionar a tecla `ESC` e, crucialmente, devolver o foco de volta para o elemento acionador original.
  * **Modais:** Devem implementar obrigatoriamente um mecanismo de captura de foco (*focus trap*), impedindo que o usuário navegue via tecla `Tab` por elementos que estão escondidos atrás do modal enquanto ele estiver aberto.
* **Complexidade sob o Capô:** A construção de componentes customizados exige profunda atenção aos detalhes de interação. Um componente de *Combobox*, por exemplo, parece visualmente simples (um campo de texto acoplado a uma lista dropdown), mas debaixo do capô ele exige a coordenação precisa entre navegação via teclado, indicador visual da opção ativa, filtros dinâmicos de busca, fechamento com `ESC`, seleção de itens com `Enter` e o fechamento do dropdown ao clicar fora da área. Tentar refazer essa lógica em cada tela de forma isolada inevitavelmente introduz bugs, perda de foco e quebra a navegação acessível.
* **Anúncio de Estados Dinâmicos:** Quando uma tela é atualizada dinamicamente (como a exibição de uma mensagem de erro ou uma alteração de preço após uma chamada de API), usuários de leitores de tela precisam receber esse feedback em tempo real. A arquitetura de componentes de mensagem e feedback deve utilizar regiões de anúncio ativo (como `aria-live`) para notificar o usuário sobre alterações assíncronas do estado do aplicativo.

### Requisitos Arquiteturais
1. **Uso de Primitivos Acessíveis:** Preferir o uso de bibliotecas de componentes não-estilizados focadas em acessibilidade (como Radix UI, Headless UI ou React Aria) como base para a estilização local do Design System, reduzindo a necessidade de recriar lógica de teclado e atributos ARIA do zero.
2. **Validação Contínua:** Implementar testes automatizados de acessibilidade integrados na esteira de CI/CD (usando ferramentas como Axe Core) e realizar auditorias de navegação usando apenas o teclado.

---

## 3. Configurar Observabilidade de Frontend

Quando uma aplicação frontend profissional é entregue ao navegador de milhares de usuários reais, o monitoramento tradicional no servidor (backend) torna-se insuficiente. O backend pode reportar estabilidade de 100%, enquanto os usuários enfrentam uma interface inutilizável ou quebrada localmente.

### Descrição e Princípios
* **A Natureza dos Erros no Cliente:** No ambiente do usuário final, bugs críticos ocorrem devido a fatores fora do controle do servidor: downloads de pacotes de código (*chunks*) que falham devido a instabilidades de rede, extensões de navegador instaladas que interferem no comportamento da aplicação, navegadores antigos que não suportam certas APIs, ou caminhos e combinações muito específicas de cliques de usuário que nunca foram reproduzidos nos ambientes de teste locais. Sem uma camada dedicada de observabilidade, os relatos de falhas serão vagos, superficiais e impróprios para diagnóstico imediato.
* **Componentes de Telemetria e Diagnóstico:**
  * **Source Maps em Produção:** Devem ser enviados de forma segura e privada para o serviço de observabilidade para que, quando um erro minificado ocorrer no cliente, a pilha de erro (*stack trace*) seja traduzida de volta para os nomes de arquivos e linhas originais do código-fonte.
  * **Release Tracking:** O rastreamento de versões correlaciona a incidência de novos erros diretamente com deploys específicos, facilitando *rollbacks* rápidos quando uma nova versão introduz instabilidade.
  * **Error Boundaries (Limites de Erro):** A aplicação deve implementar limites de erro estruturais que evitam que uma falha isolada em um componente secundário (como uma barra lateral de recomendações) derrube a página inteira. O componente problemático é isolado e um fallback amigável é exibido enquanto o resto da tela continua perfeitamente interativo.
  * **Session Replay (Gravação de Sessão):** Permite recriar visualmente a sequência exata de interações, cliques, e movimentos de tela do usuário que antecederam o erro, agilizando drasticamente a reprodução do bug pelo time de engenharia.
* **Monitoramento de Métricas de Experiência Real (Core Web Vitals):** 
  A observabilidade no frontend deve monitorar ativamente a experiência do usuário real no campo de produção (RUM - Real User Monitoring), acompanhando métricas cruciais como:
  * **LCP (Largest Contentful Paint):** Mede o tempo em que o conteúdo principal da tela leva para ser renderizado de forma visível.
  * **INP (Interaction to Next Paint):** Mede o atraso na resposta de qualquer clique ou interação do usuário com a tela antes que ocorra a próxima atualização visual (pintura de frame).
  * **CLS (Cumulative Layout Shift):** Mede a quantidade de mudanças inesperadas no layout da página que ocorrem durante o carregamento.

### Requisitos Arquiteturais
1. **Instrumentação Global:** Centralizar a captura de exceções não tratadas (através de serviços como Sentry, Datadog ou LogRocket) no ponto de entrada da aplicação.
2. **Definição de SLOs/SLIs de Performance:** Estabelecer limites de tolerância para o INP e LCP com alertas automáticos em caso de degradação das métricas de interação após novas entregas de código.
