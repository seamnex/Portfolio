// ─────────────────────────────────────────────────────────────
//  Verifica que los dos diccionarios de idioma sigan siendo espejo.
//
//  Es el chequeo que más falta hace en un sitio bilingüe: agregar una
//  clave en `content.js` y olvidarla en `content.en.js` no rompe el
//  build ni tira un error visible. Lo que hace es renderizar `undefined`
//  —o nada— en una sección del sitio en inglés, que es justamente la que
//  el autor no mira. Esto lo convierte en un rojo de CI.
//
//  Uso:  npm run verificar
// ─────────────────────────────────────────────────────────────
import * as es from '../src/data/content.js'
import * as en from '../src/data/content.en.js'
import { PLAYBOOKS } from '../src/data/playbooks.js'
import { ESCENARIOS } from '../src/lib/caos.js'

const errores = []
const avisos = []

const falla = (msg) => errores.push(msg)

// ── 1. Mismos exports ────────────────────────────────────────
{
  const clavesEs = Object.keys(es).sort()
  const clavesEn = Object.keys(en).sort()
  for (const k of clavesEs) if (!clavesEn.includes(k)) falla(`content.en.js no exporta "${k}"`)
  for (const k of clavesEn) if (!clavesEs.includes(k)) falla(`content.js no exporta "${k}"`)
}

// ── 2. Misma forma en los textos de interfaz ──────────────────
// Se comparan CAMINOS, no valores: que `ui.form.asunto` sea una función en
// español y un string en inglés es un bug tan real como que falte.
function caminos(objeto, prefijo = '') {
  const salida = []
  for (const [clave, valor] of Object.entries(objeto)) {
    const camino = prefijo ? `${prefijo}.${clave}` : clave
    if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
      salida.push(...caminos(valor, camino))
    } else {
      salida.push(`${camino}:${Array.isArray(valor) ? 'array' : typeof valor}`)
    }
  }
  return salida.sort()
}

{
  const uiEs = caminos(es.ui)
  const uiEn = caminos(en.ui)
  for (const c of uiEs) if (!uiEn.includes(c)) falla(`ui: falta o difiere en inglés → ${c}`)
  for (const c of uiEn) if (!uiEs.includes(c)) falla(`ui: falta o difiere en español → ${c}`)
}

// ── 3. Las secciones del nav tienen etiqueta en los dos idiomas ──
{
  // Mismo listado que usa Navbar.jsx, en sus dos niveles. Duplicarlo acá es a
  // propósito: si el nav suma una sección —o un rótulo de grupo— y nadie
  // traduce su etiqueta, esto lo caza.
  const RAIZ = ['sobre-mi', 'skills', 'trayectoria', 'observabilidad', 'contacto']
  const AGRUPADAS = ['telemetria', 'caos', 'playbooks', 'labs', 'consola']
  for (const id of [...RAIZ, ...AGRUPADAS]) {
    if (!es.ui.nav[id]) falla(`ui.nav["${id}"] sin etiqueta en español`)
    if (!en.ui.nav[id]) falla(`ui.nav["${id}"] sin etiqueta en inglés`)
  }
}

// ── 4. Los registros con id existen en los dos idiomas ────────
for (const coleccion of ['incidentes', 'projects', 'skills']) {
  const idsEs = es[coleccion].map((x) => x.id)
  const idsEn = en[coleccion].map((x) => x.id)
  if (idsEs.join('|') !== idsEn.join('|')) {
    falla(`${coleccion}: los ids no coinciden entre idiomas (${idsEs.join(', ')} ≠ ${idsEn.join(', ')})`)
  }
}

if (es.timeline.length !== en.timeline.length) {
  falla(`timeline: ${es.timeline.length} entradas en español y ${en.timeline.length} en inglés`)
}

// ── 5. Los post-mortems están completos ──────────────────────
// Un incidente al que le falta la causa raíz o las acciones correctivas no es
// un post-mortem: es una anécdota con formato de informe.
for (const idioma of [
  { nombre: 'es', datos: es },
  { nombre: 'en', datos: en },
]) {
  for (const inc of idioma.datos.incidentes) {
    for (const campo of ['codigo', 'titulo', 'resumen', 'severidad', 'impacto', 'leccion', 'repo']) {
      if (!inc[campo]) falla(`incidentes[${inc.id}].${campo} vacío en ${idioma.nombre}`)
    }
    for (const lista of ['timeline', 'causaRaiz', 'acciones', 'metricas']) {
      if (!inc[lista]?.length) falla(`incidentes[${inc.id}].${lista} vacío en ${idioma.nombre}`)
    }
  }
}

