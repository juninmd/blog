---
title: "Um crash no meu servidor de CS 1.6 virou um linter de 165 regras"
description: "Três modos de jogo derrubaram meu servidor de Zombie Plague com o mesmo erro bobo. Em vez de só corrigir, transformei o crash em regra. Foi assim que nasceu o zplint, um linter em Rust para uma linguagem de 2004."
date: 2026-11-19
categoria: artigos
tags: [zplint, cs16, pawn, amxmodx, rust, linter, side-project]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/zplint
  - https://github.com/juninmd/zplint/blob/main/README.md
  - https://github.com/juninmd/zplint/commit/dc028ef
  - https://github.com/juninmd/zplint/commit/d7a4df3
  - https://github.com/juninmd/zplint/commit/fc33973
  - https://github.com/juninmd/zplint/commit/44c2e8c
  - https://github.com/juninmd/zplint/commit/cd90319
  - https://github.com/juninmd/zplint/pull/1
  - https://github.com/juninmd/server-do-junin
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-19-um-crash-no-servidor-virou-um-linter/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-19-um-crash-no-servidor-virou-um-linter/roteiro.md
---

Tem bug que você corrige. E tem bug que você corrige e promete que nunca mais vai deixar entrar.

O meu foi um `SIGSEGV` em `fakemeta_amxx_i386.so!get_tr2+228`. Para quem não vive no mundo do Counter-Strike 1.6, isso quer dizer o seguinte: o servidor caiu, todo mundo foi desconectado e o culpado estava num plugin escrito em **Pawn**, a linguagem de script do AMX Mod X. Eu mantenho um servidor de **Zombie Plague** (o repositório `server-do-junin` sobe ele em Docker, junto com um de CS2 Zombie Escape), e plugin de Zombie Plague é o tipo de código que roda há quinze anos na mão de muita gente diferente.

## O crash

A causa era quase ridícula de tão pequena. A função `get_tr2` do fakemeta lê dados de um traçado de raio. Quando você pede um membro float ou vetor, tipo `TR_flFraction` ou `TR_vecEndPos`, ela precisa de um terceiro parâmetro por referência para escrever o resultado.

Se você esquece esse terceiro parâmetro, o compilador não reclama. O plugin carrega. E aí, em tempo de execução, o fakemeta lê `params[3]` fora do array de parâmetros e **escreve** no endereço que sair dali. O detalhe mais irritante: o irmão dela, `set_tr2`, confere a quantidade de argumentos. O `get_tr2` não confere.

Isso não estava num lugar só. Estava em três modos de jogo diferentes: `zp50_gamemode_chaos`, `zp50_gamemode_protect_jeep` e `zp50_gamemode_boss_teddy`. Os três derrubaram o servidor de produção. Corrigi os três, claro. Mas a pergunta que ficou foi: quantos outros desses estão escondidos nos outros plugins?

## Corrigir não basta, tem que virar regra

A resposta que eu dei foi escrever a regra `tr2_missing_byref` no **zplint**. Ela marca como **erro** qualquer `get_tr2` com membro float ou vetor chamado com dois argumentos. Não tem uso legítimo dessa forma, então não faz sentido ser só um aviso. O teste cobre a forma errada, a forma certa com três argumentos e os membros inteiros como `TR_StartSolid`, que retornam por valor e não podem ser marcados.

Essa é a parte que eu mais gosto do projeto: cada crash que eu tomo vira uma linha de defesa permanente. O servidor quebrou uma vez por esse motivo; o linter garante que não quebra de novo pelo mesmo motivo.

## De onde o zplint veio

O zplint começou em julho de 2026 com um objetivo bem mais modesto. O primeiro commit descreve um linter em Rust com **27 detectores de padrões que derrubam o servidor** em tempo de execução, binário único, sem dependência nenhuma, rodando 300 arquivos em menos de um segundo.

Por que Rust para lintar uma linguagem de 2004? Porque eu queria uma coisa que qualquer dono de servidor baixasse e rodasse, sem instalar Python, Node ou o compilador do AMX Mod X. E porque um pacote de Zombie Plague pode ter centenas de `.sma`, alguns com milhares de linhas. Velocidade ali não é luxo, é o que faz alguém rodar o linter antes de subir o plugin em vez de depois que o servidor caiu.

Depois disso o número de regras foi subindo em ondas: 37, 90, 106, até chegar nas **165 regras** de hoje, divididas entre correção, suspeitas, performance, segurança e estilo. Hoje o zplint também formata código, aplica correções automáticas seguras, tem servidor LSP para o editor, modo watch, saída em SARIF e JUnit para CI, e até compila `.sma` para `.amxx` e desmonta bytecode.

## A regra mais importante: fonte primária

Linter que inventa regra é pior que linter nenhum. Ele grita em código correto, você aprende a ignorar, e quando ele acerta você já não está mais ouvindo.

Então eu adotei uma disciplina: toda regra nova sai de **fonte primária**. O próprio `.inc` do AMX Mod X, a documentação oficial ou o código-fonte do amxmodx. A regra `ham_recursion`, por exemplo, vem de um comentário literal do `hamsandwich.inc` que diz para ter muito cuidado com recursão: o `ExecuteHamB` redispara todos os hooks registrados, inclusive o que está rodando agora. A `handle_leak` vem do aviso do cellarray de que o plugin é responsável por liberar todo handle que cria. E foi confirmada contra o testsuite oficial do amxmodx, onde o `sorttest.sma` vaza handle em três pontos.

