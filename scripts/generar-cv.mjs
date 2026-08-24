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
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import * as es from '../src/data/content.js'
import * as en from '../src/data/content.en.js'
import { periodoCon } from '../src/lib/periodo.js'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

const IDIOMAS = [
  { codigo: 'es', contenido: es, archivo: 'cv-samuel-garcia-baciliadis-sre.pdf' },
  { codigo: 'en', contenido: en, archivo: 'cv-samuel-garcia-baciliadis-sre-en.pdf' },
]

// ── Página y ritmo vertical ──────────────────────────────────
const A4 = { ancho: 595.28, alto: 841.89 }
const MARGEN = 46
const ANCHO_UTIL = A4.ancho - MARGEN * 2

// Los colores son los del sitio, virados a fondo claro: el CV se imprime y
// se lee en un visor con fondo blanco, así que el cian del dark mode
// (#06B6D4) queda ilegible y baja a un teal oscuro con contraste real.
const C = {
  tinta: rgb(0.09, 0.11, 0.16),
  texto: rgb(0.25, 0.28, 0.35),
  tenue: rgb(0.45, 0.48, 0.55),
  acento: rgb(0.02, 0.45, 0.53),
  regla: rgb(0.85, 0.87, 0.9),
}

// Las fuentes estandar del PDF usan WinAnsi. Cubre todo el espanol y la
// tipografia habitual (guiones largos, comillas curvas, puntos medios),
// pero no las flechas ni los bloques de la terminal. Sin esta tabla,
// pdf-lib lanza al encontrar una flecha y el script muere a mitad de camino.
const REEMPLAZOS = [
  [/→/g, '->'],
  [/←/g, '<-'],
  [/[▊▉█]/g, ''],
]

// El tramo alto de WinAnsi que NO pertenece a Latin-1. Filtrar solo por
// Latin-1 seria mas corto y perderia en silencio cada guion largo del
// contenido, que en este sitio aparece en casi todas las bajadas.
const WINANSI_EXTRA = '–—‘’‚“”„†‡•…‰‹›€™ŒœŠšŸŽžƒˆ˜'
const FUERA_DE_WINANSI = new RegExp(`[^\\u0020-\\u00FF${WINANSI_EXTRA}]`, 'g')

function sanear(texto) {
  let salida = String(texto ?? '')
  for (const [patron, reemplazo] of REEMPLAZOS) salida = salida.replace(patron, reemplazo)
  // Lo que quede fuera del juego se descarta aca y no dentro de pdf-lib, con
  // aviso: es preferible un caracter perdido y un warning en consola que un
  // PDF que no se genera.
  return salida.replace(FUERA_DE_WINANSI, (c) => {
    console.warn(`  ! caracter fuera de WinAnsi descartado: ${JSON.stringify(c)}`)
    return ''
  })
}

/**
 * Parte un texto en líneas que entran en el ancho dado, midiendo con la
 * fuente real. `anchoPrimera` permite que la primera línea sea más corta,
 * que es lo que necesita un párrafo que arranca después de una etiqueta.
 */
function envolver(texto, fuente, tamano, ancho, anchoPrimera = ancho) {
  const palabras = sanear(texto).split(/\s+/).filter(Boolean)
  const lineas = []
  let actual = ''

  const disponible = () => (lineas.length === 0 ? anchoPrimera : ancho)

  for (const palabra of palabras) {
    const tentativa = actual ? `${actual} ${palabra}` : palabra
    if (fuente.widthOfTextAtSize(tentativa, tamano) <= disponible()) {
      actual = tentativa
    } else {
      if (actual) lineas.push(actual)
      actual = palabra
    }
  }
  if (actual) lineas.push(actual)
  return lineas
}

/**
 * Cursor de escritura sobre el documento: lleva la posición vertical y abre
 * página nueva cuando se acaba el espacio. Todo el layout pasa por acá, así
 * que ningún bloque puede quedar cortado por la mitad sin que se note.
 */