// ── 6. Runbooks y escenarios de caos, traducidos por id ──────
// El chequeo de caminos de arriba compara los dos idiomas entre sí, pero no
// contra el catálogo técnico: si `playbooks.js` suma un paso y nadie lo
// traduce en NINGUNO de los dos idiomas, los dos siguen siendo espejo y el
// paso sale en pantalla con el título vacío. Esto lo caza.
for (const idioma of [
  { nombre: 'es', datos: es },
  { nombre: 'en', datos: en },
]) {
  for (const pb of PLAYBOOKS) {
    const texto = idioma.datos.ui.playbooks.escenarios[pb.id]
    if (!texto) {
      falla(`ui.playbooks.escenarios["${pb.id}"] no existe en ${idioma.nombre}`)
      continue
    }
    for (const campo of ['titulo', 'descripcion', 'hipotesis']) {
      if (!texto[campo]) falla(`ui.playbooks.escenarios["${pb.id}"].${campo} vacío en ${idioma.nombre}`)
    }
    for (const paso of pb.pasos) {
      const tp = texto.pasos?.[paso.id]
      if (!tp?.titulo || !tp?.porQue) {
        falla(`ui.playbooks.escenarios["${pb.id}"].pasos["${paso.id}"] incompleto en ${idioma.nombre}`)
      }
    }
  }

  for (const e of ESCENARIOS) {
    if (!idioma.datos.ui.caos.escenarios[e.id]?.titulo) {
      falla(`ui.caos.escenarios["${e.id}"] sin título en ${idioma.nombre}`)
    }
  }
}

// ── 7. Ningún enlace muerto ──────────────────────────────────
// Un link en '#' renderiza un botón que no lleva a ningún lado, que es peor
// que no mostrarlo: el visitante hace clic y se queda donde estaba.
for (const idioma of [
  { nombre: 'es', datos: es },
  { nombre: 'en', datos: en },
]) {
  const urls = [
    ...idioma.datos.projects.flatMap((p) => Object.values(p.links)),
    ...idioma.datos.incidentes.map((i) => i.repo),
    ...idioma.datos.labMetrics.items.map((m) => m.repo),
    idioma.datos.profile.linkedin,
    idioma.datos.profile.github,
    idioma.datos.profile.cv,
  ].filter(Boolean)

  for (const url of urls) {
    if (url === '#') falla(`${idioma.nombre}: hay un enlace en '#' — usá null para ocultar el botón`)
  }
}

// ── 8. Aviso si los CV todavía no se generaron ───────────────
// NO es un error: los PDF son un derivado que produce `npm run build`, así
// que en un checkout limpio no existen todavía y este script corre antes del
// build a propósito. Que el archivo prometido por `profile.cv` termine en
// dist/ lo verifica el CI después de buildear, que es el momento en el que
// esa pregunta tiene respuesta.
{
  const { existsSync } = await import('node:fs')
  const { join, dirname } = await import('node:path')
  const { fileURLToPath } = await import('node:url')
  const publico = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

  const faltantes = [es, en]
    .map((datos) => datos.profile.cv)
    .filter((ruta) => !existsSync(join(publico, ruta)))

  if (faltantes.length) {
    avisos.push(`CV sin generar todavía (${faltantes.join(', ')}): los produce \`npm run build\` o \`npm run cv\`.`)
  }
}

// ── 9. Avisos: cosas que no rompen pero conviene mirar ───────
if (!process.env.VITE_FORMSPREE_ID) {
  avisos.push('VITE_FORMSPREE_ID sin definir: el formulario usa el respaldo por mailto.')
}

// ── Resultado ────────────────────────────────────────────────
for (const aviso of avisos) console.log(`  · ${aviso}`)

if (errores.length) {
  console.error(`\n✖ ${errores.length} problema(s) de contenido:\n`)
  for (const e of errores) console.error(`  - ${e}`)
  process.exit(1)
}

console.log('✔ contenido verificado: los dos idiomas son espejo y no hay enlaces muertos')
