# Produto e experiência

## Visão

O **PediaMetric** é uma aplicação web de antropometria pediátrica baseada nas referências oficiais da Organização Mundial da Saúde. Seu objetivo é transformar medidas e datas em resultados claros, rastreáveis e visualmente compreensíveis, sem substituir julgamento clínico.

A primeira versão deve resolver bem uma única jornada: informar os dados necessários, validar as medidas, calcular localmente e apresentar Z-score, percentil, classificação, plausibilidade e curva de crescimento. Não é um prontuário, sistema de prescrição ou plataforma de telemedicina.

## Público e promessa

O público principal são profissionais de saúde que precisam de uma ferramenta ágil durante avaliação ou conferência de dados. Estudantes e responsáveis podem consultar a aplicação, mas a linguagem deve deixar evidente que resultados isolados não constituem diagnóstico.

Promessa do produto: **avaliação antropométrica rápida, transparente e privada, com referências WHO documentadas**.

## Jornada principal

1. O usuário acessa uma apresentação curta e inicia a avaliação.
2. Informa sexo de referência, nascimento, data da avaliação, medidas e posição de comprimento/altura quando aplicável.
3. A interface explica erros junto ao campo e impede combinações inválidas.
4. A Web envia uma entrada tipada para a API pública do módulo antropométrico.
5. O Core retorna resultados completos, classificações, validade e alertas.
6. A Web apresenta resumo, indicadores e gráficos sem recalcular valores.
7. O usuário pode corrigir dados ou limpar toda a avaliação.

## Escopo da primeira versão

- funcionamento responsivo entre 360 e 1440 px;
- cálculo exclusivamente local;
- resultados por indicador suportado pelo motor;
- gráficos coerentes com os valores retornados;
- explicações breves sobre medidas, classificações e limitações;
- metodologia, fontes e privacidade acessíveis sem interromper a jornada;
- suporte a teclado e preferência por movimento reduzido.

## Fora do escopo

- login, prontuário, histórico de pacientes ou sincronização;
- backend, banco de dados e painel administrativo;
- diagnóstico, recomendação terapêutica ou decisão clínica automática;
- exportação identificável, compartilhamento de dados ou integrações;
- publicação npm do PediaMetric Core;
- aplicativo nativo, modo colaborativo ou internacionalização completa.

Exportação anônima, PWA e instalação offline podem ser avaliadas após a jornada principal estar concluída e validada.

## Privacidade e segurança clínica

Medidas, datas e resultados não devem sair do navegador nem aparecer em URL, telemetria, logs ou armazenamento persistente. O botão de limpeza remove o estado da avaliação. A aplicação usa o mínimo de dados necessário e não solicita nome, documento ou contato.

Alertas devem ser objetivos e não alarmistas. Plausibilidade estatística não equivale a erro de aferição, e classificação não equivale a diagnóstico. A interface sempre preserva o valor numérico completo recebido do Core e arredonda apenas sua representação visual.

## Critérios de sucesso

- a jornada pode ser concluída sem treinamento;
- entradas inválidas explicam como corrigir o problema;
- a mesma entrada produz resultados idênticos aos testes do Core;
- nenhum cálculo antropométrico existe na camada Web;
- a tela continua legível em celular e com movimento reduzido;
- a abertura é rápida e dados/gráficos pesados são carregados sob demanda;
- metodologia e origem dos dados podem ser auditadas.

