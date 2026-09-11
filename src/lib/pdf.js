// ─────────────────────────────────────────────────────────────
//  Motor de maquetado sobre pdf-lib, compartido entre el CV que genera
//  `scripts/generar-cv.mjs` en cada build y el post-mortem que el
//  visitante exporta desde el navegador.
//
//  Es el mismo módulo a propósito: un informe y un CV salidos del mismo
//  sitio tienen que parecer del mismo sitio, y una sola implementación
//  de "partir texto en líneas" es una sola que puede fallar. No importa
//  nada de Node, así que Vite lo empaqueta tal cual.
//
//  Diseño: una sola columna, sin tablas ni cajas de texto, tipografías
//  estándar del PDF. No es una limitación estética: los parsers de ATS
//  que usan los reclutadores leen el flujo de texto y se atragantan con
//  layouts a dos columnas. Un CV lindo que el ATS lee mal no llega a
//  ojos humanos, y un post-mortem que se puede copiar y pegar limpio
//  vale más que uno con cajas.
// ─────────────────────────────────────────────────────────────
import { rgb } from 'pdf-lib'

// ── Página y ritmo vertical ──────────────────────────────────
export const A4 = { ancho: 595.28, alto: 841.89 }
export const MARGEN = 46
export const ANCHO_UTIL = A4.ancho - MARGEN * 2

// Los colores son los del sitio, virados a fondo claro: el PDF se imprime
// y se lee en un visor con fondo blanco, así que el cian del dark mode
// (#06B6D4) queda ilegible y baja a un teal oscuro con contraste real.
export const C = {
  tinta: rgb(0.09, 0.11, 0.16),
  texto: rgb(0.25, 0.28, 0.35),
  tenue: rgb(0.45, 0.48, 0.55),
  acento: rgb(0.02, 0.45, 0.53),
  regla: rgb(0.85, 0.87, 0.9),
  // Los tonos de severidad del sitio, también oscurecidos para papel.
  crit: rgb(0.75, 0.16, 0.25),
  warn: rgb(0.72, 0.45, 0.02),
  ok: rgb(0.03, 0.5, 0.36),
}

// Las fuentes estandar del PDF usan WinAnsi. Cubre todo el espanol y la
// tipografia habitual (guiones largos, comillas curvas, puntos medios),
// pero no las flechas ni los bloques de la terminal. Sin esta tabla,
// pdf-lib lanza al encontrar una flecha y el documento muere a mitad de
// camino.
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

export function sanear(texto) {
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
export function envolver(texto, fuente, tamano, ancho, anchoPrimera = ancho) {
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
 *
 * `fuentes` es `{ regular, bold }` ya embebidas en `doc`; `pie`, si se da,
 * es una función que recibe cada página nueva para escribirle el pie.
 */
export function crearLienzo(doc, fuentes, { pie } = {}) {
  let pagina = null
  let y = 0

  const nuevaPagina = () => {
    pagina = doc.addPage([A4.ancho, A4.alto])
    y = A4.alto - MARGEN
    pie?.(pagina, doc.getPageCount())
  }
  nuevaPagina()

  const espacio = (alto) => {
    if (y - alto < MARGEN) nuevaPagina()
  }

  return {
    get y() {
      return y
    },
    get pagina() {
      return pagina
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
    /**
     * Título de sección con su regla horizontal. `reserva` es cuánto tiene
     * que quedar libre debajo para no abrirla: 34 pt es el encabezado más
     * la primera línea de lo que venga, y sin eso un título puede quedar
     * solo al pie de la página. Un informe con párrafos pide más.
     */
    seccion(texto, { reserva = 34 } = {}) {
      espacio(reserva)
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
    etiquetado(etiqueta, texto, { tamano = 9, interlineado = 1.45, colorEtiqueta = C.tinta } = {}) {
      const marca = `${sanear(etiqueta)}: `
      const anchoMarca = fuentes.bold.widthOfTextAtSize(marca, tamano)
      const lineas = envolver(texto, fuentes.regular, tamano, ANCHO_UTIL, ANCHO_UTIL - anchoMarca)
      const salto = tamano * interlineado

      lineas.forEach((linea, i) => {
        espacio(salto)
        if (i === 0) {
          pagina.drawText(marca, { x: MARGEN, y: y - tamano, size: tamano, font: fuentes.bold, color: colorEtiqueta })
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
    vineta(texto, { tamano = 9, marca = '-', colorMarca = C.tenue, fuenteMarca = 'regular' } = {}) {
      const sangria = Math.max(10, fuentes[fuenteMarca].widthOfTextAtSize(sanear(marca), tamano) + 5)
      const lineas = envolver(texto, fuentes.regular, tamano, ANCHO_UTIL - sangria)
      lineas.forEach((linea, i) => {
        const salto = tamano * 1.42
        espacio(salto)
        if (i === 0) {
          pagina.drawText(sanear(marca), { x: MARGEN, y: y - tamano, size: tamano, font: fuentes[fuenteMarca], color: colorMarca })
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
