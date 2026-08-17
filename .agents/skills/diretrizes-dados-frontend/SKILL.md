---
name: diretrizes-dados-frontend
description: >-
  Diretrizes de arquitetura de dados e gerenciamento de estado no frontend (separação de estados local, servidor e URL; cache, invalidação e atualização otimista; estratégias de SSR, hidratação e streaming). Use ao projetar ou implementar gerenciamento de estado, consumo de APIs, sincronização de dados ou renderização.
---

# Diretrizes de Arquitetura de Dados no Frontend Profissional

Este documento estabelece as diretrizes de engenharia de software para o gerenciamento de dados e estados em aplicações frontend profissionais. Ele afasta-se de abordagens simplistas de "tutoriais" para focar em resiliência, performance de renderização, consistência e experiência do usuário no mundo real.

---

## 1. Separação de Estados: Local, Servidor e URL

Um dos principais fatores de bugs em aplicações frontend é o tratamento homogêneo de dados de naturezas distintas. Para evitar que a aplicação se torne uma "caixa preta" de difícil manutenção, dividimos os estados em três categorias bem definidas:

```
┌────────────────────────────────────────────────────────┐
│                   Arquitetura de Estado                │
├───────────────────┬───────────────────┬────────────────┤
│   Estado Local    │ Estado do Servidor│   Estado da URL│
│  (UI Temporária)  │ (Cache & Contrato)│  (Filtros & Naveg)│
└───────────────────┴───────────────────┴────────────────┘
```

### A. Estado Local (UI Temporária)
*   **Definição:** Informações efêmeras controladas e consumidas exclusivamente dentro de um componente ou em uma árvore de componentes muito próxima.
*   **Exemplos Clássicos:** O texto temporário digitado pelo usuário em um campo de entrada (input), o estado aberto/fechado de um menu de navegação, ou a aba atualmente ativa em uma interface de abas.
*   **Regra de Ouro:** Não deve ser compartilhado globalmente desnecessariamente. Pertence ao ciclo de vida de renderização do componente local.

### B. Estado do Servidor (Cache & Sincronização)
*   **Definição:** Dados armazenados persistidos no banco de dados do backend que são consumidos pelo frontend.
*   **Exemplos Clássicos:** Dados de perfil do usuário logado, lista de produtos disponíveis em uma busca, ou o conteúdo de um carrinho de compras.
*   **Características Críticas:** Este dado não pertence ao frontend; o frontend possui apenas uma cópia local temporária. Ele pode ficar obsoleto (stale), pode falhar ao ser carregado ou alterado, e pode ser modificado simultaneamente por outros usuários ou processos em background.
*   **Regra de Ouro:** Deve seguir um contrato rigoroso com a API do servidor e utilizar ferramentas específicas de sincronização, cache e invalidação, em vez de ser jogado diretamente em estados globais genéricos da UI.

### C. Estado da URL (Compartilhável e Navegável)
*   **Definição:** Dados que representam o estado atual da tela que precisam sobreviver ao recarregamento da página (refresh) ou que devem ser compartilhados de forma idêntica entre usuários.
*   **Exemplos Clássicos:** Parâmetros de ordenação de uma tabela, filtros aplicados a uma busca de produtos, ou o ID de um item selecionado em um painel detalhado.
*   **Regra de Ouro:** Se o usuário deve ser capaz de copiar o link do navegador, enviar para outra pessoa, e essa pessoa ver exatamente o mesmo conteúdo com os mesmos filtros aplicados (ou conseguir usar os botões "Voltar" e "Avançar" do navegador de forma previsível), esse dado **obrigatoriamente** deve residir nos parâmetros da URL (Query Params ou Path Params).

---

## 2. Ciclo de Vida do Dado do Servidor: Cache, Invalidação e Atualização Otimista

Buscar dados do servidor a cada renderização degrada a performance do cliente e sobrecarrega a infraestrutura de backend. Portanto, gerenciar o ciclo de vida da cópia local do dado do servidor é um requisito essencial.

### A. Estratégia de Caching
*   **Objetivo:** Evitar requisições de rede duplicadas e desnecessárias durante a navegação entre telas, promovendo carregamentos instantâneos.
*   **Funcionamento:** Armazena-se uma cópia em memória das respostas do servidor mapeadas por chaves de consulta exclusivas (Query Keys). Ao navegar de volta para uma tela já visitada, a UI exibe imediatamente o cache guardado antes de decidir se precisa fazer uma nova requisição em background.

