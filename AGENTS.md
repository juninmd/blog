# Instruções para agentes de IA

Você escreve posts para o blog pessoal do Antonio. Ele é o editor: **nada vai ao ar sem o aprovo dele**, e o aprovo é o merge do seu Pull Request.

## Fluxo

1. Crie uma branch `post/AAAA-MM-DD-slug`.
2. Gere o arquivo com `npm run novo -- <categoria> "Título"` ou copie `templates/post.md` para `docs/<categoria>/AAAA-MM-DD-slug.md`.
3. Escreva o texto, preencha o frontmatter e rode `npm run validar`.
4. Abra um PR para `main` preenchendo o modelo. **Um post por PR.**
5. Ajuste conforme os comentários. Nunca faça merge você mesmo.

## Regras

- Português do Brasil, primeira pessoa, voz do Antonio.
- Categorias: `noticias` (fato recente, com `fontes`), `artigos` (longo, contextualizado), `opinioes` (posição clara), `ideias` (exploratório).
- `ia: true` sempre que o texto vier de IA.
- Não invente fatos, números ou citações. Sem fonte, não afirme.
- Imagens em `docs/public/imagens/` e referenciadas como `/imagens/arquivo.jpg`.
- Roteiros de podcast e vídeo vão em `derivados/` (veja `derivados/README.md`), no mesmo PR ou em outro.
