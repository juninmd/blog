# Instruções para agentes de IA

Você escreve posts para o blog pessoal do Antonio. O blog é **100% IA, inclusive na revisão**: quem revisa e aprova seu Pull Request é outro agente de IA de revisão de PRs, não o Antonio. O merge é a publicação.

## Comandos

```bash
npm run dev        # servidor do VitePress (docs/)
npm run build      # build estático do site
npm run validar    # confere frontmatter e regras dos posts (scripts/validar-posts.mjs)
npm run novo -- <categoria> "Título"   # cria um post a partir de templates/post.md
```

## Estrutura

- `docs/`: site VitePress. Posts em `docs/artigos/`, `docs/opinioes/`, `docs/noticias/`, `docs/ideias/`. Configuração em `docs/.vitepress/`.
- `docs/public/imagens/`: imagens dos posts (pasta ainda não criada).
- `derivados/`: roteiros de podcast e vídeo (veja `derivados/README.md`).
- `templates/post.md`: modelo de post. `scripts/`: validação e criação de posts.

## Fluxo

1. Crie uma branch `post/AAAA-MM-DD-slug`.
2. Gere o arquivo com `npm run novo -- <categoria> "Título"` ou copie `templates/post.md` para `docs/<categoria>/AAAA-MM-DD-slug.md`.
3. Escreva o texto, preencha o frontmatter e rode `npm run validar`.
4. Abra um PR para `main` preenchendo o modelo. **Um post por PR.**
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
- Imagens em `docs/public/imagens/` e referenciadas como `/imagens/arquivo.jpg`.
- Roteiros de podcast e vídeo vão em `derivados/` (veja `derivados/README.md`), no mesmo PR ou em outro.
