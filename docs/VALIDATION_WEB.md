# Validação do PediaMetric Web

## Objetivo

Confirmar que a interface é correta, privada, acessível, responsiva e rápida sem duplicar a validação matemática já mantida no módulo antropométrico. Os resultados da Web devem ser uma apresentação fiel da API pública.

## Pirâmide de verificação

### 1. Fronteiras arquiteturais

- Core não importa React, DOM, CSS, componentes ou WHO Data concreto.
- WHO Data implementa o contrato esperado pelo Core.
- Web importa a fachada pública, não arquivos internos de `engine/` ou `data/`.
- nenhuma fórmula LMS, ponto de corte ou seleção de referência aparece na Web.
- rede e persistência continuam ausentes do fluxo clínico.

### 2. Componentes e interação

Cobrir campos obrigatórios, unidades, datas, sexo de referência, posição da medida, mensagens de erro, correção, submissão e limpeza. Validar estados vazio, parcialmente preenchido, inválido, processando, resultado e falha inesperada.

Um teste de integração deve fornecer uma entrada conhecida, acionar a fachada real e confirmar que cartões, alertas e gráfico recebem o mesmo resultado tipado. Não reproduzir a fórmula no teste da Web; fixtures esperadas devem vir de regressões aprovadas do Core.

### 3. Privacidade

Verificar que medidas e datas não são escritas em:

- URL ou histórico de navegação;
- `localStorage`, `sessionStorage`, IndexedDB ou cookies;
- chamadas de rede, analytics, logs ou mensagens de erro;
- atributos DOM desnecessários e nomes de arquivos exportados.

Após limpar, voltar ou recarregar, a avaliação não deve reaparecer.

### 4. Acessibilidade

- navegação completa por teclado e foco visível;
- rótulos, unidades, instruções e erros associados aos campos;
- anúncio de erro e resultado sem mudança de foco imprevisível;
- contraste compatível com WCAG 2.2 AA;
- significado independente de cor;
- gráfico acompanhado por resumo textual;
- experiência estável com `prefers-reduced-motion`.

Executar verificação automatizada e inspeção manual curta. Auditoria automática não substitui teclado, leitura visual e conferência de linguagem.

### 5. Responsividade e visual

Realizar smoke test em 360, 390, 768, 1024 e 1440 px. Conferir cabeçalho, formulário, teclado móvel, cartões, eixos, legendas, modais, alertas e ações. Não aceitar rolagem horizontal de página, texto cortado ou ação essencial dependente de hover.

Capturas de referência devem ser atualizadas apenas quando a mudança visual for intencional.

#### Registro visual — 2026-08-10

- versão local e publicação em `https://pediametric.netlify.app/` carregadas sem erros ou avisos no console;
- tela inicial conferida em 1440 × 1000 px;
- formulário conferido em 390 × 844 px após a ação **Iniciar avaliação**;
- referências salvas em `docs/screenshots/pediametric-desktop.png` e `docs/screenshots/pediametric-mobile.png`.

Este registro é um smoke visual direcionado e não substitui a passagem completa
em todas as larguras listadas acima nem a avaliação clínica de ponta a ponta.

### 6. Desempenho

Metas iniciais de auditoria: desempenho e acessibilidade iguais ou superiores a 90 em ambiente controlado, LCP abaixo de 2,5 s e CLS abaixo de 0,1. Tratar como metas, não garantias universais. Conferir tamanho do bundle, carregamento sob demanda de dados/gráficos, ausência de trabalho contínuo e animações baseadas em `transform`/`opacity`.

## Passagem de aceite

Ao concluir um marco:

1. executar verificação TypeScript e testes automatizados;
2. validar uma avaliação conhecida de ponta a ponta;
3. executar smoke responsivo e teclado;
4. verificar rede e armazenamento;
5. registrar somente resultados, limitações e riscos relevantes em `docs/STATUS.md`.

Evitar rodar a mesma suíte repetidamente sem mudança relacionada. Uma passagem final por área de aceite é suficiente quando não há falhas.

## Bloqueadores de entrega

- divergência entre Web e resposta do Core;
- cálculo clínico duplicado na interface;
- vazamento ou persistência de dados digitados;
- regressão das referências WHO;
- fluxo principal inacessível por teclado;
- layout inutilizável em 360 px;
- erro silencioso ou classificação apresentada como diagnóstico.

