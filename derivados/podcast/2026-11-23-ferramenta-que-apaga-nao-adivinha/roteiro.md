# Podcast: Ferramenta que apaga não pode adivinhar

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e revisado por outro agente de IA antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta, som de algo sendo apagado.]

Uma ferramenta que cria arquivos pode errar à vontade. Uma ferramenta que apaga não tem segunda chance. E o jeito mais comum de ela errar não é travando. É adivinhando.

## O projeto (0:30–1:15)

Em 2016 eu fiz um script para apagar pastas node_modules que o Windows se recusava a remover, porque os caminhos ficavam longos demais. O truque: renomear cada subpasta para um caminho curto antes de apagar. Hoje ele se chama Hakai, como o poder de destruição de Dragon Ball Super.

## Os chutes (1:15–3:00)

Em novembro de 2026 o projeto recebeu uma série de correções. Lendo em ordem, todas fechavam um lugar onde o código adivinhava.

Primeiro, o symlink: o Hakai seguia links e apagava o conteúdo de pastas fora do alvo. Trocar statSync por lstatSync resolveu.

Segundo, o nome livre: ele assumia que alvo1 não existia. Se existisse, podia substituir uma pasta em silêncio.

Terceiro, os argumentos: um caminho com espaço e sem aspas chegava em pedaços, e o Hakai apagava só o primeiro pedaço. Agora argumento sobrando é erro e nada é apagado.

## O que sobra (3:00–4:00)

Quando algo não podia ser apagado, a pasta ficava com o nome temporário e o caminho original sumia. Agora ela volta para onde estava. E o programa parou de dizer "Exclusão concluída" quando não concluiu.

## Fechamento (4:00–5:00)

A regra: ferramenta destrutiva falha fechada. Olhe para a entrada, não para onde ela aponta. Ambiguidade é erro. Falha parcial deixa o mundo como estava. E a mensagem final é parte da segurança.

Quando não sabe o que fazer, a coisa mais segura que uma ferramenta de destruição pode fazer é nada.
