# Regras de trabalho — PediaMetric

## Objetivo atual

Manter o **PediaMetric Web** funcional e o repositório completo pronto para
publicação open source, sem versionar ou sublicenciar WHO Data.

Não publicar pacotes npm nem implantar o site sem autorização explícita. O
pacote local `@pediametric/core` deve permanecer com `private: true` até o gate
de publicação. Arquivos em `vendor/sources/` e dados em `data/generated/` são
locais, ignorados pelo Git e nunca devem entrar em commits públicos.

## Fronteiras obrigatórias

- **PediaMetric Core:** cálculos, Z-scores, percentis, classificações, plausibilidade e interpretação das referências WHO. Não depende de React, DOM, CSS, gráficos, rede ou armazenamento.
- **WHO Data:** tabelas oficiais, manifesto, origem, versão, hashes e carregamento validado. Não contém regras de interface.
- **Validation:** regressões oficiais, casos extremos, integridade dos dados e limites arquiteturais.
- **PediaMetric Web:** formulários, gráficos, textos e experiência. Consome apenas a API pública do módulo antropométrico; nunca copia fórmulas, cortes clínicos ou seleção de referências.

Dados inseridos pelo usuário permanecem locais. Não usar APIs, telemetria, logs, URLs, cookies ou armazenamento persistente para medidas clínicas.

A licença permissiva do Core não cobre WHO Data, fontes WHO, marca, nome ou emblema da organização. Não copiar datasets para o pacote Core nem declarar autorização de redistribuição sem revisão específica dos termos oficiais e decisão registrada.

## Forma de trabalhar

1. Antes de editar, ler `docs/STATUS.md` e apenas o documento temático necessário.
2. Fazer a menor mudança que satisfaça o aceite; preservar dados e testes existentes.
3. Um agente deve ser responsável por cada arquivo durante uma tarefa.
4. Não executar agentes em paralelo sobre arquivos ou decisões acopladas.
5. Atualizar `docs/STATUS.md` ao concluir um marco; registrar em `docs/DECISIONS.md` somente decisões duráveis.
6. Validar proporcionalmente ao risco e executar uma única passagem final por área de aceite.

## Agentes e modelos

- Agente principal: arquitetura, integração e decisão final.
- Construtor Web: componentes, estilos, responsividade e animações.
- Revisor clínico: Core, WHO Data e interpretação; preferencialmente somente leitura durante trabalho da Web.
- Revisor de qualidade: testes, acessibilidade e desempenho.

Usar no máximo dois subagentes simultâneos. Tarefas mecânicas e documentação podem usar um modelo equilibrado com esforço baixo; implementação cotidiana, esforço médio; mudanças clínicas, privacidade, arquitetura difícil ou regressões persistentes, modelo de maior capacidade com esforço alto. `max`/`ultra` não são padrão.

## Verificação e segurança

- Executar `pnpm run verify` após alterações no motor, dados ou configuração TypeScript.
- Para a Web, validar estados vazio, inválido, carregando, resultado e erro; teclado, contraste, movimento reduzido e larguras de 360 a 1440 px.
- Não arredondar dentro do Core; arredondamento pertence à apresentação.
- Alertas e resultados não substituem avaliação profissional.
- Não alterar `docs/anthropometry/` sem evidência técnica e escopo explícito.
