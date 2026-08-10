# Direção visual e sistema de interface

## Personalidade

O PediaMetric combina precisão médica com acolhimento pediátrico. A interface deve parecer tecnológica e confiável, sem ficar fria, lúdica demais ou visualmente carregada. A logo PediaMetric é a origem da identidade: azul-marinho, ciano e turquesa, com referências a crescimento e mensuração.

Palavras-guia: **preciso, luminoso, fluido, sereno e pediátrico com discrição**.

## Aparência

- base clara ou azul muito escuro conforme a composição aprovada;
- superfícies em camadas, bordas suaves e transparência controlada;
- ciano e turquesa para ações, progresso e dados positivos;
- cores semânticas distintas para atenção, erro e indisponibilidade;
- formas curvas, pontos e marcas de crescimento como elementos ambientais;
- ilustrações abstratas e inclusivas, sem associar uma classificação a aparência corporal.

O conteúdo clínico deve ter contraste e estabilidade. Efeitos tecnológicos permanecem no ambiente, cabeçalho e transições, nunca atrás de números essenciais.

## Tokens mínimos

O projeto deve definir variáveis para cores, tipografia, espaçamento, raios, sombras, camadas, largura de conteúdo, duração e curvas de animação. Componentes consomem tokens; valores visuais repetidos não devem ser espalhados por arquivos.

A escala de espaçamento pode usar múltiplos de 4 px. Raios devem formar uma família curta. Tipografia deve priorizar legibilidade de números, sinais e casas decimais. Usar algarismos tabulares em tabelas e resultados quando disponível.

## Componentes essenciais

- cabeçalho com logo e acesso à metodologia;
- introdução curta e chamada para iniciar;
- etapa ou seção de identificação e medidas;
- campos com rótulo persistente, unidade e mensagem contextual;
- seletor segmentado acessível;
- cartões de resumo e indicador;
- gráfico com legenda, eixos e alternativa textual;
- alerta de plausibilidade;
- ações de corrigir e limpar;
- painéis de metodologia, privacidade e limitações.

Estados obrigatórios: padrão, foco visível, preenchido, inválido, desabilitado, processamento, resultado e falha inesperada.

## Movimento

O movimento explica mudança de estado e reforça a sensação de precisão:

- entrada escalonada curta das seções;
- transição suave entre formulário e resultado;
- desenho progressivo da curva após o cálculo;
- feedback imediato em seletores e botões;
- elementos decorativos lentos, com baixa amplitude.

Priorizar `transform` e `opacity`. Interações comuns devem durar aproximadamente 120–240 ms; transições narrativas podem chegar a 500 ms. Não usar movimento contínuo em áreas de leitura. Com `prefers-reduced-motion`, remover deslocamentos, paralaxe, desenho animado e decoração móvel, preservando apenas mudanças instantâneas ou fades discretos.

## Responsividade

Projetar primeiro para 360 px. Em celular, a jornada é uma coluna, campos têm área de toque confortável e resultados aparecem antes dos detalhes. Em telas maiores, formulário e contexto podem compartilhar espaço; resultados podem formar grade sem reduzir legibilidade.

Testar pelo menos 360, 390, 768, 1024 e 1440 px. Não depender de hover. Gráficos devem responder ao contêiner e conservar legenda e valores em telas estreitas.

## Acessibilidade e linguagem

Meta: WCAG 2.2 AA. Todo campo possui rótulo programático, unidade, instrução e erro associado. Ordem de tabulação segue a leitura. Cor nunca é o único portador de significado. Gráficos têm resumo textual e resultados completos acessíveis.

Usar português brasileiro direto. Explicar termos técnicos no ponto de uso, sem transformar a tela em manual. Evitar “normal” como sinônimo de saudável e evitar mensagens alarmistas. Sempre distinguir classificação estatística, plausibilidade e diagnóstico clínico.

## Ativos de marca

Preservar a logo PNG original. Derivar versões otimizadas apenas para usos definidos: cabeçalho, ícone, compartilhamento e fundo contrastante. Não redesenhar a marca nem alterar proporções sem aprovação. Ativos gerados por IA devem ser revisados quanto a anatomia, inclusão, tom médico e peso de carregamento.