function crearLienzo(doc, fuentes) {
  let pagina = doc.addPage([A4.ancho, A4.alto])
  let y = A4.alto - MARGEN

  const nuevaPagina = () => {
    pagina = doc.addPage([A4.ancho, A4.alto])
    y = A4.alto - MARGEN
  }

  const espacio = (alto) => {
    if (y - alto < MARGEN) nuevaPagina()
  }

  return {
    get y() {
      return y
    },
    avanzar(alto) {
      y -= alto
    },
    espacio,
    /** Escribe una línea suelta y devuelve lo que consumió. */
    linea(texto, { fuente = 'regular', tamano = 9.2, color = C.texto, x = MARGEN, alto } = {}) {
      const salto = alto ?? tamano * 1.42
      espacio(salto)
      pagina.drawText(sanear(texto), { x, y: y - tamano, size: tamano, font: fuentes[fuente], color })
      y -= salto
      return salto
    },
    /** Escribe un párrafo envolviéndolo al ancho disponible. */
    parrafo(texto, { fuente = 'regular', tamano = 9.2, color = C.texto, x = MARGEN, ancho = ANCHO_UTIL, interlineado = 1.45 } = {}) {
      const lineas = envolver(texto, fuentes[fuente], tamano, ancho)
      const salto = tamano * interlineado
      for (const linea of lineas) {
        espacio(salto)
        pagina.drawText(linea, { x, y: y - tamano, size: tamano, font: fuentes[fuente], color })
        y -= salto
      }
    },
    /** Título de sección con su regla horizontal. */
    seccion(texto) {
      // 34 pt de reserva: el encabezado más la primera línea de lo que venga
      // abajo. Sin esto, un título puede quedar solo al pie de la página.
      espacio(34)
      y -= 12
      pagina.drawText(sanear(texto.toUpperCase()), {
        x: MARGEN,
        y: y - 8.4,
        size: 8.4,
        font: fuentes.bold,
        color: C.acento,
      })
      y -= 13
      pagina.drawLine({
        start: { x: MARGEN, y },
        end: { x: A4.ancho - MARGEN, y },
        thickness: 0.6,
        color: C.regla,
      })
      y -= 9
    },
    /** Encabezado de puesto: rol a la izquierda, período alineado a la derecha. */
    puesto(rol, periodo) {
      espacio(16)
      pagina.drawText(sanear(rol), { x: MARGEN, y: y - 9.8, size: 9.8, font: fuentes.bold, color: C.tinta })
      if (periodo) {
        const texto = sanear(periodo)
        const ancho = fuentes.regular.widthOfTextAtSize(texto, 8.4)
        pagina.drawText(texto, {
          x: A4.ancho - MARGEN - ancho,
          y: y - 9.6,
          size: 8.4,
          font: fuentes.regular,
          color: C.tenue,
        })
      }
      y -= 13.5
    },
    /**
     * Etiqueta en negrita y texto a continuación, en el mismo renglón. La
     * primera línea arranca después de la etiqueta y las siguientes vuelven
     * al margen: un grupo de competencias ocupa así una línea y no dos.
     */
    etiquetado(etiqueta, texto, { tamano = 9, interlineado = 1.45 } = {}) {
      const marca = `${sanear(etiqueta)}: `
      const anchoMarca = fuentes.bold.widthOfTextAtSize(marca, tamano)
      const lineas = envolver(texto, fuentes.regular, tamano, ANCHO_UTIL, ANCHO_UTIL - anchoMarca)
      const salto = tamano * interlineado

      lineas.forEach((linea, i) => {
        espacio(salto)
        if (i === 0) {
          pagina.drawText(marca, { x: MARGEN, y: y - tamano, size: tamano, font: fuentes.bold, color: C.tinta })
        }
        pagina.drawText(linea, {
          x: i === 0 ? MARGEN + anchoMarca : MARGEN,
          y: y - tamano,
          size: tamano,
          font: fuentes.regular,
          color: C.texto,
        })
        y -= salto
      })
    },
    /** Viñeta con sangría francesa: la segunda línea alinea con el texto, no con el punto. */
    vineta(texto, { tamano = 9 } = {}) {
      const sangria = 10
      const lineas = envolver(texto, fuentes.regular, tamano, ANCHO_UTIL - sangria)
      lineas.forEach((linea, i) => {
        const salto = tamano * 1.42
        espacio(salto)
        if (i === 0) {
          pagina.drawText('-', { x: MARGEN, y: y - tamano, size: tamano, font: fuentes.regular, color: C.tenue })
        }
        pagina.drawText(linea, {
          x: MARGEN + sangria,
          y: y - tamano,
          size: tamano,
          font: fuentes.regular,
          color: C.texto,
        })
        y -= salto
      })
    },
  }
}

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
