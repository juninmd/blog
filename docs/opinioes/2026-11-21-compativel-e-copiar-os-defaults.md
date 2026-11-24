---
title: "Ser compatível com M.U.G.E.N é copiar até os defaults que ninguém escreveu"
description: "Meu motor de luta em Rust já lê todos os formatos do M.U.G.E.N. Mesmo assim, personagens carregavam, andavam e nunca atacavam. Ler o arquivo é a parte fácil; a especificação de verdade é o comportamento do motor antigo."
date: 2026-11-21
categoria: opinioes
tags: [ultimate-mugen, rust, compatibilidade, jogos, side-project]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/ultimate-mugen
  - https://github.com/juninmd/ultimate-mugen/blob/master/README.pt-BR.md
  - https://github.com/juninmd/ultimate-mugen/blob/master/docs/wiki/pt-BR/Decisoes-de-Compatibilidade.md
  - https://github.com/juninmd/ultimate-mugen/commit/6a60c73
  - https://github.com/juninmd/ultimate-mugen/commit/c23ee28
  - https://github.com/juninmd/ultimate-mugen/commit/178ede85
  - https://github.com/juninmd/ultimate-mugen/commit/0b7767f
  - https://github.com/juninmd/ultimate-mugen/commit/072a3c3
  - https://github.com/juninmd/ultimate-mugen/commit/538029e
  - https://github.com/juninmd/ultimate-mugen/commit/2f1a668
  - https://github.com/juninmd/ultimate-mugen/commit/fb95876
  - https://github.com/juninmd/ultimate-mugen/commit/157de39
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-21-compativel-e-copiar-os-defaults/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-21-compativel-e-copiar-os-defaults/roteiro.md
---

Teve um bug no **Ultimate MUGEN** que resume bem o projeto inteiro. O personagem importava sem erro nenhum. Aparecia na tela de seleção, entrava na luta, andava para frente e para trás. E nunca atacava. Nenhum soco, nenhum especial. Só ficava ali, passeando.

O motor não reclamava de nada, porque do ponto de vista dele estava tudo certo. O arquivo tinha sido lido. O problema é que ele tinha sido lido do jeito errado.

Minha opinião, depois de algumas centenas de PRs nesse repositório: **compatibilidade não é saber ler o formato. É reproduzir o comportamento do programa original, inclusive o que ninguém escreveu em lugar nenhum.**

## O projeto, rapidinho

O Ultimate MUGEN é um motor de luta 2D que estou escrevendo do zero em Rust. Ele roda personagens e cenários clássicos do M.U.G.E.N, aquele motor dos anos 2000 que virou uma comunidade gigante de gente fazendo lutador de tudo quanto é anime e jogo. Também tem um formato próprio de personagem, em JSON, e um elenco nativo em pixel art. Roda no desktop, no celular e no navegador, com simulação fixa a 60 Hz e determinística, que é a base para replay e netplay com rollback.

![Tela do Ultimate MUGEN salva no repositório (screenshots/13c-community-vs-original.jpg, commit 178ede85, 02/11/2026): Restaze, personagem original da comunidade M.U.G.E.N, levando um chute de Jin Kazaguruma, do elenco nativo, num cenário em preto e branco com barras de vida e tempo 94](/imagens/2026-11-21-compativel-e-copiar-os-defaults/tela-178ede85.jpg)

No README eu listo com orgulho: `.def`, `.sff` v1 e v2, `.air`, `.cmd`, `.cns`, `.snd`, `.act`, cenários, VM de expressões, mais de 90 state controllers. Tudo verdade. E nada disso garante que um personagem da comunidade vai se comportar como se comportava no M.U.G.E.N.

## O lutador que só andava

Voltando ao bug. O `.def` de um personagem tem um campo `stcommon`, que aponta para o arquivo de estados comuns (andar, pular, cair, levantar). O meu loader só lia esse campo quando ele era um nome de arquivo simples, e só procurava na pasta do personagem.

