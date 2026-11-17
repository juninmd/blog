import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { h } from 'vue'
import PostList from './components/PostList.vue'
import PostHeader from './components/PostHeader.vue'
import AvisoIA from './components/AvisoIA.vue'
import './tokens.css'
import './base.css'

export default {
  extends: DefaultTheme,
  // Cabeçalho do post (categoria, data, derivados, aviso de IA) entra antes do conteúdo.
  Layout: () => h(DefaultTheme.Layout, null, { 'doc-before': () => h(PostHeader) }),
  enhanceApp({ app }) {
    app.component('PostList', PostList)
    app.component('AvisoIA', AvisoIA)
  },
} satisfies Theme
