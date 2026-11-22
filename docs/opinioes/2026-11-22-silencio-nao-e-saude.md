---
title: "Silêncio não é saúde: minha ferramenta de diagnóstico mentia quando não conseguia ler"
description: "O why-is-my-pod-sad dizia que um pod estava bem quando, na verdade, nem tinha conseguido ler os eventos dele. Uma ferramenta de diagnóstico que não sabe precisa dizer que não sabe."
date: 2026-11-22
categoria: opinioes
tags: [why-is-my-pod-sad, kubernetes, diagnostico, cli, side-project]
status: publicado
ia: true
autoria: ia
autor: Antonio
fontes:
  - https://github.com/juninmd/why-is-my-pod-sad
  - https://github.com/juninmd/why-is-my-pod-sad/blob/main/README.md
  - https://github.com/juninmd/why-is-my-pod-sad/commit/0b30a68
  - https://github.com/juninmd/why-is-my-pod-sad/commit/c27a825
  - https://github.com/juninmd/why-is-my-pod-sad/commit/58e2e3c
  - https://github.com/juninmd/why-is-my-pod-sad/commit/b9f0067
  - https://github.com/juninmd/why-is-my-pod-sad/commit/92dfd58
  - https://github.com/juninmd/why-is-my-pod-sad/commit/948d25c
derivados:
  podcast:
    status: roteiro
    roteiro: derivados/podcast/2026-11-22-silencio-nao-e-saude/roteiro.md
  video:
    status: roteiro
    roteiro: derivados/video/2026-11-22-silencio-nao-e-saude/roteiro.md
---

O pior resultado que uma ferramenta de diagnóstico pode dar não é o erro. É o verde falso.

Descobri isso no meu próprio código. O **why-is-my-pod-sad** (ou `wimps`, quando instalado global) é uma CLI que fiz para parar de repetir o mesmo ritual toda vez que um pod no meu cluster fica estranho: `kubectl describe`, `kubectl logs --previous`, `kubectl get events` e ler o spec das probes. Ela faz os quatro de uma vez, correlaciona e devolve um veredito com o próximo passo. Quando está tudo certo, aparece um check verde e a frase "Este pod não está triste".

O problema é que essa frase aparecia em casos em que a ferramenta simplesmente não tinha conseguido olhar.

Minha opinião, depois de uma semana corrigindo bug atrás de bug nesse projeto: **uma ferramenta de diagnóstico tem que separar "não achei problema" de "não consegui ver". Confundir as duas coisas é pior do que não ter ferramenta nenhuma.**

## O bug que me fez escrever isso

No código, os dados opcionais (eventos e logs) eram buscados por uma função chamada `kubectlSoft`. A ideia era razoável: se o log anterior de um container não existe, porque ele nunca reiniciou, isso não é erro. Então a função engolia qualquer falha e devolvia `null`.

Qualquer falha. Inclusive "você não tem permissão para listar eventos". Inclusive "o cluster demorou demais e o request estourou o timeout".

Resultado: rodando com uma ServiceAccount sem `list events` ou sem `get pods/log`, a ferramenta recebia nada, interpretava como "não tem evento problemático" e me entregava o check verde. Um diagnóstico de saúde feito sobre dados que nunca foram lidos.

A correção, no PR #35, foi trocar o `null` silencioso por uma função que devolve o motivo da falha (`kubectlTry`), marcar no snapshot quando a falha é de acesso ou de conectividade e transformar isso num aviso próprio, `data-unavailable`: "Diagnóstico incompleto: o kubectl não leu eventos ou logs". O aviso já sugere o próximo passo, que é conferir `kubectl auth can-i get events` e `kubectl auth can-i get pods/log`.

E o caso legítimo continua legítimo: o log anterior ausente de um container que nunca reiniciou segue sem alarme. A diferença é que agora a ferramenta sabe *por que* não tem dado, em vez de tratar toda ausência igual.

## Não foi um bug isolado

O que me incomodou foi perceber que o #35 era só o mais explícito de uma família. Olhando os commits dos últimos dias, quase todos têm a mesma forma: a ferramenta falando com confiança sobre algo que ela não tinha como saber.

