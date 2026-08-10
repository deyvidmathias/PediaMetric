# Registro de decisões

Registrar aqui apenas escolhas duráveis que afetem arquitetura, produto, privacidade ou validação. Cada entrada deve ser curta; detalhes clínicos permanecem em `docs/anthropometry/`.

## 2026-08-09 — PediaMetric é independente do Clinary

O produto será desenvolvido como aplicação própria. Não haverá integração com Clinary nesta fase, e nomes, rotas ou infraestrutura daquele sistema não devem orientar a Web.

## 2026-08-09 — A Web é a prioridade

Preparar o Core para extração futura não autoriza publicar pacote, criar monorepo, configurar workspaces ou atrasar a interface. A preparação será limitada a fronteiras de importação, contrato de dados, fachada pública e testes.

## 2026-08-09 — Quatro áreas explícitas

PediaMetric Core contém cálculos e interpretação; WHO Data contém referências oficiais e procedência; Validation protege resultados e limites; PediaMetric Web contém somente interface e apresentação. A Web nunca implementa cálculos antropométricos.

## 2026-08-09 — Processamento e estado locais

A avaliação ocorre no navegador e permanece apenas em memória. Medidas, datas e resultados não são enviados, registrados, colocados em URL ou persistidos. O produto não solicita identificadores pessoais.

## 2026-08-09 — Arquitetura incremental

A organização evolui quando necessária para a entrega. Não mover arquivos para simular antecipadamente a estrutura de um pacote futuro. A menor mudança válida é preferida quando mantém os testes e estabelece uma fronteira verificável.

## 2026-08-09 — Documentação por contexto

Agentes leem `AGENTS.md`, `docs/STATUS.md` e somente o documento relacionado à tarefa. O estado é substituído a cada marco; decisões duráveis são acrescentadas aqui; documentação antropométrica não é reescrita sem escopo técnico.

## 2026-08-09 — Modelos proporcionais ao risco

Tarefas mecânicas usam modelo equilibrado e esforço baixo; implementação comum usa esforço médio; alterações clínicas, privacidade, arquitetura difícil ou falhas persistentes usam modelo de maior capacidade e esforço alto. `max` e `ultra` exigem justificativa concreta.

## 2026-08-09 — Publicação pública sem redistribuição de WHO Data

O repositório completo pode ser público sob MIT, incluindo Web, Core, testes e
documentação originais. WHO Data, fontes originais e JSONs derivados ficam fora
do Git e não são sublicenciados sob MIT; o usuário os prepara localmente a
partir das fontes oficiais verificadas. O pacote npm permanece privado até uma
autorização de publicação separada.
