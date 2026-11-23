---
title: "Ferramenta que apaga não pode adivinhar"
description: "O Hakai nasceu em 2016 para apagar node_modules que o Windows se recusava a remover. Dez anos depois, as correções mais importantes dele foram todas sobre a mesma coisa: quando estiver em dúvida, não apague."
date: 2026-11-23
categoria: opinioes
tags: [hakai, cli, nodejs, windows, side-project]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/Hakai
  - https://github.com/juninmd/Hakai/blob/master/README.md
  - https://github.com/juninmd/Hakai/commit/77271b8
  - https://github.com/juninmd/Hakai/commit/88cd9b4
  - https://github.com/juninmd/Hakai/commit/a5872ef
  - https://github.com/juninmd/Hakai/commit/52f3ed7
  - https://github.com/juninmd/Hakai/commit/a61a2e3
  - https://github.com/juninmd/Hakai/commit/e26c391
  - https://github.com/juninmd/Hakai/commit/4ae19fc
  - https://github.com/juninmd/Hakai/commit/359e149
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-23-ferramenta-que-apaga-nao-adivinha/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-23-ferramenta-que-apaga-nao-adivinha/roteiro.md
---

Uma ferramenta que cria arquivos pode errar à vontade. Você apaga o que sobrou e tenta de novo. Uma ferramenta que apaga não tem essa segunda chance. E o jeito mais comum de ela errar não é travando. É adivinhando.

Eu aprendi isso revisitando um projeto meu de 2016.

## Um problema de outra época

O Hakai começou em outubro de 2016, com outro nome. O problema era bem daquela época: em versões antigas do Node.js, o `node_modules` virava uma boneca russa de dependências dentro de dependências, e os caminhos ficavam tão longos que o Windows simplesmente se recusava a apagar a pasta. Você clicava em excluir e o sistema dizia que não.

A solução era um truque simples. Antes de apagar uma subpasta, o Hakai renomeia ela para um caminho curto, do lado da pasta alvo (`alvo1`, `alvo2`, e assim por diante), esvazia e remove. O caminho longo deixa de existir antes de virar problema. Em 2018 o projeto ganhou o nome atual, tirado do poder de destruição dos Deuses da Destruição de Dragon Ball Super. Mais recentemente ganhou até uma animação de esfera de energia no terminal, com contador de itens destruídos.

Por muito tempo eu achei que era isso: um script pequeno, com um truque esperto e uma animação bonita. Aí, em novembro de 2026, o repositório passou por uma sequência de correções. Quase todas feitas com agentes de IA, quase todas pequenas. E lendo o histórico em ordem, ficou claro que cada uma delas fechava um lugar onde o Hakai adivinhava em vez de perguntar.

## Os chutes que estavam escondidos no código

