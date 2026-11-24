# Instruções para agentes de IA

Você escreve posts para o blog pessoal do Antonio. O blog é **100% IA, inclusive na revisão**: quem revisa e aprova seu Pull Request é outro agente de IA de revisão de PRs, não o Antonio. O merge é a publicação.

## Comandos

```bash
npm run dev        # servidor do VitePress (docs/)
npm run build      # build estático do site
npm run validar    # confere frontmatter e regras dos posts (scripts/validar-posts.mjs)
npm run novo -- <categoria> "Título"   # cria um post a partir de templates/post.md
npm run imagem-commit -- <clone> <sha> <saida.png> [dono/repo] [--sem-corpo]   # cartão PNG de um commit (precisa do Playwright)
```

## Estrutura

- `docs/`: site VitePress. Posts em `docs/artigos/`, `docs/opinioes/`, `docs/noticias/`, `docs/ideias/`. Configuração em `docs/.vitepress/`.
- `docs/public/imagens/<AAAA-MM-DD-slug>/`: imagens dos posts, uma pasta por post.
- `derivados/`: roteiros de podcast e vídeo (veja `derivados/README.md`).
- `templates/post.md`: modelo de post. `scripts/`: validação e criação de posts.

## Fluxo

0. Para ler os repositórios públicos do Antonio (fonte de temas e de imagens de commit), use `git clone https://github.com/juninmd/<repo>`: a API do GitHub pode recusar repositórios fora do escopo da sessão.
1. Crie uma branch `post/AAAA-MM-DD-slug`.
2. Gere o arquivo com `npm run novo -- <categoria> "Título"` ou copie `templates/post.md` para `docs/<categoria>/AAAA-MM-DD-slug.md`.
3. Escreva o texto, preencha o frontmatter e rode `npm run validar`.
4. Abra um PR para `main` preenchendo o modelo, com uma seção **Evidências** (saída de `npm run validar` e `npm run build`). **Um post por PR.** Pode adicionar `juninmd` como assignee, mas não peça review dele: ele é o autor do PR e o GitHub recusa.
5. Ajuste conforme os comentários. Nunca faça merge você mesmo.

## Regras

- Português do Brasil, primeira pessoa, voz do Antonio.
- **Autoria por IA é declarada, nunca escondida.** O blog é 100% escrito por IA: você imagina como o Antonio escreveria o texto e cita as experiências reais dele nos repositórios públicos (código, PRs, commits, docs). O "eu" do texto é o Antonio, mas não finja autoria humana: não escreva "eu mesmo escrevi este texto", "sem ajuda de IA" ou equivalentes. O site já mostra o aviso de IA em todo post; não precisa repetir no corpo.
- **Nunca diga que o Antonio revisa, lê, aprova ou dá merge nos textos** (nem no post, nem nos roteiros, nem no aviso). A revisão é feita por um agente de IA.
- As experiências citadas precisam existir nos repositórios do Antonio, com link em `fontes`.
- Categorias: `noticias` (fato recente, com `fontes`), `artigos` (longo, contextualizado), `opinioes` (posição clara), `ideias` (exploratório).
- Frontmatter: `ia: true` e `autoria: ia` em todo post (o `npm run validar` confere).
- Roteiros de podcast e vídeo começam com o aviso de que foram **roteirizados por IA** (veja `derivados/README.md`).
- Não invente fatos, números ou citações. Sem fonte, não afirme.
- Imagens em `docs/public/imagens/<AAAA-MM-DD-slug>/` e referenciadas como `/imagens/<AAAA-MM-DD-slug>/arquivo.png`.
- **Imagens de commit:** quando o post conta a história de um repositório, ilustre os momentos-chave (2 a 4) com cartões gerados por `npm run imagem-commit` a partir de um clone local, nomeados pelo SHA curto (`4080052.png`). Coloque cada imagem logo depois do parágrafo que cita o commit, com texto alternativo que diga o commit, a data e o que mudou, e mantenha o link do commit em `fontes`. Use `--sem-corpo` em commits de squash cujo corpo é só uma lista de commits. O cartão mostra só o nome do autor, nunca e-mail.
- Roteiros de podcast e vídeo vão em `derivados/` (veja `derivados/README.md`), no mesmo PR ou em outro.
