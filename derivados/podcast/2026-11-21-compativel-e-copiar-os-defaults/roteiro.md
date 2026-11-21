# Podcast: Ser compatível com M.U.G.E.N é copiar até os defaults

> **Aviso de IA (ler na abertura):** "Este episódio foi roteirizado por IA, a partir das minhas experiências reais com meus projetos, e eu revisei antes de ir ao ar."

Formato curto, um apresentador (Antonio). Duração estimada: 5 minutos.

## Abertura (0:00–0:30)

[Vinheta curta, som de seleção de personagem de jogo de luta.]

Teve um personagem no meu motor de luta que carregava sem erro, entrava na luta, andava para frente e para trás. E nunca atacava. Esse bug resume tudo o que eu aprendi sobre compatibilidade.

## Bloco 1: o projeto (0:30–1:15)

O Ultimate MUGEN é um motor de luta 2D que eu estou escrevendo em Rust. Ele roda personagens clássicos do M.U.G.E.N no desktop, no celular e no navegador. Lê todos os formatos: def, sff, air, cmd, cns, snd. E mesmo assim o lutador não atacava.

## Bloco 2: o lutador que só andava (1:15–2:15)

O arquivo de estados comuns, o stcommon, eu só procurava na pasta do personagem. O M.U.G.E.N procura também na raiz do pacote e na pasta data. Os pacotes com vários lutadores colocam o arquivo justamente lá. Sem ele, o motor perdia o mapa de comandos. Andar funcionava. Atacar, não. A correção mexeu em dezessete linhas. O difícil foi entender que "carregou" não quer dizer nada.

## Bloco 3: os defaults são a especificação (2:15–3:30)

Isso se repete. Tempo de defesa: quando o arquivo não informa, o M.U.G.E.N copia de outro campo, e eu copiava do campo errado. Animação escrita como F310 mais uma conta: eu jogava a letra fora e a conta virava zero. Duas imunidades ao mesmo tempo: eu guardava uma só. Nenhum arquivo estava errado. Os meus defaults é que estavam.

## Bloco 4: quando não copiar (3:30–4:20)

Mas nem tudo se copia. Cenário com limite de câmera invertido derrubava a luta, então eu normalizo na leitura. Ler e gravar disco, cenário 3D, música de tracker: recusados de propósito, numa página que lista cada decisão. Compatibilidade sem lista do que não é compatível vira falha silenciosa.

## Fechamento (4:20–5:00)

Minha posição: o formato é o contrato escrito, o comportamento do programa original é o contrato que vale. Implementar o primeiro dá um README bonito. O segundo é o que faz o lutador soltar o soco. O texto completo, com os links de cada correção, está no blog.
