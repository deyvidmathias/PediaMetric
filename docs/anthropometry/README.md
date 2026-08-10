# Investigação técnica

Data da investigação: 2026-08-09.

## Conclusão executiva

O repositório não continha código, documentação ou commits. A arquitetura proposta é, portanto, um pacote TypeScript independente, sem React, rede ou persistência. A futura UI consumirá uma única API tipada e poderá carregar a logo PNG fornecida pelo usuário sem acoplar identidade visual ao motor.

As referências confirmadas são:

1. **WHO Child Growth Standards 2006**, com nove indicadores: peso/idade, comprimento-altura/idade, peso/comprimento, peso/altura, IMC/idade, perímetro cefálico/idade, circunferência braquial/idade, prega tricipital/idade e prega subescapular/idade.
2. **WHO Growth Reference 2007**, com três indicadores: altura/idade e IMC/idade de 61 a 228 meses; peso/idade de 61 a 120 meses.

Velocidade de crescimento e marcos motores existem na OMS, mas não pertencem ao primeiro núcleo: exigem avaliações longitudinais e modelos/datasets distintos.

## Arquivos usados localmente

- `vendor/sources/igrowup-spss.zip`: pacote oficial WHO 2006 baixado localmente.
- `vendor/sources/who2007-spss.zip`: pacote oficial WHO 2007 baixado localmente.
- `anthro` 1.1.0: pacote R GPL-3 consultado como implementação independente de conferência; não é distribuído nem necessário no build.

Os arquivos-fonte e derivados não são versionados. `pnpm run data:prepare` os
reproduz no ambiente local; a transformação normaliza apenas nomes e tipos e
não recalcula, suaviza nem arredonda os parâmetros LMS.

## Campos internos

```ts
type LmsRow = {
  sex: "male" | "female";
  key: number; // idade em dias, idade em meses ou comprimento/altura em cm
  l: number;
  m: number;
  s: number;
};
```

- WHO 2006 por idade: `key = ageDays`, inteiro.
- WHO 2006 peso/comprimento ou peso/altura: `key = cm`, passos de 0,1 cm.
- WHO 2007: `key = ageMonths`, inteiro.

## Fórmulas

LMS básico, para medida `y`:

```text
z = ((y / M)^L - 1) / (L * S), quando L != 0
z = ln(y / M) / S, quando L = 0
```

Para indicadores com distribuição assimétrica, aplica-se o LMS restrito fora de ±3 Z. Calculam-se os valores das curvas em Z=±2 e Z=±3 e prolonga-se linearmente com a distância entre 2 e 3 desvios. Altura/comprimento por idade e perímetro cefálico por idade usam o LMS direto; os demais indicadores de peso, IMC, circunferência e pregas usam a extensão restrita indicada pela implementação oficial/referenciada.

O percentil é `100 * Phi(z)`, usando o Z completo. Ele não é obtido das tabelas gráficas e não é limitado a percentis nominais. A API mantém o valor matemático; a UI poderá sinalizar que o WHO AnthroPlus exibe percentil como indisponível fora de ±3 Z.

## Regras especiais

- Idade em dias é a diferença entre as duas datas civis, sem horário/fuso.
- Idade mensal WHO 2007: `ageDays / 30.4375`.
- WHO 2006 usa parâmetros diários; WHO 2007 calcula Z nos meses inteiros adjacentes e interpola linearmente o Z pela fração do mês, como a sintaxe oficial.
- Até 730 dias inclusive, a medida esperada é comprimento deitado. A partir de 731 dias, altura em pé.
- Medida em pé antes de 731 dias: somar 0,7 cm. Comprimento deitado a partir de 731 dias: subtrair 0,7 cm.
- O valor ajustado é usado tanto no IMC quanto nos indicadores dependentes de comprimento/altura.
- Peso/comprimento aceita 45,0–110,0 cm; peso/altura aceita 65,0–120,0 cm. Os LMS são interpolados entre passos de 0,1 cm quando necessário.
- Circunferência braquial e pregas começam em 91 dias; os demais indicadores 2006 começam no nascimento.
- Edema torna indisponíveis os indicadores dependentes de peso, mas não altura/comprimento por idade.
- WHO 2007 não possui peso/idade acima de 120 meses.
- O motor não inventará diagnóstico automático para perímetro cefálico, circunferência braquial ou pregas; nesses casos retorna faixa Z e alerta de que não há classificação clínica WHO universal definida nesse conjunto de dados.

## Arquitetura proposta

```text
src/features/anthropometry/
  engine/        idade, IMC, LMS, percentil, classificação e orquestração
  data/          JSON gerado e acesso tipado aos parâmetros
  index.ts       API pública pura
scripts/
  import_who_data.py
tests/
  unitários e regressão contra exemplos oficiais/referenciados
vendor/sources/
  arquivos originais imutáveis
docs/anthropometry/
  decisões, fontes, validação e handoff
```

## Plano em etapas

1. Fixar fontes, hashes, regras e escopo.
2. Criar importador reproduzível e manifestos dos dados.
3. Implementar idade, IMC, normal acumulada, LMS e LMS restrito.
4. Implementar seleção de referência, ajuste comprimento/altura e todos os indicadores suportados.
5. Validar casos medianos, extremos, fronteiras etárias e entradas inválidas.
6. Integrar ao Clinary sem rede/persistência.
7. Só então criar UI moderna, tecnológica e móvel, com temática médica/pediátrica sutil e ponto de integração para logo PNG.
