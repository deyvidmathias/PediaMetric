# Handoff

## Estado inicial

O repositório estava vazio, exceto por `.git`, no branch `master`, sem commits e sem mudanças locais.

## Decisões fixadas

- módulo TypeScript puro, sem React e sem rede;
- nove indicadores WHO 2006 e três WHO 2007;
- fontes oficiais baixadas e transformação local reproduzível, sem redistribuição no Git;
- WHO 2006 até o fim do mês 60 e WHO 2007 a partir do mês 61;
- comprimento/altura não são sinônimos; ajuste de 0,7 cm é obrigatório quando a posição diverge;
- classificação clínica automática apenas onde a OMS publica pontos de corte aplicáveis;
- medidas complementares retornam Z/percentil/faixa, sem diagnóstico inventado;
- UI adiada; direção visual registrada em `UX_DIRECTION.md`.

## Implementado

- importador determinístico com verificação dos pacotes originais;
- 12 datasets JSON e manifesto gerados localmente;
- idade civil exata e idade WHO em dias/meses;
- IMC, LMS direto, LMS restrito e percentil matemático;
- ajuste comprimento/altura de 0,7 cm somente no domínio 2006;
- nove indicadores 2006 e três indicadores 2007;
- interpolação WHO 2007 pelo Z nos meses adjacentes;
- classificações WHO onde há corte publicado e faixas descritivas nos demais;
- flags de plausibilidade, edema e domínios de medida/idade;
- sentinela contra rede e persistência.

## Validação concluída

Em 2026-08-09:

- `pnpm run verify`: TypeScript estrito e 29/29 testes aprovados;
- regressões SPSS WHO 2006 para ambos os sexos;
- exemplos oficiais WHO 2007 de 9, 11 e 16 anos;
- regeneração determinística: 12 datasets + manifesto sem mudança de hash;
- arquivos WHO originais e derivados excluídos do conteúdo público do Git;
- smoke test do exemplo do pedido: 846 dias, IMC 15,6122836696 e quatro indicadores válidos.

## Próximo gate

Integrar o módulo ao repositório real do Clinary e só então criar componentes/gráficos. Este repositório não contém a aplicação Clinary, portanto não foi possível conectar rotas, design system ou build dela. A futura UI deve seguir `UX_DIRECTION.md` e receber a logo PNG do usuário.

Antes de uso clínico em produção, recomenda-se ampliar a matriz de regressão automatizada com exportações atuais do WHO Anthro/AnthroPlus em todas as fronteiras e realizar revisão por profissional qualificado.
