// ─────────────────────────────────────────────────────────────
//  Genera public/og-card.png (1200×630) — la vista previa que
//  muestran LinkedIn, WhatsApp, Slack y X al compartir el link.
//
//  Los textos y los números NO se escriben acá: se importan de
//  src/data/content.js, que es la única fuente de verdad del sitio.
//  Si mañana cambia una métrica en el sitio, se corre `npm run og`
//  y la card queda igual de actualizada — no hay dos versiones del
//  mismo dato conviviendo.
//
//  Uso:  npm run og
// ─────────────────────────────────────────────────────────────
import { Resvg } from '@resvg/resvg-js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { profile, hero, labMetrics } from '../src/data/content.js'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const SALIDA = join(raiz, 'public', 'og-card.png')

// Las fuentes del sitio no suelen estar instaladas en el sistema, así que las
// bajamos una vez a un cache ignorado por git. Se versiona el PNG, no 1 MB de
// binarios de tipografía.
const CACHE = join(raiz, 'scripts', '.fuentes')
const FUENTES = [
  { archivo: 'Inter-400.ttf', url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf' },
  { archivo: 'Inter-600.ttf', url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYMZg.ttf' },
  { archivo: 'Inter-800.ttf', url: 'https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZg.ttf' },
  { archivo: 'JetBrainsMono-500.ttf', url: 'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxjPQ.ttf' },
]

const C = {
  fondo: '#0B0F19',
  hondo: '#070A12',
  borde: '#1B2333',
  acento: '#06B6D4',
  acentoSoft: '#14B8A6',
  ok: '#10B981',
  crit: '#FB7185',
  texto: '#E2E8F0',
  medio: '#94A3B8',
  tenue: '#64748B',
}

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

async function asegurarFuentes() {
  await mkdir(CACHE, { recursive: true })
  const rutas = []
  for (const f of FUENTES) {
    const destino = join(CACHE, f.archivo)
    if (!existsSync(destino)) {
      process.stdout.write(`  bajando ${f.archivo}… `)
      const res = await fetch(f.url)
      if (!res.ok) throw new Error(`HTTP ${res.status} al bajar ${f.archivo}`)
      await writeFile(destino, Buffer.from(await res.arrayBuffer()))
      console.log('ok')
    }
    rutas.push(destino)
  }
  return rutas
}

// Las tres métricas de la card salen de labMetrics: son las mismas que el
// sitio publica con bitácora. Etiqueta corta hecha a mano porque el título
// completo no entra en un chip de 300 px.
const CHIPS = {
  autohealing: { etiqueta: 'AUTO-HEALING K8S', color: C.ok },
  rolling: { etiqueta: 'ROLLING UPDATE', color: C.acento },
  mttd: { etiqueta: 'MTTD MEDIDO', color: C.crit },
}

function construirSvg() {
  const [linea1, linea2] = hero.headline
  const chips = labMetrics.items
    .filter((i) => CHIPS[i.id])
    .slice(0, 3)
    .map((i) => ({ ...CHIPS[i.id], valor: i.valor, unidad: i.unidad }))

  // 3 chips + 2 gaps ocupan exactamente el ancho útil (1056 px), para que el
  // borde derecho del último quede a plomo con la línea divisoria de arriba.
  const chipGap = 24
  const chipAncho = (1056 - chipGap * 2) / 3
  const chipY = 432
  const chipsSvg = chips
    .map((c, idx) => {
      const x = 72 + idx * (chipAncho + chipGap)
      return `
    <g>
      <rect x="${x}" y="${chipY}" width="${chipAncho}" height="104" rx="14" fill="#111827" stroke="${C.borde}"/>
      <rect x="${x}" y="${chipY}" width="4" height="104" rx="2" fill="${c.color}"/>
      <text x="${x + 28}" y="${chipY + 56}" font-family="Inter" font-weight="800" font-size="40" fill="${C.texto}">${esc(c.valor)}<tspan font-family="JetBrains Mono" font-weight="500" font-size="22" fill="${c.color}" dx="8">${esc(c.unidad)}</tspan></text>
      <text x="${x + 28}" y="${chipY + 84}" font-family="JetBrains Mono" font-weight="500" font-size="14" letter-spacing="1.6" fill="${C.tenue}">${esc(c.etiqueta)}</text>
    </g>`
    })
    .join('')

  // Grilla tenue de fondo: la textura de status page, sin robar contraste al texto.
  let grilla = ''
  for (let x = 0; x <= 1200; x += 40) grilla += `<line x1="${x}" y1="0" x2="${x}" y2="630"/>`
  for (let y = 0; y <= 630; y += 40) grilla += `<line x1="0" y1="${y}" x2="1200" y2="${y}"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${C.fondo}"/>
      <stop offset="100%" stop-color="${C.hondo}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.12" r="0.62">
      <stop offset="0%" stop-color="${C.acento}" stop-opacity="0.22"/>
      <stop offset="60%" stop-color="${C.acentoSoft}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${C.acento}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="filo" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${C.acento}"/>
      <stop offset="55%" stop-color="${C.acentoSoft}"/>
      <stop offset="100%" stop-color="${C.acento}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#fondo)"/>
  <g stroke="${C.borde}" stroke-width="1" opacity="0.28">${grilla}</g>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="5" fill="url(#filo)"/>

  <!-- Identidad -->
  <circle cx="79" cy="82" r="6" fill="${C.ok}"/>
  <text x="98" y="88" font-family="JetBrains Mono" font-weight="500" font-size="17" letter-spacing="2.6" fill="${C.medio}">${esc(profile.alias.toUpperCase())} — ${esc(profile.ubicacion.split('·')[0].trim().toUpperCase())}</text>

  <!-- Headline: el mismo del hero del sitio -->
  <text x="72" y="215" font-family="Inter" font-weight="800" font-size="62" fill="${C.texto}">${esc(linea1)}</text>
  <text x="72" y="288" font-family="Inter" font-weight="800" font-size="62" fill="${C.acento}">${esc(linea2)}</text>

  <!-- Rol actual → objetivo -->
  <text x="72" y="348" font-family="Inter" font-weight="600" font-size="25" fill="${C.medio}">${esc(profile.rol)}  →  ${esc(profile.target)}</text>

  <line x1="72" y1="392" x2="1128" y2="392" stroke="${C.borde}" stroke-width="1"/>

  ${chipsSvg}

  <!-- Pie -->
  <text x="72" y="590" font-family="JetBrains Mono" font-weight="500" font-size="18" fill="${C.tenue}">portfolio-eight-ashen-34.vercel.app</text>
  <text x="1128" y="590" text-anchor="end" font-family="JetBrains Mono" font-weight="500" font-size="18" fill="${C.tenue}">números medidos, con bitácora publicada</text>
</svg>`
}

const fuentes = await asegurarFuentes()
const svg = construirSvg()
const png = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { fontFiles: fuentes, loadSystemFonts: false, defaultFontFamily: 'Inter' },
})
  .render()
  .asPng()

await writeFile(SALIDA, png)
console.log(`✔ public/og-card.png — 1200×630, ${(png.length / 1024).toFixed(1)} KB`)