## Dois corpora como prova

A outra disciplina é que nenhuma regra entra sem passar por dois conjuntos de código reais.

O primeiro é o oficial: os plugins do repositório `alliedmodders/amxmodx`. Código mantido pelos autores da plataforma. A meta ali é **zero erros**. Se a regra marca erro em plugin oficial, ou o plugin oficial tem um bug real (raro) ou a regra está errada (bem mais comum).

O segundo é o mundo real: plugins de comunidade de dezenas de pacotes no GitHub, de Zombie Plague a Deathrun, JailBreak, CTF e KZ. No README atual isso dá 1.013 arquivos `.sma`, lintados em 46,5 segundos, com **zero panics**. Os 48 plugins oficiais passam com 0 erros e compilam todos.

Quando eu adicionei uma leva de 17 detectores de uma vez, os plugins oficiais continuaram com 0 erros e o corpus real ganhou 26 achados verdadeiros. É esse o número que me interessa: achado verdadeiro, não quantidade de alerta.

## Os falsos positivos me ensinaram mais que os acertos

O momento mais humilhante, e mais útil, foi rodar o zplint no `zplague-addons`, um repositório real. Saíram quatro falsos positivos, três do mesmo tipo: a regra não reconhecia o jeito como aquele código se protegia.

A `ham_recursion` só aceitava a guarda "oficial", desligar e religar o hook. Mas muita gente faz guarda de reentrância à mão: levanta uma flag global em volta do `ExecuteHamB` e testa essa flag na entrada do hook, geralmente embutida num early return composto. Quatro arquivos deixaram de ser marcados quando a regra aprendeu isso.

A `task_entity_not_validated` não entendia que quem chama um stock local do tipo `Valid(ent)`, que por dentro faz `pev_valid`, está tão protegido quanto quem chama `pev_valid` direto.

E teve o bug que afetava tudo: a função que responde "em que função eu estou?" não enxergava definições `stock` e `static`. Então um `message_begin` dentro de um stock era atribuído ao handler `public` logo acima, e a regra de recursão de mensagem disparava no lugar errado. No meio do conserto ainda apareceu uma regressão: uma chamada indentada a um stock passou a ser lida como definição. A correção foi ancorar a regex na coluna zero, porque em Pawn definição de função é sempre top-level.

Nenhum desses aparece se você testa só com o exemplo que você mesmo escreveu. Aparecem quando o linter encontra o código dos outros.

## O compilador que eu não queria escrever

A parte mais ambiciosa foi o `zpc`, o compilador. Para algumas regras, regex e tabela de API não bastam; eu precisava de uma árvore sintática de verdade. Então, numa sequência de commits em julho, vieram scanner, pré-processador, tabela de símbolos, parsers, sistema de tags, montador e gerador de imagem AMX.

O que me deu confiança para isso foi começar pelo **teste diferencial**: um harness que compila o mesmo código no `amxxpc` de referência e no meu, e compara. Toda divergência vai para um registro. Não é igual byte a byte, e o README diz isso com todas as letras: o `.amxx` gerado se comporta como o do AMX Mod X 1.10, mas não é idêntico ao do `amxxpc`.

Também tive que olhar a licença com cuidado. O `zpc` incorpora partes derivadas do compilador Pawn original, e no processo eu descobri que a biblioteca de onde isso vem **não** é uniformemente zlib. Hoje isso está documentado em `NOTICE`, `ATTRIBUTION.md` e `docs/LICENSING.md`, e o projeto é Apache-2.0 deixando claro que o `zpc` é um derivado modificado.

## O que eu levo disso

Três coisas, que valem para qualquer linguagem, não só para Pawn:

1. **Crash em produção é especificação.** Quando algo derruba o servidor, o conserto pontual resolve hoje. A regra resolve para sempre e para todo mundo que usar a ferramenta.
2. **Regra sem fonte é palpite.** Se eu não consigo apontar a linha do include, da documentação ou do código-fonte que justifica o alerta, a regra não entra.
3. **Código real derruba linter arrogante.** O corpus de terceiros é o que separa uma ferramenta que parece boa de uma que as pessoas deixam ligada no CI.

O CS 1.6 tem mais de vinte anos. A comunidade de servidor ainda está lá, mantendo plugins que ninguém mais documenta. Achei justo que essa comunidade tivesse uma ferramenta tão moderna quanto as que eu uso no trabalho.

## Fontes

- [Repositório do zplint](https://github.com/juninmd/zplint) e [README](https://github.com/juninmd/zplint/blob/main/README.md) (165 regras, corpora e limitações conhecidas)
- [Primeiro commit: 27 detectores](https://github.com/juninmd/zplint/commit/dc028ef)
- [Regra tr2_missing_byref e o crash de produção](https://github.com/juninmd/zplint/commit/d7a4df3)
- [Falsos positivos da homologação no zplague-addons](https://github.com/juninmd/zplint/commit/fc33973)
- [17 detectores novos com fonte primária](https://github.com/juninmd/zplint/commit/44c2e8c)
- [Harness diferencial contra o amxxpc](https://github.com/juninmd/zplint/commit/cd90319)
- [PR #1: paridade com o Biome (LSP, formatter, reporters)](https://github.com/juninmd/zplint/pull/1)
- [server-do-junin: servidores de CS 1.6 Zombie Plague e CS2 em Docker](https://github.com/juninmd/server-do-junin)
