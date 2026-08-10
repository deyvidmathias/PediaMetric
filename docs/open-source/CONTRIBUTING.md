# Contribuindo com o futuro PediaMetric Core

O projeto ainda não recebe contribuições públicas porque não foi publicado. Estas regras antecipam um fluxo local e deverão ser revisadas quando existir repositório público.

## Princípios

- preserve a independência entre Core, WHO Data, Validation e Web;
- não copie fórmulas, cortes ou seleção de referências para a interface;
- não adicione dados WHO ao pacote Core;
- não altere decisões clínicas sem fonte primária e regressão independente;
- nunca inclua dados identificáveis ou medidas reais de pacientes em testes, issues, commits ou logs;
- faça a menor alteração necessária e evite reorganizações oportunistas.

## Fluxo local

1. Leia `AGENTS.md`, `docs/STATUS.md` e o documento temático relevante.
2. Crie um caso de teste que represente o comportamento esperado ou a regressão.
3. Implemente a mudança sem arredondar dentro do Core.
4. Execute `pnpm run verify`.
5. Se houver impacto na Web, execute também o build e valide os estados afetados.
6. Documente decisão durável, fonte e tolerância quando aplicável.

## Mudanças clínicas ou de dados

Uma proposta deve indicar:

- referência oficial exata, versão, URL e data de acesso;
- indicador, sexo e domínio etário afetados;
- valor esperado independente e tolerância;
- casos de fronteira e impacto em compatibilidade;
- direitos aplicáveis se introduzir material de terceiros.

JSON gerado pelo próprio algoritmo não é evidência independente. Mudanças em WHO Data devem preservar origem, hash e transformação reproduzível.

## Mudanças de API

Evite exportar detalhes internos. Alterações incompatíveis devem explicar motivação, migração e impacto no versionamento semântico. Antes da primeira versão pública, a API ainda pode mudar; depois dela, compatibilidade passa a ser requisito explícito.

## Revisão

Uma contribuição futura só deverá ser integrada com testes aprovados, fronteiras preservadas, documentação suficiente e autoria/licença compatíveis. Participação não implica endosso clínico, e o software não substitui avaliação profissional.
