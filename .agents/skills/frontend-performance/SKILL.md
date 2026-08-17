---
name: frontend-performance
description: >-
  Diretrizes de performance no frontend (pipeline de renderização do navegador, aceleração por GPU, agendamento de tarefas e Event Loop, arquitetura de bundle, code splitting, tree shaking, otimização de thread principal e INP, virtualização de listas). Use ao analisar ou otimizar desempenho, fluidez de renderização e carregamento de código.
---

# Diretrizes de Performance de Frontend Profissional

Este documento define as diretrizes fundamentais para a criação de interfaces responsivas, otimizando o consumo de recursos de hardware do cliente, agilizando o carregamento de arquivos na rede e garantindo que cada interação do usuário receba um feedback imediato e fluido na tela.

---

## 1. Priorizar Pipeline de Renderização do Navegador

A otimização de performance no frontend profissional começa no entendimento de como o navegador processa as instruções e desenha os pixels na tela, muito antes de qualquer decisão ligada a frameworks javascript (como React, Angular, Vue ou Svelte).

### Descrição e Princípios
Quando qualquer alteração de estado ocorre na interface — seja uma classe CSS aplicada, um texto atualizado ou a exibição de um menu dropdown —, o navegador não atualiza a tela instantaneamente ou de forma arbitrária. Ele percorre obrigatoriamente um pipeline sequencial de cinco etapas:
1. **JavaScript:** Execução de scripts que disparam alterações visuais.
2. **Style (Cálculo de Estilo):** Mapeamento e aplicação das regras CSS aos elementos que correspondem à árvore DOM, gerando o CSSOM.
3. **Layout (Reflow):** O navegador calcula o espaço físico, tamanho e as coordenadas geométricas que cada elemento ocupará na tela. Esta etapa é extremamente custosa, pois a mudança de um único elemento pode encadear um recálculo de todo o layout da página.
4. **Paint (Pintura / Rasterização):** Preenchimento dos pixels individuais na tela (cores, bordas, sombras, imagens) divididos em camadas (layers).
5. **Composite (Composição de Camadas):** O navegador junta e sobrepõe todas as camadas geradas na etapa anterior para pintar o frame final que o usuário vê na tela.

### Boas Práticas e Impacto
* **Evitar Layout Triggers:** Para obter animações e interações a 60 FPS (frames por segundo), deve-se evitar disparar as etapas de *Layout* e *Paint* repetidamente. 
* **Priorizar Propriedades Aceleradas por Hardware:** Alterações de posicionamento ou exibição devem priorizar propriedades que pulam as etapas de Layout e Paint, rodando diretamente na GPU durante o processo de *Composite*. Em vez de animar propriedades como `top`, `left`, `margin`, `width` ou `height` (que disparam recálculos pesados de Layout), deve-se utilizar `transform` (para translações e escalas) e `opacity` (para transparências).

---

## 2. Gerenciar Event Loop e Tarefas (Event Loop Scheduling)

O ambiente do navegador compartilha uma única thread de execução (a *thread principal* ou *main thread*) para processar tarefas muito diferentes, incluindo eventos de clique, timers, execução de promessas (Promises), renderização visual e listeners de scroll. Se todas as ações disputarem o mesmo espaço de forma desorganizada, o navegador apresentará travamentos visíveis para o usuário.

### Descrição e Princípios
O desenvolvimento profissional exige o entendimento exato de como as tarefas entram e saem das filas do Event Loop:
* **Fila de Tarefas (Macrotasks):** Onde entram tarefas agendadas por APIs como `setTimeout` e `setInterval`. O navegador executa uma única macrotarefa por ciclo e pode dar preferência à renderização da tela antes de iniciar a próxima.
* **Fila de Microtasks:** Onde entram resoluções de `Promise.then` e chamadas de `queueMicrotask`. **Impacto Crítico:** As microtasks têm prioridade absoluta e o Event Loop esvazia toda a fila de microtasks antes de renderizar o próximo frame ou seguir para outra tarefa. Executar microtasks pesadas em sequência cria um gargalo instransponível, deixando o navegador congelado e incapaz de atualizar a tela.
* **requestAnimationFrame (rAF):** Uma API que roda trechos de código imediatamente antes de o navegador pintar o próximo frame. É ideal para sincronizar manipulações visuais diretamente com a taxa de atualização física da tela.

