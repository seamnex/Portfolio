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
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { writeFile } from 'node:fs/promises'
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
    lienzo.puesto(`${item.rol} — ${item.org}`, periodoCon(item, contenido.ui.duracion))
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

async function generar({ codigo, contenido, archivo }) {
  const doc = await PDFDocument.create()
  const fuentes = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  }

  doc.setTitle(`${contenido.profile.nombre} — ${contenido.cv.titular}`)
  doc.setAuthor(contenido.profile.nombre)
  doc.setSubject(contenido.cv.titular)
  doc.setKeywords(['SRE', 'DevOps', 'Incident Management', 'Kubernetes', 'Observability'])
  doc.setLanguage(codigo === 'es' ? 'es-AR' : 'en')
  doc.setProducer('scripts/generar-cv.mjs')
  doc.setCreator('scripts/generar-cv.mjs')

  const lienzo = crearLienzo(doc, fuentes)
  cabecera(lienzo, contenido)
  perfil(lienzo, contenido)
  competencias(lienzo, contenido)
  experiencia(lienzo, contenido)
  labs(lienzo, contenido)
  formacion(lienzo, contenido)

  const bytes = await doc.save()
  const destino = join(raiz, 'public', archivo)
  await writeFile(destino, bytes)
  console.log(`  ✔ ${archivo}  (${doc.getPageCount()} pág · ${(bytes.length / 1024).toFixed(0)} kB)`)
}

console.log('Generando el CV desde src/data/content.js…')
for (const idioma of IDIOMAS) await generar(idioma)
console.log('Listo.')
