// ─────────────────────────────────────────────────────────────
//  Exporta un post-mortem a PDF, en el navegador.
//
//  El documento sale del mismo objeto `incidente` que dibuja el modal,
//  en el idioma activo, así que lo que se descarga es exactamente lo
//  que se estaba leyendo: cabecera del incidente, métricas, resumen,
//  cronología, causa raíz, impacto, acciones correctivas y lección.
//
//  Este módulo se carga con `import()` desde el modal, no arriba: pdf-lib
//  pesa más que todo el resto del sitio junto y solo lo paga quien pide
//  el PDF. El maquetado es el de `lib/pdf.js`, compartido con el CV.
//
//  Igual que en pantalla, el PDF dice con todas las letras que la falla
//  fue inyectada en un laboratorio. Un informe que circula suelto —en un
//  mail, en una entrevista— pierde el contexto de la sección que lo
//  rodeaba, y esa aclaración es la que no puede perderse.
// ─────────────────────────────────────────────────────────────
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { A4, ANCHO_UTIL, C, MARGEN, crearLienzo, sanear } from './pdf.js'

const COLOR_SEVERIDAD = { P1: C.crit, P2: C.warn, P3: C.ok, P4: C.acento }
// Lo que tiene que quedar libre al pie para abrir una sección: el título
// y unas tres líneas de texto. Menos que eso y el título queda huérfano.
const RESERVA = 80

const COLOR_TONO = { crit: C.crit, warn: C.warn, ok: C.ok, accent: C.acento, muted: C.tenue }

/** Nombre de archivo: el código del incidente y el idioma, sin sorpresas. */
export function nombreArchivo(incidente, lang) {
  return `${incidente.codigo.toLowerCase()}-postmortem-${lang}.pdf`
}

/**
 * Construye el PDF y devuelve los bytes. `textos` es `ui.postmortem` del
 * idioma activo; los rótulos propios del documento van en `textos.pdf`.
 */
