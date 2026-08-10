# Superfície pública candidata do PediaMetric Core

Este documento descreve as exportações atuais de `src/features/anthropometry/core.ts`. A API ainda é interna e pode mudar antes da primeira versão pública.

## Avaliação completa

### `assessAnthropometryWithProvider(input, provider)`

Recebe `AnthropometryInput` e um `LmsDatasetProvider`; devolve `AnthropometryAssessment`. Calcula idade, seleciona a referência suportada, ajusta estatura, calcula IMC e produz resultados disponíveis. Erros de entrada são retornados em `validity`; ausência de um dataset solicitado pelo provedor pode lançar `RangeError`.

### `createAnthropometryAssessment(provider)`

Cria uma função `(input) => AnthropometryAssessment` vinculada a um provedor. É a forma recomendada para uma aplicação compor o Core com seus próprios dados licenciados:

```ts
const assess = createAnthropometryAssessment(myDatasetProvider);
const result = assess(input);
```

### `expectedPositionForAge(ageDays)`

Retorna `"length"` antes de 731 dias e `"height"` a partir daí.

## Curvas de crescimento

### `createGrowthChartModelWithProvider(result, provider)`

Recebe um `AnthropometricResult` e um `LmsDatasetProvider`; devolve um modelo
independente de interface para peso/idade, comprimento-altura/idade,
perímetro cefálico/idade ou IMC/idade. O Core calcula sete curvas (`Z=-3` até
`Z=+3`) com os mesmos parâmetros LMS da avaliação e preserva o marcador da
criança sem arredondamento. Indicadores fora desse conjunto devolvem `null`.

A função não desenha SVG, não escolhe cores e não depende de biblioteca de
gráficos. O consumidor é responsável apenas por transformar os pontos já
calculados em coordenadas visuais.

## Idade e referência

- `calculateExactAge(birthDate, assessmentDate): ExactAge` — aceita `YYYY-MM-DD` ou `Date`, usa datas civis UTC e rejeita avaliação anterior ao nascimento.
- `selectReference(age): Reference | null` — seleciona a faixa WHO 2006/2007 atualmente suportada; não carrega dados.
- `DAYS_PER_MONTH` — constante `30.4375` usada na idade exata em meses.

## Primitivas matemáticas

- `calculateBmi(weightKg, statureCm): number`;
- `lmsZScore(measurement, parameters): number`;
- `restrictedLmsZScore(measurement, parameters): number`;
- `measurementAtZ(zScore, parameters): number`;
- `zScoreToPercentile(zScore): number`;
- `findExactTuple(rows, key): LmsTuple | null`;
- `interpolateParametersByKey(rows, key, step): LmsParameters | null`.

Entradas não finitas, medidas não positivas ou valores fora do domínio podem produzir `RangeError`, conforme a primitiva. O Core não arredonda resultados.

## Interpretação e estatura

- `classify(indicator, reference, zScore): Classification` — devolve somente um código estável e a base da classificação. Textos localizados pertencem ao consumidor.
- `adjustStature(ageDays, statureCm, position?): AdjustedStature` — aplica a regra de posição suportada e informa o ajuste, sem modificar a entrada.

## Tipos públicos

`core.ts` reexporta todos os tipos de `types.ts`, incluindo:

- entradas e saídas: `AnthropometryInput`, `AnthropometryAssessment`, `AnthropometricResult`;
- gráficos: `GrowthChartModel`, `GrowthChartCurve`, `GrowthChartPoint`, `GrowthChartMarker`, `GrowthChartIndicator`;
- domínio: `Sex`, `Reference`, `Indicator`, `MeasurementPosition`;
- validade e interpretação: `Classification`, `ResultValidity`;
- dados LMS: `LmsTuple`, `LmsParameters`, `LmsDataset`, `LmsDatasetProvider`;
- estruturas auxiliares: `ExactAge`, `AdjustedStature`.

O contrato mínimo do provedor é:

```ts
interface LmsDatasetProvider {
  getDataset(reference: Reference, indicator: Indicator): LmsDataset | undefined;
}
```

## Core versus fachada Web

`src/features/anthropometry/index.ts` não é a entrada do futuro pacote Core: ele conecta o Core ao `whoDatasetProvider` local e oferece `assessAnthropometry`. O PediaMetric Web pode usar essa fachada, mas o pacote Core futuro deverá permanecer utilizável sem os dados WHO.

A política candidata de compatibilidade está em [VERSIONING.md](./VERSIONING.md). Antes da primeira versão pública ainda será necessário aprovar os nomes, a política de erros e os runtimes suportados.
