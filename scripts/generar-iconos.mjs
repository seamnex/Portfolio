// Genera los íconos rasterizados a partir de `public/favicon.svg`, para
// que el ícono de la pestaña, el de la pantalla de inicio del teléfono y
// el `favicon.ico` de respaldo sean la misma marca: la barra del incidente.
//
// Es manual a propósito (`npm run iconos`), igual que la card OG: los PNG
// se versionan y solo cambian cuando cambia la marca.
import { readFileSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const PUBLICO = new URL('../public/', import.meta.url)
const svg = readFileSync(new URL('favicon.svg', PUBLICO), 'utf8')

// El contenido del SVG sin su envoltorio, para poder recomponerlo.
const interior = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
const FONDO = '#0B0F19'

/** Fondo a sangre (sin esquinas redondeadas) y la marca a `escala` del lienzo. */
function cuadrado(escala) {
  const margen = (64 * (1 - escala)) / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="${FONDO}"/>
  <g transform="translate(${margen} ${margen}) scale(${escala})">${interior.replace(/<rect width="64" height="64"[^>]*\/>/, '')}</g>
</svg>`
}

const png = (fuente, lado) => new Resvg(fuente, { fitTo: { mode: 'width', value: lado } }).render().asPng()

// iOS y Android recortan el ícono con su propia máscara: van a sangre.
// El "maskable" además deja la marca dentro de la zona segura (80 %).
const salidas = [
  ['apple-touch-icon.png', cuadrado(1), 180],
  ['icon-192.png', svg, 192],
  ['icon-512.png', svg, 512],
  ['icon-maskable-512.png', cuadrado(0.72), 512],
]
for (const [nombre, fuente, lado] of salidas) {
  writeFileSync(new URL(nombre, PUBLICO), png(fuente, lado))
  console.log(`✓ ${nombre} (${lado} px)`)
}

// favicon.ico: contenedor ICO con tres PNG adentro (16, 32, 48).
const capas = [16, 32, 48].map((lado) => ({ lado, datos: png(svg, lado) }))
const cabecera = Buffer.alloc(6)
cabecera.writeUInt16LE(0, 0) // reservado
cabecera.writeUInt16LE(1, 2) // tipo: ícono
cabecera.writeUInt16LE(capas.length, 4)

let desplazamiento = 6 + 16 * capas.length
const indice = capas.map(({ lado, datos }) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(lado, 0)
  e.writeUInt8(lado, 1)
  e.writeUInt16LE(1, 4) // planos
  e.writeUInt16LE(32, 6) // bits por píxel
  e.writeUInt32LE(datos.length, 8)
  e.writeUInt32LE(desplazamiento, 12)
  desplazamiento += datos.length
  return e
})
writeFileSync(new URL('favicon.ico', PUBLICO), Buffer.concat([cabecera, ...indice, ...capas.map((c) => c.datos)]))
console.log('✓ favicon.ico (16, 32, 48 px)')
