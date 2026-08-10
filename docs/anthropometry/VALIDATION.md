# Estratégia de validação

## Fontes independentes

1. parâmetros e sintaxe SPSS oficiais WHO 2006/2007;
2. exemplos numéricos do documento oficial `computation.pdf` para WHO 2007;
3. código e testes do pacote R `anthro` 1.1.0, indicado na página oficial da OMS, para WHO 2006;
4. amostras de entrada/saída incluídas nos pacotes SPSS.

Usar apenas o próprio JSON gerado para criar o esperado não é considerado regressão independente.

## Tolerâncias

- primitivas LMS e IMC: erro absoluto `<= 1e-12` em `number` JavaScript;
- comparação de Z não arredondado com cálculo reproduzido: `<= 1e-9`;
- comparação com saídas WHO/`anthro` publicadas com 2 casas: `<= 0,005`;
- percentil: `<= 2e-5` ponto percentual, compatível com o erro máximo da aproximação `erfc` usada no navegador;
- parâmetros convertidos: igualdade numérica após leitura do `.sav` e igualdade SHA-256 dos JSONs regenerados.

## Matriz mínima

- ambos os sexos;
- nascimento, 91 dias, 730/731 dias, 59–61 meses, 120/121 meses e 228/229 meses;
- medianas e valores próximos de ±1, ±2 e ±3 Z;
- caudas além de ±3 Z para comprovar LMS restrito;
- comprimento/altura correto e divergente, com ajuste de ±0,7 cm;
- peso/comprimento nos limites 45/110 cm e peso/altura nos limites 65/120 cm;
- datas bissextas e avaliação anterior ao nascimento;
- medidas zero, negativas, ausentes, fora do dataset e edema.

## Critério de aceite

Todos os testes devem passar localmente, sem rede. O handoff deve registrar versão das fontes, hashes, comando executado e qualquer divergência conhecida. A UI só poderá ser iniciada após esse gate.

## Resultado desta etapa

- TypeScript estrito: aprovado;
- 29 testes automatizados: aprovados;
- regressões WHO 2006: saída SPSS oficial para ambos os sexos e pacote R `anthro` 1.1.0;
- regressões WHO 2007: três exemplos numéricos do documento oficial `computation.pdf`;
- sentinela sem rede/persistência: aprovada;
- 13 arquivos locais gerados (12 datasets + manifesto) reproduzidos com hashes idênticos e excluídos do Git público.