**Eventos do pod errado.** Os eventos eram filtrados só pelo nome do pod. Só que um pod recriado com o mesmo nome, coisa normal em StatefulSet ou depois de um delete manual, herdava os eventos do anterior por até uma hora. Um pod saudável podia ser marcado como crítico por causa de um `FailedMount` velho, de outra instância. A correção (#32) prende o seletor também no `uid` do pod.

**Probe de um container culpando os outros.** Eventos `Unhealthy` eram casados no pod inteiro. Se um sidecar falhava na readiness, todos os outros containers apareciam com a mesma acusação. Agora o evento carrega o container a partir do `fieldPath`, e as regras de probe só olham os eventos daquele container (#30).

**Evidência que não era evidência.** Na regra de `image-pull`, eu mostrava como prova qualquer evento com "Failed" ou "BackOff" no motivo. Isso pega crash back-off de outro container, `FailedMount`, `FailedScheduling`. Como eu cortava nos dois últimos, o evento de pull de verdade muitas vezes nem aparecia. Agora só entram eventos de imagem, daquele container (#33).

**O pod mais triste que não era o mais triste.** Quando você roda sem nome, a ferramenta escolhe o pod mais quebrado do namespace. A pontuação olhava só o primeiro container com motivo de espera. Se esse era um sidecar em `ContainerCreating`, um `CrashLoopBackOff` em outro container era ignorado e o pod ganhava nota menor do que merecia. A ferramenta ia diagnosticar um pod menos quebrado (#34).

**Endpoint contado duas vezes.** No modo `svc`, um endpoint pronto que aparecia em mais de uma EndpointSlice era contado mais de uma vez (#31). Número de réplicas prontas inflado é exatamente o tipo de coisa que te faz olhar para o lugar errado.

Nenhum desses bugs fazia a ferramenta travar. Nenhum gerava stack trace. Todos geravam uma resposta bonita, formatada, com cor, e errada.

## Por que isso é pior em ferramenta de diagnóstico

Se um linter dá falso positivo, você xinga e segue. Se um teste quebra, você investiga. Mas uma ferramenta cujo trabalho é dizer "o problema está aqui" ou "está tudo bem" ocupa outro lugar: ela decide para onde você *não* vai olhar.

Quando o `wimps` diz que o pod não está triste, eu paro de procurar no pod. Vou para o Service, para o Ingress, para a aplicação. Se esse verde é falso, eu acabo de perder tempo na camada errada, e com uma confiança que eu não teria sem a ferramenta. O `kubectl describe` cru, pelo menos, não me prometia nada.

E tem o lado dos scripts. O README documenta os exit codes: `0` saudável, `1` só avisos, `2` crítico, `3` erro de execução. É para usar assim: `wimps api || alerta`. Um falso `0` não é só uma frase errada no terminal; é um alerta que não dispara.

Por isso o aviso de dados indisponíveis entrou como `warn`, não como nota de rodapé. Ele muda o exit code. Diagnóstico incompleto não pode sair com o mesmo código de diagnóstico limpo.

## O que eu mudei na forma de pensar

Três coisas que viraram regra para mim nesse projeto, e que acho que valem para qualquer ferramenta que dá veredito:

1. **Ausência de dado precisa ter motivo.** `null` não é resposta. "Não existe" e "não consegui ler" são estados diferentes e precisam de tipos diferentes no código. A troca de `kubectlSoft` por `kubectlTry` é pequena, mas é ela que permite a regra dizer a verdade.

2. **Evidência tem dono.** Todo evento, toda linha de log que aparece como prova precisa ser daquela instância e daquele container. Prova emprestada de outro pod ou de outro container é pior do que nenhuma prova, porque convence.

3. **O teste que importa é o do caso que parece saudável.** Os testes que vieram junto com essas correções não testam o pod em `CrashLoopBackOff` óbvio. Testam o pod recriado com o mesmo nome, o sidecar que falha sozinho, a ServiceAccount sem permissão. É no caso aparentemente verde que a ferramenta mente.

## A frase que eu queria que a ferramenta dissesse

Fiz o `wimps` porque queria um veredito, não um dump. Continuo achando que esse é o valor dela: ler quatro fontes e me dizer o próximo passo. Mas aprendi que um bom veredito inclui a margem de erro. Às vezes a resposta certa não é "seu pod está triste" nem "seu pod está bem". É "não consegui ver o suficiente para dizer, e foi por isso".

Médico que não pediu o exame não deveria dizer que você está saudável. Ferramenta também não.