Só que o M.U.G.E.N resolve esse caminho igual a qualquer outro arquivo: pasta do personagem, raiz do pacote e a pasta `data/`. E os "fullgames", aqueles pacotes com vários personagens juntos, costumam mandar `common/common1.cns` ou `data/common1.cns`. Resultado: o motor não achava o arquivo, perdia o `[Statedef -1]`, que é onde mora o mapa de comandos, e perdia os estados customizados da série 5000. O lutador andava porque andar vinha de outro lugar. Atacar dependia justamente do que tinha sumido.

A correção ([#737](https://github.com/juninmd/ultimate-mugen/commit/6a60c73)) foi pequena: usar a mesma função de resolução de caminho que o resto do loader usa, mantendo a proteção contra `..`. Dezessete linhas mexidas. O difícil não foi corrigir, foi perceber que "importou sem erro" não queria dizer nada.

![Commit 6a60c73 do Ultimate MUGEN, de 20/11/2026: resolve o stcommon na pasta do personagem, na raiz do pacote e em data/](/imagens/2026-11-21-compativel-e-copiar-os-defaults/6a60c73.png)

## Os defaults são a especificação

O padrão se repete em quase todo `fix(mugen)` dos últimos dias. Alguns exemplos que entraram só entre ontem e hoje:

- **Defesa sem os campos opcionais** ([#756](https://github.com/juninmd/ultimate-mugen/commit/c23ee28)). No M.U.G.E.N, `guard.slidetime` assume o valor de `guard.hittime` quando não é informado, e `guard.ctrltime` assume o de `guard.slidetime`. Meu motor caía para `ground.slidetime` nos dois. Todo golpe que não declarava esses campos dava o tempo errado de bloqueio. Nenhum arquivo estava errado; meu default é que estava.
- **Números com letra na frente** ([#734](https://github.com/juninmd/ultimate-mugen/commit/0b7767f)). `anim = F310+life%10` é legal no M.U.G.E.N: o `F` diz "use a animação do fightfx" e o resto é uma expressão. Eu tirava a letra e tentava converter o resto para inteiro. A conta falhava, virava zero, e o relatório de compatibilidade acusava um "trigger desconhecido f310" que não existia.
- **Duas imunidades ao mesmo tempo** ([#747](https://github.com/juninmd/ultimate-mugen/commit/072a3c3)). `NotHitBy` e `HitBy` têm dois slots independentes, cada um com seu timer. Eu guardava um só, então a segunda imunidade apagava a primeira.
- **Prioridade de golpe** ([#741](https://github.com/juninmd/ultimate-mugen/commit/538029e)). O `HitDef` aceita `priority = 7, Miss`, mas eu lia só o número e jogava fora a classe. Um agarrão marcado como Miss trocava golpe com um jab, e um Dodge apanhava mesmo assim. Na primeira tentativa de correção eu exagerei e fiz Miss nunca acertar ninguém, o que quebrou um teste de carga: um agarrão Miss ainda tem que pegar o oponente parado. Miss e Dodge só valem quando dois HitDefs se encontram.
- **`stateowner` apontando para si mesmo** ([#749](https://github.com/juninmd/ultimate-mugen/commit/2f1a668)). Quando um personagem está num estado dado por outro (um agarrão, por exemplo), `stateowner` tem que ler as variáveis de quem deu o estado. Eu devolvia o próprio lutador. Uma linha.

![Commit c23ee28, de 21/11/2026: guard.slidetime e guard.ctrltime assumem o valor de guard.hittime quando não são informados, como no M.U.G.E.N](/imagens/2026-11-21-compativel-e-copiar-os-defaults/c23ee28.png)

Nenhum desses bugs aparece lendo a documentação do formato com pressa. Eles aparecem quando você carrega personagem real, feito por gente real, que confiou no comportamento do motor antigo sem saber que estava confiando.

## Às vezes o certo é não copiar

Isso não quer dizer copiar tudo de olho fechado. Um cenário com `boundleft` maior que `boundright` carregava no M.U.G.E.N, e no meu motor fazia a luta entrar em pânico na primeira atualização da câmera, porque o `clamp` do Rust exige mínimo menor ou igual ao máximo. Ali a decisão foi normalizar os limites na hora de ler ([#727](https://github.com/juninmd/ultimate-mugen/commit/fb95876)): conteúdo importado com sinal trocado não pode derrubar a partida.

E tem coisa que eu recuso de propósito, e está escrito numa página só para isso, as [decisões de compatibilidade](https://github.com/juninmd/ultimate-mugen/blob/master/docs/wiki/pt-BR/Decisoes-de-Compatibilidade.md). `LoadFile` e `SaveFile` são rejeitados porque personagem roda dentro de uma luta determinística e não pode ler disco. Cenário 3D em glTF, rejeitado. Música de tracker, rejeitada por enquanto, com aviso e a trilha embutida no lugar. Tem até um desvio de física intencional: no M.U.G.E.N, um lutador atingido repetidas vezes num estado sem gravidade fica flutuando; no meu, ele cai.

Para mim essa página vale tanto quanto o código. Compatibilidade sem lista do que não é compatível vira falha silenciosa, que é exatamente o tipo de bug que me fez perder tempo com o lutador que só andava. Quem faz personagem merece uma resposta clara, não um soco que não sai.

## Como eu acho isso agora

O que mudou foi parar de confiar em "carregou". Hoje o projeto tem testes que varrem o elenco inteiro procurando estados travados, golpes que não alcançam e invariantes de partida. Eles ficaram tão pesados, uns 130 dos 243 segundos da suíte, que eu movi as varreduras completas para um job noturno ([#743](https://github.com/juninmd/ultimate-mugen/commit/157de39)) e deixei um smoke test como portão de PR. E tem a ferramenta que dissecou quatro pacotes de M.U.G.E.N da comunidade para reconstruir um dos meus lutadores com frame data de verdade.

Mas o mais útil continua sendo o mais simples: pegar personagem real e ver se ele faz o que fazia antes. Quando não faz, a resposta quase nunca está no arquivo. Está no que o motor antigo fazia quando o arquivo ficava em silêncio.

Então, se você está escrevendo um leitor de formato legado, seja de jogo, de planilha ou de banco, minha posição é essa: **o formato é o contrato que está escrito; o comportamento do programa original é o contrato que vale.** Implementar o primeiro dá um README bonito. Implementar o segundo é o que faz o lutador soltar o soco.

## Fontes

- [Repositório do Ultimate MUGEN](https://github.com/juninmd/ultimate-mugen) e [README em português](https://github.com/juninmd/ultimate-mugen/blob/master/README.pt-BR.md) (formatos suportados, determinismo, plataformas)
- [Decisões de compatibilidade](https://github.com/juninmd/ultimate-mugen/blob/master/docs/wiki/pt-BR/Decisoes-de-Compatibilidade.md) (o que é rejeitado de propósito e o desvio de física)
- [#737: resolver stcommon na pasta do personagem, raiz do pacote e data/](https://github.com/juninmd/ultimate-mugen/commit/6a60c73)
- [#756: defaults de guard.slidetime e guard.ctrltime](https://github.com/juninmd/ultimate-mugen/commit/c23ee28)
- [#734: expressões com prefixo F e S](https://github.com/juninmd/ultimate-mugen/commit/0b7767f)
- [#747: slots independentes de NotHitBy e HitBy](https://github.com/juninmd/ultimate-mugen/commit/072a3c3)
- [#741: prioridade, Miss e Dodge no HitDef](https://github.com/juninmd/ultimate-mugen/commit/538029e)
- [#749: stateowner aponta para quem deu o estado](https://github.com/juninmd/ultimate-mugen/commit/2f1a668)
- [#727: normalizar limites de câmera invertidos](https://github.com/juninmd/ultimate-mugen/commit/fb95876)
- [#743: varreduras do elenco em job noturno](https://github.com/juninmd/ultimate-mugen/commit/157de39)
