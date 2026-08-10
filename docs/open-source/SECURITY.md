# Segurança

## Estado e versões suportadas

O PediaMetric Core ainda não possui versão pública. Portanto, não há versões open source oficialmente suportadas nem programa público de recompensas.

Quando houver publicação, esta seção deverá listar versões mantidas, prazo de correções e um canal privado verificável para reportes. Não inventar endereço de segurança antes que ele exista.

## Como relatar

Até a criação de um canal oficial, não publique detalhes exploráveis em issues, fóruns ou discussões públicas. Contate o mantenedor por um canal privado já estabelecido entre as partes e aguarde confirmação. Nunca envie dados de pacientes, medidas clínicas identificáveis, credenciais ou segredos para demonstrar um problema.

Um reporte útil contém:

- componente e versão/commit afetado;
- descrição do impacto;
- passos mínimos para reprodução com dados sintéticos;
- comportamento observado e esperado;
- mitigação conhecida, se houver.

O mantenedor deverá acusar recebimento, avaliar severidade, combinar divulgação coordenada e registrar a correção sem expor dados sensíveis.

## Escopo prioritário

- alteração silenciosa de cálculos, classificações ou seleção de referência;
- corrupção, substituição ou carregamento de datasets não verificados;
- bypass dos limites entre Core, WHO Data e Web;
- envio ou persistência de medidas clínicas;
- cadeia de dependências, build e artefatos de publicação;
- negação de serviço por entradas não confiáveis.

Erros clínicos ou científicos sem vetor de segurança também são importantes, mas devem ser acompanhados de referência oficial e teste de regressão. Relatos de aparência, textos ou funcionalidades desejadas pertencem ao fluxo comum de contribuição.

## Práticas obrigatórias

- cálculos locais, sem telemetria ou rede no Core;
- entradas validadas e erros explícitos;
- hashes e transformação reproduzível para dados;
- testes sem informações reais de pacientes;
- dependências e automações com permissões mínimas;
- revisão do conteúdo exato antes de qualquer pacote.

O software fornece apoio antropométrico e não substitui avaliação profissional, diagnóstico ou conduta clínica.
