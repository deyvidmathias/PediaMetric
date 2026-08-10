# Preparação open source do PediaMetric Core

## Estado

O repositório PediaMetric está preparado para tornar públicos o código e a
documentação originais sob MIT. O PediaMetric Core possui um pacote local
verificável em `packages/core`, mas continua privado no npm e não publicado.
A licença não cobre WHO Data.

A fonte canônica continua em `src/features/anthropometry/`; o pacote é compilado diretamente dela, sem cópia manual e sem transformar o projeto em workspace.

## Escopo futuro

O possível projeto open source abrangerá somente código original e independente de interface:

- cálculo de idade e IMC;
- fórmulas LMS, LMS restrito, Z-score e percentil;
- classificações e verificações de plausibilidade;
- ajuste entre comprimento e altura;
- tipos e contrato `LmsDatasetProvider`;
- composição da avaliação usando um provedor fornecido pelo consumidor.

O Core não depende de React, DOM, CSS, gráficos, rede, armazenamento ou arquivos JSON concretos. A superfície atual está documentada em [API.md](./API.md), e sua evolução proposta em [VERSIONING.md](./VERSIONING.md).

## Fora do pacote Core

- PediaMetric Web e seus componentes;
- logo e demais ativos da marca;
- tabelas, arquivos-fonte e derivados WHO 2006/2007;
- importadores e artefatos de validação ligados à redistribuição dos dados;
- qualquer indicação de endosso ou afiliação com a OMS.

Os dados WHO não serão sublicenciados sob MIT nem incluídos automaticamente no pacote Core. Uma futura distribuição dos dados dependerá de revisão específica das fontes, termos aplicáveis e permissões necessárias. Consulte [LICENSING.md](./LICENSING.md).

## Organização atual

- `src/features/anthropometry/core.ts`: entrada candidata do Core independente;
- `src/features/anthropometry/types.ts`: tipos e contrato do provedor;
- `src/features/anthropometry/engine/`: implementação dos cálculos;
- `src/features/anthropometry/data/`: provedor e dados WHO, fora do Core;
- `src/features/anthropometry/index.ts`: fachada usada pela Web, conectando Core e WHO Data;
- `tests/`: regressões, integridade e fronteiras arquiteturais.

## Próximo gate

Antes de enviar ao GitHub, confirmar que o histórico destinado ao público não
contém fontes ou derivados WHO. Publicação npm continua condicionada ao
[RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) e a autorização separada.