### Estratégias de Scheduling
Um frontend bem feito não executa blocos massivos de processamento síncrono de uma única vez, especialmente durante interações de alta frequência, como a digitação em um campo de texto (`input`). Para evitar travamentos, deve-se adotar as seguintes abordagens:
1. **Adiar e Dividir (Chunking):** Quebrar tarefas longas em pequenos pedaços intercalados por pausas que permitam ao navegador atualizar a interface do usuário entre cada pedaço (utilizando mecanismos como `requestIdleCallback` ou yielders modernos de agendamento).
2. **Uso de Web Workers:** Mover processamentos puramente matemáticos, lógicas de tratamento de dados pesadas ou parseamento de grandes JSONs para uma thread em segundo plano (Web Worker), mantendo a thread principal livre para responder à interação do usuário.

---

## 3. Otimizar Arquitetura de Bundle

Durante o desenvolvimento, dividimos o código em múltiplos arquivos e módulos para melhor organização. No entanto, o navegador do usuário final em produção precisa baixar pacotes compilados e minificados (os chamados *chunks*) gerados pelo bundler (como Webpack, Vite, Rollup ou Esbuild).

### Descrição e Princípios
O bundler analisa o grafo de dependências (`imports`) do projeto para organizar e empacotar os arquivos. Se essa arquitetura não for intencionalmente estruturada, o usuário sofrerá com o download de pacotes desnecessariamente gigantescos.
* **Code Splitting (Divisão de Código):** Permite fatiar a aplicação em pacotes menores que são carregados sob demanda (lazy loading). Se um gráfico analítico pesado é exibido apenas na tela de administração, ele jamais deve ser empacotado no bundle inicial que o usuário do checkout baixa ao acessar a aplicação. O code splitting isola esse gráfico em um chunk dinâmico carregado apenas quando a rota administrativa for realmente acessada.
* **O Trade-off do Excesso:** Dividir excessivamente os arquivos pode gerar um efeito colateral prejudicial, onde uma navegação simples exige dezenas de pequenas requisições de rede HTTP simultâneas, atrasando a renderização final. A divisão deve buscar um equilíbrio saudável entre o tamanho do arquivo e a quantidade de requests simultâneas.
* **Tree Shaking:** O build tenta eliminar "código morto" (código exportado, mas nunca importado ou utilizado). Para que isso funcione de forma eficaz, a estrutura do projeto deve cooperar usando a sintaxe estática de ES Modules (`import/export`). Bibliotecas com estruturas de exportação complexas, dinâmicas ou que causam efeitos colaterais (side effects) impedem a remoção de código não utilizado, obrigando o bundler a ser conservador e manter arquivos mortos no pacote final de produção.

### Requisitos de Entrega
A arquitetura de bundle deve responder claramente à estratégia de entrega do app: quais recursos carregar imediatamente, o que carregar de forma preguiçosa (lazy), quais arquivos de bibliotecas terceiras ficam sob cache de longo prazo e como tratar amigavelmente falhas de download de chunks dinâmicos causadas por interrupções temporárias na internet do cliente.

---

## 4. Monitorar Performance da Thread Principal e INP

A qualidade de uma interface interativa é altamente correlacionada com a velocidade de resposta aos comandos do usuário. O principal indicador de frustração visual em sites modernos é medido através do **INP (Interaction to Next Paint)**.

### Descrição e Princípios
O **INP** é uma métrica que avalia o atraso de resposta a interações feitas pelo usuário (como cliques, toques na tela ou digitação) até o exato momento em que o navegador renderiza o próximo frame com a confirmação visual daquela ação.
* **O Problema da Thread Principal Ocupada:** Se ao clicar em um botão para filtrar e ordenar uma lista, a aplicação tenta reordenar, recalcular e renderizar instantaneamente 10.000 linhas de dados manipulando o DOM de uma só vez, a thread principal ficará bloqueada. Durante esse bloqueio, a tela não responde, criando uma sensação nítida de lentidão e travamento.
* **Virtualização de Listas (Windowing):** Para manter a thread principal livre em telas de dados densos, deve-se adotar a virtualização do DOM. Em vez de criar milhares de elementos HTML físicos na página para todos os registros que existem na lista, a aplicação renderiza dinamicamente apenas os elementos visíveis na janela de visualização (*viewport*) do usuário atual, economizando recursos computacionais drásticos de Layout e Paint.
* **Diagnóstico Científico do Gargalo:**
  * Se o problema está em cálculos repetidos desnecessariamente, a solução está em técnicas de **Memoização** de funções ou cache de valores computados.
  * Se o gargalo ocorre ao tentar desenhar e manipular elementos HTML na página, a resposta está na **Virtualização** ou simplificação do DOM.
  * Se o problema é o atraso no primeiro toque do usuário porque o navegador ainda está interpretando e compilando uma montanha de JavaScript, o gargalo está na **Arquitetura de Bundle** e no tamanho do código inicial enviado ao navegador.