### B. Estratégias de Invalidação de Cache
Manter dados em cache traz o perigo de exibir informações desatualizadas (stale data). A sincronização correta requer regras explícitas de invalidação quando ocorrem mutações (escritas/alterações no servidor):
1.  **Invalidação Reativa (Refetch automático):** Sempre que uma mutação é executada com sucesso (ex: adicionar um item), a chave da consulta associada é explicitamente marcada como obsoleta (*stale*). Isso dispara automaticamente uma nova busca (refetch) em segundo plano para trazer o dado real e atualizado.
2.  **Atualização Direta do Cache local:** Em cenários específicos, a resposta de sucesso da API de mutação já retorna o objeto atualizado. Podemos injetar diretamente esse novo dado no cache da chave correspondente, poupando um refetch de rede adicional.

### C. Atualizações Otimistas (Optimistic Updates)
Para garantir uma percepção de interface instantânea em conexões de alta latência, adotamos a atualização otimista na interface do usuário (UI).

```
[Ação do Usuário (ex: Clique no Carrinho +)]
           │
           ├──► 1. Atualiza imediatamente a UI (Simula sucesso)
           ├──► 2. Salva o estado anterior (Backup)
           └──► 3. Dispara a requisição de API
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   [Caso Sucesso]          [Caso Erro]
  Mantém a UI como tá      Restaura backup (Rollback)
                           Informa o usuário sobre falha
```

*   **Trade-offs e Desafios Técnicos:**
    *   **Controle de Concorrência:** Gerenciar múltiplas ações rápidas do usuário (ex: clicar 5 vezes seguidas no botão "+" do carrinho) antes que a primeira requisição retorne.
    *   **Lógica de Reversão (Rollback):** Se a requisição de rede falhar por instabilidade ou rejeição de regra de negócio no backend, o frontend deve reverter a UI para o estado exato anterior sem corromper outros dados.
    *   **Feedback Visual de Pendência:** Enquanto a resposta oficial da API não chega, a UI deve indicar sutilmente que o processo está pendente (ex: opacidade reduzida ou spinner discreto), sem bloquear a interação do usuário.

---

## 3. Renderização Avançada: SSR, Hidratação e Streaming

As estratégias de carregamento e montagem da página ditam as métricas cruciais de experiência do usuário, como o *Largest Contentful Paint* (LCP - tempo de carregamento principal) e o *Interaction to Next Paint* (INP - atraso de interação).

### A. SSR (Server-Side Rendering)
*   **Como Funciona:** Em vez de enviar um documento HTML quase vazio para o navegador e esperar que o bundle de JavaScript baixe e renderize a tela do zero, o servidor executa a aplicação frontend, faz as requisições iniciais de dados, monta o HTML com o conteúdo completo e o envia pronto para o navegador.
*   **Benefícios:**
    *   **LCP Otimizado:** O conteúdo principal (texto, imagens iniciais) aparece na tela quase de imediato para o usuário.
    *   **Excelente SEO:** Mecanismos de busca (como os crawlers do Google) conseguem indexar o conteúdo facilmente a partir do primeiro HTML estático.

### B. O Processo de Hidratação (Hydration)
*   **Como Funciona:** Embora o HTML gerado pelo SSR apareça renderizado na tela de forma rápida, ele ainda é puramente estático — um "retrato" sem interatividade. A hidratação é a etapa subsequente em que o navegador baixa o bundle de JavaScript, analisa o HTML existente e anexa os escutadores de eventos (event listeners), estados locais e comportamentos interativos a esses elementos de tela.
*   **Ponto de Atenção Profissional:** Há um período delicado conhecido como "vale da interatividade" entre a exibição do HTML (usuário consegue ver a página) e o fim da hidratação (usuário consegue interagir). Se o JavaScript for pesado ou demorar para processar, o usuário tentará interagir (como clicar em um filtro) e experimentará travamentos ou input lag severo (prejudicando a métrica INP).

### C. Streaming de HTML com Suspense/Skeletons
*   **Como Funciona:** Tradicionalmente, o SSR exige que o servidor aguarde a conclusão de **todas** as requisições de banco de dados e APIs antes de enviar o primeiro caractere de HTML para o cliente. Isso cria gargalos quando alguma API de backend é lenta.
*   **O Streaming resolve isso:** O servidor envia imediatamente a estrutura básica da página (cabecalho, rodapé e esqueletos de carregamento — *skeletons*). À medida que os dados assíncronos mais lentos vão sendo finalizados no servidor, os blocos de HTML correspondentes a essas seções são enviados (transmitidos via stream) pelo mesmo canal de conexão e inseridos dinamicamente nos locais corretos na tela.
*   **Vantagem:** O usuário vê e pode começar a ler partes da página imediatamente, sem ficar bloqueado pela requisição mais lenta do backend.
