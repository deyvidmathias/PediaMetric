# Estado atual

Atualizado em: 2026-08-10.

## Objetivo ativo

Consolidar o **PediaMetric Web** publicado e manter o **PediaMetric Core** pronto
para futura extração, sem redistribuir WHO Data e sem publicar npm neste marco.

## Já disponível

- motor TypeScript puro com idade, IMC, LMS, Z-score, percentil, classificações e plausibilidade;
- referências WHO 2006 e 2007 baixadas sob demanda, manifesto e importação local reproduzível;
- documentação de fontes, decisões clínicas e validação em `docs/anthropometry/`;
- 35 testes automatizados aprovados neste marco;
- direção visual aprovada e logo PediaMetric fornecida;
- documentação operacional do produto criada;
- aplicação pública em `https://pediametric.netlify.app/`;
- screenshots desktop, mobile e das curvas versionados em `docs/screenshots/`;
- release pública `v0.2.0` criada no GitHub;
- Core CI aprovado em Node.js 22 e 24.

## Concluído neste marco

1. Core desacoplado da implementação concreta de WHO Data por `LmsDatasetProvider`.
2. Fachada pública simples preservada e entrada `core.ts` criada para futura extração.
3. Fronteiras Core/Data/Web protegidas por testes automatizados.
4. Aplicação React/Vite criada sem backend, persistência ou recursos externos.
5. Fluxo `Dados → Medidas → Resultados`, medidas complementares e alertas integrados.
6. Resultados, mapa visual de escores Z e curvas de crescimento consumindo exclusivamente a API pública.
7. Logo, identidade tecnológica, movimentos e layouts responsivos implementados.
8. Gráficos de peso, comprimento-altura, perímetro cefálico e IMC com curvas de `Z=-3` a `Z=+3` e marcador da criança.
9. Perímetro cefálico após 60 meses retorna indisponibilidade explícita em vez de desaparecer silenciosamente.
10. Peso, comprimento/altura e perímetro cefálico compartilham a grade de medidas principais; a posição inicia deitada e o núcleo visual usa a logo oficial.

## Próximos marcos

1. Manter a validação visual e funcional a cada alteração relevante da Web.
2. Acompanhar o CI e os alertas de segurança do repositório público.
3. Confirmar propriedade do escopo npm `@pediametric` antes de eventual publicação.
4. Coletar feedback de usuários para orientar os próximos marcos.
5. Publicar os ajustes visuais posteriores no GitHub e no Netlify somente após autorização explícita.

## Restrições

- prioridade é a Web; a preparação open source permanece local, pequena e sem transformar o projeto em monorepo;
- não mover arquivos sem necessidade funcional;
- cálculos e cortes clínicos não podem existir na interface;
- dados digitados não saem do navegador nem são persistidos;
- `docs/anthropometry/` permanece referência estável;
- não publicar npm sem autorização separada.

## Preparação open source concluída

- pacote local `@pediametric/core@0.1.0`, ESM, tipado, sem dependências e com `private: true`;
- licença MIT limitada ao código e documentação do pacote;
- build a partir da fonte canônica, sem cópia de código;
- smoke test por self-import e inspeção automática contra Web, rede e WHO Data;
- dry-run com 27 entradas, 13.030 bytes compactados e nenhum JSON/dataset;
- documentação de API, contribuição, segurança, licenciamento e release em `docs/open-source/`.
- API de classificação neutra em idioma, com rótulos pt-BR mantidos somente na Web;
- política candidata de versionamento e CI de leitura/testes preparadas, sem etapa de publicação.
- licença MIT na raiz, contribuição, segurança, marca e avisos de terceiros;
- fontes WHO e JSONs derivados excluídos do Git, com download oficial e verificação de hash;
- CI reproduz os dados localmente antes de verificar e construir a Web.
- branch `codex/public-release` mantém histórico público sem herdar commits que continham WHO Data;
- auditoria `pnpm run audit:public` aprovada e protegendo conteúdo atual e histórico;
- clone limpo confirmou download oficial, SHA-256 e geração dos 12 datasets locais.

## Gate do marco atual

O marco técnico e a publicação inicial da Web foram concluídos: preparação de
dados, auditoria pública, `pnpm run verify`, `pnpm run build` e
`pnpm run verify:core` passam, o histórico público não contém arquivos WHO e a
interface está disponível no Netlify. Publicar npm continua sendo uma ação
separada. A release `v0.2.0` aponta para um commit aprovado pelo Core CI em
Node.js 22 e 24.

As curvas foram validadas localmente em 1440 px e 360 px, sem erros no console
ou rolagem horizontal da página. Esta atualização ainda não foi implantada no
Netlify.
