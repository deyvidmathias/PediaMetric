# Checklist para uma futura publicação

Este checklist separa a publicação do código no GitHub de uma futura publicação npm.

## 1. Escopo e autorização

- [x] O titular autorizou preparar o repositório completo para GitHub público.
- [x] O PediaMetric Web continua fora do pacote Core, salvo decisão documentada.
- [x] WHO Data, marca e ativos visuais estão excluídos do pacote.
- [ ] Nome do pacote e possível conflito de marca foram verificados.

## 2. Direitos e conformidade

- [x] A licença MIT do código original foi adicionada somente ao pacote Core.
- [x] Materiais de terceiros foram inventariados em `THIRD_PARTY_NOTICES.md`.
- [x] Nenhum dado WHO está sendo sublicenciado sob a licença do Core.
- [ ] Qualquer redistribuição de WHO Data passou pela revisão descrita em `LICENSING.md`.
- [ ] Atribuições, avisos de não endosso e exclusões de garantia estão corretos.
- [ ] Houve revisão jurídica quando o uso ou a licença exigirem.

## 3. API e pacote

- [x] A API candidata foi reduzida, documentada e protegida por snapshot de exports.
- [ ] Política de erros e runtimes suportados foram aprovados.
- [x] Política candidata de compatibilidade semântica foi documentada em `VERSIONING.md`.
- [x] O Core não importa React, DOM, CSS, rede, armazenamento ou dados concretos.
- [x] O pacote local contém apenas arquivos esperados, comprovados com `npm pack --dry-run`.
- [x] Metadados, exports, tipos TypeScript e README apontam para locais válidos.
- [ ] A versão inicial e o changelog foram aprovados.

## 4. Validação

- [ ] `pnpm run data:prepare` e `pnpm run verify` passam em um clone limpo.
- [ ] Regressões WHO, limites etários, ambos os sexos e casos extremos passam.
- [x] Testes confirmam que o Core funciona com um provedor em memória.
- [x] Testes arquiteturais impedem dependências da Web ou do WHO Data.
- [ ] Build e pacote reproduzíveis foram inspecionados; hashes foram registrados.
- [ ] Resultados não arredondados e tolerâncias permanecem documentados.

## 5. Segurança e manutenção

- [ ] Existe canal privado de reporte de vulnerabilidades.
- [x] `SECURITY.md`, `CONTRIBUTING.md` e política candidata de versões estão presentes.
- [x] CI localmente preparada usa somente `contents: read`, sem segredos ou publicação.
- [ ] Referências de actions foram fixadas em SHAs completos antes de ativar o repositório público.
- [ ] CI foi executada e aprovada no futuro repositório remoto.
- [ ] Proprietários, frequência de manutenção e processo de release foram definidos.

## 6. Gate final

- [ ] Um responsável revisou o conteúdo exato a publicar.
- [x] GitHub e npm são tratados como autorizações separadas.
- [x] O histórico público foi criado sem arquivos WHO originais ou derivados.
- [ ] Publicação de teste não contém WHO Data nem ativos da Web.
- [ ] O comando final será executado somente após confirmação explícita.

Após a publicação, registrar versão, commit, hash do pacote, conteúdo inspecionado e links oficiais. Nunca corrigir uma publicação equivocada sobrescrevendo silenciosamente a mesma versão.
