# Licenciamento: código e dados

> Documento operacional, não parecer jurídico. Os termos das fontes devem ser revistos novamente na data de qualquer publicação.

## Código original do PediaMetric

O repositório possui licença MIT na raiz para o código e a documentação
originais do PediaMetric. O pacote local `packages/core` também permanece com
`private: true`: tornar o código visível no GitHub não publica uma versão npm
nem oferece compromisso público de estabilidade da API.

A licença do código cobre apenas a implementação original identificada para o Core. Ela não altera direitos sobre dados, publicações, marcas ou materiais de terceiros.

## WHO Data é separado

As tabelas WHO 2006/2007, arquivos SPSS originais, JSONs derivados, publicações
e outros materiais da Organização Mundial da Saúde não são código original do
PediaMetric e ficam fora do Git público.

Portanto:

- WHO Data **não será incluído no repositório Git nem no pacote PediaMetric Core**;
- WHO Data **não será sublicenciado sob MIT** ou sob a licença escolhida para o Core;
- disponibilidade pública para consulta ou download não será tratada como autorização automática de redistribuição;
- publicação, adaptação, distribuição ou uso comercial exigirá revisão da licença específica do material e, quando aplicável, autorização apropriada;
- nenhuma aprovação da OMS foi obtida ou alegada por este projeto;
- o nome, a marca e o emblema da OMS não poderão sugerir endosso ou afiliação.

Os termos de datasets em `data.who.int` informam CC BY 4.0 como regra geral, salvo indicação específica, acompanhada de termos adicionais. Isso não prova, por si só, que os arquivos de crescimento baixados de outras áreas ou do CDN da OMS estejam cobertos pela mesma licença. Deve-se verificar a página, o arquivo e o aviso de copyright específicos de cada material.

## Fontes oficiais a revisar

- [Termos para datasets em data.who.int](https://data.who.int/about/data/terms-and-conditions)
- [Termos para compilações, agregações, avaliações e análises de dados WHO](https://www.who.int/about/policies/publishing/data-policy/terms-and-conditions)
- [Copyright, licenciamento e permissões WHO](https://www.who.int/about/policies/publishing/copyright)
- [Termos de uso do site WHO](https://www.who.int/about/policies/terms-of-use)
- [Formulário de permissões WHO](https://www.who.int/about/policies/publishing/permissions)
- [WHO Child Growth Standards 2006](https://www.who.int/tools/child-growth-standards)
- [WHO Growth Reference 2007, 5–19 anos](https://www.who.int/tools/growth-reference-data-for-5to19-years)

## Gate de decisão

Antes de distribuir WHO Data, registrar por escrito:

1. arquivos e URLs exatos que serão distribuídos;
2. aviso de licença/copyright aplicável a cada arquivo;
3. finalidade comercial ou não comercial;
4. obrigações de atribuição, adaptação e compartilhamento;
5. eventual autorização recebida, com seu escopo e validade;
6. texto de não endosso e exclusão de garantias exigido.

Na ausência dessa confirmação, distribuir apenas o código. O repositório
orienta o usuário a baixar as fontes oficiais diretamente e gerar os artefatos
localmente, ou a fornecer um `LmsDatasetProvider` obtido legitimamente.
