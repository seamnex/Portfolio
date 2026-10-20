// ─────────────────────────────────────────────────────────────
//  Genera los dos CV en PDF orientados a IT Incident Manager /
//  SRE / DevOps, uno por idioma:
//
//    public/cv-samuel-garcia-baciliadis-sre.pdf      (ES)
//    public/cv-samuel-garcia-baciliadis-sre-en.pdf   (EN)
//
//  Igual que la card de Open Graph: el contenido NO se escribe acá.
//  Sale de src/data/content.js y content.en.js, que son la única fuente
//  de verdad del sitio. Un CV escrito aparte es un CV que en tres meses
//  contradice a la web —métricas viejas, un rol que ya no figura— y esa
//  contradicción la nota justo quien no debería.
//
//  Diseño: una sola columna, sin tablas ni cajas de texto, tipografías
//  estándar del PDF. No es una limitación estética: los parsers de ATS
//  que usan los reclutadores leen el flujo de texto y se atragantan con
//  layouts a dos columnas. Un CV lindo que el ATS lee mal no llega a
//  ojos humanos.
//
//  Uso:  npm run cv
// ─────────────────────────────────────────────────────────────
import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import * as es from '../src/data/content.js'
import * as en from '../src/data/content.en.js'
import { periodoCon } from '../src/lib/periodo.js'
// El maquetado (página, colores, envoltura de texto, cursor) vive en
// src/lib/pdf.js y lo comparte con el post-mortem que se exporta desde el
// navegador: un solo motor para que los dos documentos se parezcan.
import { C, crearLienzo } from '../src/lib/pdf.js'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

const IDIOMAS = [
  { codigo: 'es', contenido: es, archivo: 'cv-samuel-garcia-baciliadis-sre.pdf' },
  { codigo: 'en', contenido: en, archivo: 'cv-samuel-garcia-baciliadis-sre-en.pdf' },
]

// ── Composición del documento ────────────────────────────────

function cabecera(lienzo, contenido) {
  const { profile, cv } = contenido

  lienzo.linea(profile.nombre, { fuente: 'bold', tamano: 20, color: C.tinta, alto: 24 })
  lienzo.linea(cv.titular, { tamano: 9.6, color: C.acento, alto: 15 })

  // Los datos de contacto en una sola línea de texto plano: un ATS los
  // encuentra igual que en tres líneas, y ocupa un tercio del espacio.
  // Sin teléfono ni documento: el CV se publica en la web, y esos datos en
  // una URL abierta no suman nada y exponen bastante.
  const contacto = [profile.email, profile.linkedin.replace('https://www.', ''), profile.github?.replace('https://', ''), profile.ubicacion]
    .filter(Boolean)
    .join('  ·  ')
  lienzo.parrafo(contacto, { tamano: 8.4, color: C.tenue, interlineado: 1.35 })
  lienzo.avanzar(2)
}

function perfil(lienzo, contenido) {
  lienzo.seccion(contenido.cv.secciones.perfil)
  lienzo.parrafo(contenido.cv.resumen, { tamano: 9.2, interlineado: 1.5 })
}

function competencias(lienzo, contenido) {
  lienzo.seccion(contenido.cv.secciones.competencias)
  for (const bloque of contenido.cv.competencias) {
    lienzo.etiquetado(bloque.grupo, bloque.items)
    lienzo.avanzar(3)
  }
}

function experiencia(lienzo, contenido) {
  const { cv, timeline } = contenido
  lienzo.seccion(cv.secciones.experiencia)

  for (const item of timeline.filter((t) => t.tipo === 'trabajo')) {
    // El período sale de la misma función que usa el sitio: si el CV
    // dijera una antigüedad y la web otra, el desacople lo descubre quien
    // tiene los dos abiertos, que es exactamente el reclutador.
    // El puesto actual va sin antigüedad: el PDF es un archivo que queda
    // guardado y adjunto en postulaciones, y un "2 años y 5 meses" impreso
    // ahí envejece al mes siguiente. "Mayo 2024 – Presente" no envejece.
    const periodo = item.hasta || item.soloAnio ? periodoCon(item, contenido.ui.duracion) : item.periodo
    lienzo.puesto(`${item.rol} — ${item.org}`, periodo)
    lienzo.parrafo(item.resumen, { tamano: 8.8, color: C.tenue, interlineado: 1.4 })
    lienzo.avanzar(3)
    for (const bullet of item.bullets) lienzo.vineta(bullet)
    lienzo.avanzar(6)
  }
}

