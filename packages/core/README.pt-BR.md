# @pediametric/core

[Read in English](./README.md)

Primitivas TypeScript independentes de interface para antropometria pediátrica. Este pacote é a camada de cálculos usada pelo PediaMetric e está sendo preparado para uma possível publicação open source futura.

> **Estado de pré-lançamento:** o pacote permanece privado, não publicado e sua API pode mudar antes da primeira versão pública.

## Escopo

O Core oferece:

- idade exata e seleção de referência;
- IMC e ajuste de posição da estatura;
- escores Z por LMS e percentis;
- classificações e tratamento de plausibilidade;
- avaliações completas por meio de um `LmsDatasetProvider` injetado.

Ele não depende de React, DOM, CSS, gráficos, rede, armazenamento persistente ou fonte concreta de dados.

## Dados WHO não incluídos

Este pacote **não** contém tabelas, arquivos-fonte, nomes, logotipos ou outros materiais da Organização Mundial da Saúde. O consumidor deve fornecer datasets compatíveis e validados por meio de `LmsDatasetProvider` e continua responsável por origem, versão, integridade, licenciamento e uso permitido.

A licença MIT deste diretório se aplica apenas ao código e à documentação do Core. Ela não concede direitos sobre dados ou marcas de terceiros.

## Exemplo

```ts
import {
  createAnthropometryAssessment,
  type LmsDatasetProvider
} from "@pediametric/core";

const provider: LmsDatasetProvider = {
  getDataset(reference, indicator) {
    // Retorne um dataset validado para a referência e o indicador.
    return undefined;
  }
};

const assess = createAnthropometryAssessment(provider);
```

O Core retorna valores com precisão integral. Arredondamento e formatação pertencem à aplicação consumidora.

## Desenvolvimento local

Na raiz do repositório:

```sh
pnpm run verify:core
```

O comando compila ESM e declarações TypeScript, testa a importação do próprio pacote, confere o snapshot da API pública em runtime, inspeciona dependências e dados proibidos e executa um dry-run do pacote npm.

## Segurança e uso clínico

O PediaMetric Core é um software em desenvolvimento. Seus resultados não substituem julgamento profissional, diagnóstico ou assistência. Cada consumidor deve validar o provedor de dados e a integração para o contexto pretendido.

Consulte [CONTRIBUTING.md](./CONTRIBUTING.md), [SECURITY.md](./SECURITY.md) e [CHANGELOG.md](./CHANGELOG.md) para as políticas do projeto.
