# Arquitetura

## Direção

O PediaMetric deve permanecer uma aplicação simples. A Web está funcional e o Core passa a ter um pacote local de extração, ainda privado e sem publicação. Isso não cria workspace, pipeline de release nem inclui os dados WHO no pacote.

## Camadas

```text
PediaMetric Web
      |
      v
API pública do módulo antropométrico
      |
      +---- PediaMetric Core <---- contrato ---- WHO Data
      |
      +---- resultado tipado

Validation verifica Core, WHO Data, integração e fronteiras.
```

### PediaMetric Core

Contém idade, IMC, algoritmos LMS, Z-score, percentil, seleção de referências, ajustes de medida, classificações e plausibilidade. Deve ser TypeScript puro e determinístico. Suas entradas e saídas são tipos públicos; não conhece componentes, navegador, gráficos ou formato visual.

O Core pode depender de um contrato abstrato para obter uma referência, mas não deve importar JSONs WHO concretos. Isso permite testá-lo com dados pequenos em memória e futuramente extraí-lo sem reescrever algoritmos.

### WHO Data

Contém tabelas oficiais, manifesto, metadados, origem, versão, hashes, importação reproduzível e uma implementação do contrato de dados esperado pelo Core. Não classifica resultados e não conhece a Web.

Os arquivos em `docs/anthropometry/` são a referência técnica desta camada. Dados oficiais não devem ser editados manualmente; mudanças devem nascer do importador e ser conferidas contra fonte e hash.

### Validation

Reúne testes unitários, integração Core + WHO Data, regressões contra exemplos oficiais, extremos, integridade e sentinelas arquiteturais. Testes da interface verificam apresentação e interação, não reimplementam fórmulas para produzir o resultado esperado.

### PediaMetric Web

Responsável por React, formulários, estado efêmero, navegação, gráficos, acessibilidade, textos e animações. Importa somente a fachada pública do módulo antropométrico. Pode converter texto de campos em entradas tipadas e arredondar para exibição, mas não escolhe referência WHO, cortes, correções ou fórmulas.

## Estrutura-alvo incremental

```text
src/
  app/                       composição e inicialização
  assets/brand/              logo e recursos otimizados
  components/ui/             componentes visuais reutilizáveis
  features/assessment/       formulário e fluxo
  features/results/          apresentação de resultados
  features/charts/           gráficos sem regras clínicas
  features/anthropometry/    API pública, Core e WHO Data
  styles/                    tokens e estilos globais
tests/                       validação automatizada
docs/                        documentação viva e referências
```

Essa estrutura será criada conforme a Web avançar. Não mover arquivos só para atingir antecipadamente a árvore ideal.

## Fluxo de dados

1. O estado do formulário existe apenas na memória da página.
2. A Web normaliza formatos de entrada e chama a fachada pública.
3. A fachada conecta Core e provedor WHO.
4. O Core retorna um resultado tipado completo.
5. Resultados e gráficos usam a mesma resposta; nenhum valor clínico é derivado na Web.
6. Limpar ou fechar a página descarta a avaliação.

Não colocar dados clínicos em query strings, `localStorage`, IndexedDB, cookies, logs ou analytics. Caso telemetria seja introduzida no futuro, ela deve observar apenas eventos genéricos sem conteúdo clínico e exigir decisão explícita.

## Dependências e desempenho

Preferir React, TypeScript e Vite, CSS com tokens e uma biblioteca de movimento. Introduzir biblioteca de gráfico somente após validar peso, acessibilidade e necessidade. Não adicionar gerenciador global de estado, framework de formulários ou sistema de rotas antes de existir complexidade que os justifique.

Datasets e gráficos podem ser carregados sob demanda. Fontes devem usar sistema local ou arquivos próprios. Animações devem priorizar `transform` e `opacity`, respeitar `prefers-reduced-motion` e nunca bloquear entrada ou resultado.

## Regra de evolução

Uma mudança estrutural precisa resolver um problema atual ou reduzir concretamente o custo da futura extração. O pacote local de Core é gerado da fonte canônica já usada pela Web, evitando cópia manual e divergência. Ele permanece privado até passarem os gates de API, licença, segurança, conteúdo e autorização de publicação. WHO Data não pertence a esse pacote e conserva termos próprios.