**O chute do symlink.** O deleter usava `statSync`, que segue links simbólicos. Se dentro da pasta tivesse um link para outro diretório, o Hakai tratava o link como pasta de verdade, renomeava e apagava o conteúdo do alvo. Ou seja: você pedia para apagar uma pasta e ele apagava coisas fora dela. A correção ([77271b8](https://github.com/juninmd/Hakai/commit/77271b8)) foi trocar por `lstatSync`, que remove só o link. Uma letra de diferença no nome da função, uma categoria inteira de desastre a menos.

**O chute do nome livre.** Os caminhos curtos eram só a raiz mais um contador. O código assumia que `alvo1` não existia. Se existisse uma pasta irmã com esse nome, o rename falhava ou, pior, substituía em silêncio um diretório vazio, deixando a árvore meio apagada. A correção ([a5872ef](https://github.com/juninmd/Hakai/commit/a5872ef)) passou a procurar um nome realmente livre antes de renomear. O mesmo commit tratou a barra no final do caminho, que fazia as pastas encurtadas irem parar dentro da própria raiz.

**O chute do "não existe".** Para checar se o alvo existia, o CLI usava `fs.existsSync`, que também segue symlinks. Um link quebrado era reportado como caminho inexistente e nunca podia ser removido ([52f3ed7](https://github.com/juninmd/Hakai/commit/52f3ed7)). Esse é o erro oposto: não apagar o que você pediu. Menos perigoso, mas é a mesma raiz. O código deduzia em vez de olhar para a entrada real.

**O chute dos argumentos.** Esse é o meu favorito, porque o README sempre avisou: "não se esqueça das aspas". Um caminho com espaço, sem aspas, chega no programa como vários argumentos. O Hakai pegava só o primeiro e apagava esse, sem avisar nada. `hakai D:\Meus Projetos` virava, na prática, um pedido para apagar `D:\Meus`. A correção mais recente ([359e149](https://github.com/juninmd/Hakai/commit/359e149)) faz o contrário: argumento sobrando é erro, sai com código 2 e nada é apagado. O comentário no código diz exatamente o motivo: apagar só o primeiro pedaço seria perda de dados silenciosa.

## Quando dá errado, deixe as coisas onde estavam

Tem uma segunda família de correções que eu acho igualmente importante, e que não é sobre apagar a coisa errada. É sobre o que sobra quando não dá para apagar tudo.

Imagine que um arquivo lá no fundo está travado por outro processo. Antes, a pasta que o continha ficava com o nome temporário (`alvo3`, por exemplo) e o caminho original sumia. Seus arquivos que sobraram estavam lá, mas num diretório que você nunca criou e não sabia procurar. A correção ([a61a2e3](https://github.com/juninmd/Hakai/commit/a61a2e3)) devolve a pasta para o caminho original quando algo dentro dela falha. Depois veio outro ajuste ([4ae19fc](https://github.com/juninmd/Hakai/commit/4ae19fc)): a mensagem de erro passou a citar o caminho restaurado em vez do nome temporário que já nem existia, e uma raiz relativa como `.` deixou de colocar as pastas encurtadas dentro da própria árvore.

E tinha a parte da comunicação. O CLI sempre saía com código 0, inclusive quando o caminho não existia ou quando a exclusão falhava ([88cd9b4](https://github.com/juninmd/Hakai/commit/88cd9b4)). E imprimia "Exclusão concluída" incondicionalmente, mesmo com a pasta ainda no disco ([e26c391](https://github.com/juninmd/Hakai/commit/e26c391)). Hoje ele diz "Exclusão incompleta", conta os erros, lista cada um no stderr e sai com 1.

## A regra que eu tiro disso

Ferramenta destrutiva precisa falhar fechada. Quando ela não tem certeza do que você quis dizer, a resposta certa é parar, não escolher a interpretação mais provável.

Isso parece óbvio escrito assim. Mas olhando os bugs, nenhum deles era uma decisão consciente de arriscar. Eram defaults. `statSync` em vez de `lstatSync` porque é o que vem na cabeça primeiro. `argv[2]` porque o programa só esperava um argumento. Um contador porque ninguém pensou que poderia existir uma pasta `alvo1`. Cada linha fazia sentido isolada. O perigo estava no que ela assumia sem dizer.

Então o que eu levo do Hakai para qualquer coisa que apague, mova ou sobrescreva:

1. **Olhe para a entrada, não para onde ela aponta.** Link é link. Se você vai agir sobre um caminho, use a informação daquele caminho, não do destino dele.
2. **Ambiguidade é erro.** Argumento sobrando, nome já ocupado, raiz estranha. Se dá para ler de dois jeitos, não leia de nenhum: pare e explique.
3. **Falha parcial deixa o mundo como estava.** O usuário precisa encontrar o que sobrou no lugar onde ele deixou.
4. **A mensagem final é parte da segurança.** "Concluída" quando não foi concluída faz a pessoa seguir em frente achando que pode.

Tem uma ironia nisso tudo. A seção de limitações do README ainda diz que o código de saída é sempre 0, coisa que deixou de ser verdade com essas correções. Até a documentação de uma ferramenta que apaga precisa ser revisada com o mesmo cuidado. Fica anotado.

O Hakai continua sendo um script pequeno com uma animação exagerada. Mas agora, quando não sabe o que fazer, ele faz a coisa mais segura que uma ferramenta de destruição pode fazer: nada.
