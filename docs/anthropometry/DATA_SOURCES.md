# Fontes de dados

Data de acesso: **2026-08-09**. Os arquivos são baixados por HTTPS diretamente
das fontes oficiais, validados por SHA-256 e mantidos apenas no ambiente local.
Eles e os JSONs derivados são ignorados pelo Git.

| Referência | Fonte oficial | Arquivo local | Conteúdo | SHA-256 |
|---|---|---|---|---|
| WHO 2006 | https://cdn.who.int/media/docs/default-source/child-growth/child-growth-standards/software/igrowup-spss.zip?sfvrsn=5fb221f_2 | `vendor/sources/igrowup-spss.zip` | 9 datasets LMS SPSS, sintaxe oficial e amostra | `1143FE907B38A95B478866D2D6A8570D685176AE27950D18F20F3FD266D0443F` |
| WHO 2007 | https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/download-spss-marco.zip?sfvrsn=7ba91cd4_0 | `vendor/sources/who2007-spss.zip` | 3 datasets LMS SPSS, sintaxe oficial e amostra | `6185CDCB02A4886B3E30A97609910C0B2F724BF65332F29E115334D95496701F` |
| Validação 2006 | https://cran.r-project.org/src/contrib/anthro_1.1.0.tar.gz | não distribuído | código e testes GPL-3 consultados como referência independente | `191672C4FA15EE0089EBA241837C8D8DD95B52A5B94C2110D87CE15C84A8CCE7` |

Páginas institucionais:

- https://www.who.int/tools/child-growth-standards/standards
- https://www.who.int/tools/child-growth-standards/software
- https://www.who.int/tools/growth-reference-data-for-5to19-years
- https://www.who.int/tools/growth-reference-data-for-5to19-years/application-tools
- https://cdn.who.int/media/docs/default-source/child-growth/growth-reference-5-19-years/computation.pdf

## Inventário WHO 2006

| Indicador | Arquivo original | Chave | Faixa | Campos |
|---|---|---|---|---|
| peso/idade | `wazlms.sav` | `AGEDAYS2` | 0–1856 dias | `SEX, AGEDAYS2, L, M, S` |
| comprimento-altura/idade | `hazlms.sav` | `AGEDAYS2` | 0–1856 dias | `SEX, AGEDAYS2, L, M, S` |
| peso/comprimento | `wfllms.sav` | `LENGTH2` | 45,0–110,0 cm | `SEX, LENGTH2, L, M, S` |
| peso/altura | `wfhlms.sav` | `HEIGHT2` | 65,0–120,0 cm | `SEX, HEIGHT2, L, M, S` |
| IMC/idade | `bmilms.sav` | `AGEDAYS2` | 0–1856 dias | `SEX, AGEDAYS2, L, M, S` |
| perímetro cefálico/idade | `hclms.sav` | `AGEDAYS2` | 0–1856 dias | `SEX, AGEDAYS2, L, M, S` |
| circunferência braquial/idade | `aclms.sav` | `AGEDAYS2` | 91–1856 dias | `SEX, AGEDAYS2, L, M, S` |
| prega tricipital/idade | `tslms.sav` | `AGEDAYS2` | 91–1856 dias | `SEX, AGEDAYS2, L, M, S` |
| prega subescapular/idade | `sslms.sav` | `AGEDAYS2` | 91–1856 dias | `SEX, AGEDAYS2, L, M, S` |

## Inventário WHO 2007

| Indicador | Arquivo original | Chave | Faixa | Campos |
|---|---|---|---|---|
| IMC/idade | `bfawho2007.sav` | `AGEMOS` | 61–228 meses; linha sentinela 229 | `SEX, AGEMOS, L, M, S` |
| altura/idade | `hfawho2007.sav` | `AGEMOS` | 61–228 meses; linha sentinela 229 | `SEX, AGEMOS, L, M, S` |
| peso/idade | `wfawho2007.sav` | `AGEMOS` | 61–120 meses; linha sentinela 121 | `SEX, AGEMOS, L, M, S` |

As linhas 229/121 repetidas nos arquivos 2007 são preservadas no derivado para permitir interpolação segura no último mês suportado, mas nunca ampliam o domínio clínico.

## Transformação

`scripts/import_who_data.py`:

1. `scripts/download_who_sources.py` baixa os dois pacotes WHO e confere seus SHA-256;
2. extrai os `.sav` para diretório temporário;
3. lê os valores com `pyreadstat`;
4. valida colunas, sexos, faixas, ordenação, ausência de duplicatas e contagens esperadas;
5. serializa cada linha como `[chave, L, M, S]`, sem arredondamento adicional;
6. grava JSON determinístico e um manifesto com hash/contagem.

Dependência de importação: Python 3.11+ e `pyreadstat==1.3.2`. Essa dependência não participa do runtime do navegador.

Preparação completa: `pnpm run data:prepare`. Consulte também
`THIRD_PARTY_NOTICES.md`; baixar ou usar os materiais não transfere sua licença
para MIT.
