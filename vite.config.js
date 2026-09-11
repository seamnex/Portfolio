import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { bloqueJsonLd } from './scripts/seo.mjs'

// Inyecta el JSON-LD (schema.org Person + WebSite) en el <head> del
// index.html, en dev y en build. Vive en un plugin y no escrito en el
// HTML porque el contenido sale de src/data/content.js: cambiar el rol o
// una herramienta ahí lo cambia acá sin que nadie tenga que acordarse.
// Ver scripts/seo.mjs.
function datosEstructurados() {
  return {
    name: 'portfolio:json-ld',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: bloqueJsonLd(),
          injectTo: 'head',
        },
      ]
    },
  }
}

export default defineConfig({
  plugins: [react(), datosEstructurados()],
})