export async function construirPostMortem({ incidente, textos, autor, lang, ahora = new Date() }) {
  const doc = await PDFDocument.create()
  const fuentes = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
  }
  const t = textos
  const p = t.pdf

  doc.setTitle(`${incidente.codigo} — ${incidente.titulo}`)
  doc.setAuthor(autor)
  doc.setSubject(p.asunto)
  doc.setKeywords(['post-mortem', 'RCA', 'SRE', incidente.lab, incidente.severidad])
  doc.setLanguage(lang === 'es' ? 'es-AR' : 'en')
  doc.setProducer('portfolio · src/lib/postmortemPdf.js')
  doc.setCreator('portfolio · src/lib/postmortemPdf.js')

  // Pie en cada página: el aviso de laboratorio, el autor y el número.
  // Va en el pie y no solo en la portada porque una página suelta de un
  // informe impreso también tiene que decir de dónde salió.
  const pie = (pagina, numero) => {
    const y = MARGEN - 18
    pagina.drawLine({
      start: { x: MARGEN, y: y + 10 },
      end: { x: A4.ancho - MARGEN, y: y + 10 },
      thickness: 0.5,
      color: C.regla,
    })
    pagina.drawText(sanear(`${p.avisoLab} · ${autor}`), {
      x: MARGEN,
      y,
      size: 7.2,
      font: fuentes.regular,
      color: C.tenue,
    })
    const num = sanear(p.pagina(numero))
    pagina.drawText(num, {
      x: A4.ancho - MARGEN - fuentes.regular.widthOfTextAtSize(num, 7.2),
      y,
      size: 7.2,
      font: fuentes.regular,
      color: C.tenue,
    })
  }

  const lienzo = crearLienzo(doc, fuentes, { pie })

  // ── Cabecera del incidente ─────────────────────────────────
  const sobre = sanear(`${p.titulo}  ·  ${incidente.codigo}  ·  ${incidente.lab}`)
  lienzo.linea(sobre.toUpperCase(), { fuente: 'bold', tamano: 8.4, color: C.acento, alto: 14 })

  // Chip de severidad: un rectángulo con el color de la severidad y el
  // texto en blanco encima. Es la única "caja" del documento: la
  // severidad es lo primero que busca quien abre un post-mortem.
  const sev = sanear(incidente.severidad)
  const anchoSev = fuentes.bold.widthOfTextAtSize(sev, 8) + 10
  lienzo.espacio(16)
  lienzo.pagina.drawRectangle({
    x: MARGEN,
    y: lienzo.y - 13,
    width: anchoSev,
    height: 13,
    color: COLOR_SEVERIDAD[incidente.severidad] ?? C.acento,
  })
  lienzo.pagina.drawText(sev, {
    x: MARGEN + 5,
    y: lienzo.y - 10,
    size: 8,
    font: fuentes.bold,
    color: rgb(1, 1, 1),
  })
  lienzo.pagina.drawText(sanear(`${t.estado}: ${incidente.estado}`), {
    x: MARGEN + anchoSev + 8,
    y: lienzo.y - 10,
    size: 8,
    font: fuentes.regular,
    color: C.tenue,
  })
  lienzo.avanzar(20)

  lienzo.parrafo(incidente.titulo, { fuente: 'bold', tamano: 17, color: C.tinta, interlineado: 1.2 })
  lienzo.avanzar(6)

  // Metadatos como texto plano, etiqueta y valor en el mismo renglón.
  const metadatos = [
    [t.servicio, incidente.servicio],
    [t.fecha, incidente.fecha],
    [t.duracion, incidente.duracion],
    [t.deteccion, incidente.deteccion],
    [t.impactoUsuario, incidente.impactoUsuario],
  ]
  for (const [etiqueta, valor] of metadatos) {
    lienzo.etiquetado(etiqueta, valor, { tamano: 8.8, interlineado: 1.4, colorEtiqueta: C.tenue })
  }
  lienzo.avanzar(4)

  // ── Métricas del evento ────────────────────────────────────
  // Tres columnas: el valor grande y la etiqueta abajo. Se dibujan a mano
  // porque el lienzo es de una columna, pero se mantienen en el flujo de
  // texto (valor y etiqueta van como texto, no como imagen).
  lienzo.seccion(t.metricas, { reserva: RESERVA })
  const columnas = Math.max(1, incidente.metricas.length)
  const anchoCol = ANCHO_UTIL / columnas
  lienzo.espacio(34)
  incidente.metricas.forEach((m, i) => {
    const x = MARGEN + anchoCol * i
    lienzo.pagina.drawText(sanear(m.v), {
      x,
      y: lienzo.y - 15,
      size: 15,
      font: fuentes.bold,
      color: COLOR_TONO[m.tone] ?? C.tinta,
    })
    lienzo.pagina.drawText(sanear(m.k).toUpperCase(), {
      x,
      y: lienzo.y - 27,
      size: 7.2,
      font: fuentes.regular,
      color: C.tenue,
    })
  })
  lienzo.avanzar(34)

  // ── Resumen ────────────────────────────────────────────────
  lienzo.seccion(t.resumenEjecutivo, { reserva: RESERVA })
  lienzo.parrafo(incidente.resumen, { tamano: 9.4, interlineado: 1.5 })

  // ── Cronología ─────────────────────────────────────────────
  lienzo.seccion(t.timeline, { reserva: RESERVA })
  for (const paso of incidente.timeline) {
    lienzo.espacio(14)
    lienzo.pagina.drawText(sanear(paso.t), {
      x: MARGEN,
      y: lienzo.y - 9,
      size: 8.6,
      font: fuentes.bold,
      color: COLOR_TONO[paso.tone] ?? C.tinta,
    })
    lienzo.avanzar(12)
    lienzo.parrafo(paso.texto, { tamano: 9, interlineado: 1.45, x: MARGEN + 12, ancho: ANCHO_UTIL - 12 })
    lienzo.avanzar(4)
  }

  // ── Causa raíz ─────────────────────────────────────────────
  lienzo.seccion(t.causaRaiz, { reserva: RESERVA })
  incidente.causaRaiz.forEach((linea, i) => {
    lienzo.vineta(linea, { marca: `${i + 1}.`, colorMarca: C.tenue })
    lienzo.avanzar(3)
  })

  // ── Impacto ────────────────────────────────────────────────
  lienzo.seccion(t.impacto, { reserva: RESERVA })
  lienzo.parrafo(incidente.impacto, { tamano: 9.2, interlineado: 1.5 })

  // ── Acciones correctivas ───────────────────────────────────
  lienzo.seccion(t.acciones, { reserva: RESERVA })
  for (const a of incidente.acciones) {
    const pendiente = /^(pendiente|pending)$/i.test(a.estado)
    lienzo.vineta(a.texto, {
      marca: `[${sanear(a.estado).toUpperCase()}]`,
      colorMarca: pendiente ? C.warn : C.ok,
      fuenteMarca: 'bold',
    })
    lienzo.avanzar(3)
  }

  // ── Lección ────────────────────────────────────────────────
  lienzo.seccion(t.leccion, { reserva: RESERVA })
  lienzo.parrafo(incidente.leccion, { tamano: 9.4, interlineado: 1.5, color: C.tinta })

  // ── Fuente y fecha de exportación ─────────────────────────
  lienzo.avanzar(10)
  lienzo.parrafo(`${t.verBitacora}: ${incidente.repo}`, { tamano: 8, color: C.tenue, interlineado: 1.4 })
  lienzo.parrafo(p.generado(ahora.toLocaleString(lang === 'es' ? 'es-AR' : 'en-GB')), {
    tamano: 8,
    color: C.tenue,
    interlineado: 1.4,
  })

  return doc.save()
}

/**
 * Dispara la descarga en el navegador. Separado de `construirPostMortem`
 * para que el armado del documento se pueda probar en Node sin DOM.
 */
export function descargar(bytes, nombre) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  // El objeto se libera después, no en el mismo tick: algunos navegadores
  // todavía no abrieron la descarga cuando vuelve el click.
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