function labs(lienzo, contenido) {
  const { cv, projects, labMetrics } = contenido
  lienzo.seccion(cv.secciones.labs)

  // Las tres métricas medidas van primero y en una línea cada una: son el
  // diferencial del perfil y lo primero que tiene que ver quien escanea.
  for (const m of labMetrics.items) {
    lienzo.vineta(`${m.valor} ${m.unidad} — ${m.titulo}: ${m.resumen} ${m.metodo}.`)
  }
  lienzo.avanzar(6)

  for (const p of projects) {
    lienzo.puesto(p.titulo, p.links.repo?.replace('https://github.com/', ''))
    lienzo.parrafo(`${cv.etiquetas.stack}: ${p.stack.join(' · ')}`, { tamano: 8.4, color: C.tenue })
    lienzo.avanzar(3)
    for (const h of p.highlights) lienzo.vineta(h, { tamano: 8.8 })
    lienzo.avanzar(6)
  }

  lienzo.parrafo(cv.nota, { tamano: 8.2, color: C.tenue, interlineado: 1.4 })
}

function formacion(lienzo, contenido) {
  lienzo.seccion(contenido.cv.secciones.formacion)
  for (const f of contenido.cv.formacion) {
    const detalle = [f.org, f.detalle].filter(Boolean).join(' · ')
    lienzo.vineta(detalle ? `${f.titulo} — ${detalle}` : f.titulo)
  }
}

function idiomas(lienzo, contenido) {
  lienzo.seccion(contenido.cv.secciones.idiomas)
  for (const i of contenido.cv.idiomas) lienzo.vineta(i)
}

// Inter incrustada (la misma tipografía del sitio) en vez de las 14 fuentes
// estándar del PDF: esas no viajan dentro del archivo y cada visor o parser
// de ATS las reemplaza por lo que tenga a mano. Incrustada y con subset, el
// CV se ve igual en todos lados y el texto se extrae con su mapa Unicode.
const requerir = createRequire(import.meta.url)
const INTER = {
  regular: requerir.resolve('@fontsource/inter/files/inter-latin-400-normal.woff'),
  bold: requerir.resolve('@fontsource/inter/files/inter-latin-700-normal.woff'),
}

async function generar({ codigo, contenido, archivo }) {
  const doc = await PDFDocument.create()
  doc.registerFontkit(fontkit)
  const fuentes = {
    regular: await doc.embedFont(await readFile(INTER.regular), { subset: true }),
    bold: await doc.embedFont(await readFile(INTER.bold), { subset: true }),
  }

  doc.setTitle(`${contenido.profile.nombre} — ${contenido.cv.titular}`)
  doc.setAuthor(contenido.profile.nombre)
  doc.setSubject(contenido.cv.titular)
  // Las mismas palabras que el reclutador busca en el ATS; algunos parsers
  // leen también este campo de los metadatos.
  doc.setKeywords([
    'IT Incident Manager',
    'Major Incident Management',
    'Incident Management',
    'Problem Management',
    'ITIL',
    'ITSM',
    'NOC',
    'SRE',
    'DevOps',
    'Observability',
    'Kubernetes',
  ])
  doc.setLanguage(codigo === 'es' ? 'es-AR' : 'en')
  // Creador y productor con el nombre del autor: es lo que muestra el panel
  // de propiedades del archivo, y una ruta de script ahí no le dice nada a
  // quien lo abre.
  doc.setProducer(contenido.profile.nombre)
  doc.setCreator(contenido.profile.nombre)

  const lienzo = crearLienzo(doc, fuentes)
  cabecera(lienzo, contenido)
  perfil(lienzo, contenido)
  competencias(lienzo, contenido)
  experiencia(lienzo, contenido)
  labs(lienzo, contenido)
  formacion(lienzo, contenido)
  idiomas(lienzo, contenido)

  const bytes = await doc.save()
  const destino = join(raiz, 'public', archivo)
  await writeFile(destino, bytes)
  console.log(`  ✔ ${archivo}  (${doc.getPageCount()} pág · ${(bytes.length / 1024).toFixed(0)} kB)`)
}

console.log('Generando el CV desde src/data/content.js…')
for (const idioma of IDIOMAS) await generar(idioma)
console.log('Listo.')
