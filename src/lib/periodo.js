// ─────────────────────────────────────────────────────────────
//  Antigüedad de un puesto, derivada de la fecha de inicio.
//
//  El motivo de que esto sea una función y no un string en content.js
//  es el mismo por el que las métricas viven como números en medidas.js:
//  "2 años y 4 meses" es verdad durante treinta días y después empieza a
//  mentir en silencio. Nadie revisa el CV cada mes para corregirlo, y el
//  dato desactualizado lo descubre el reclutador, no el autor.
//
//  Guardamos el único dato que no cambia —el mes de ingreso— y la
//  duración se calcula al renderizar, en el sitio y en el PDF.
// ─────────────────────────────────────────────────────────────

/** Meses completos transcurridos desde un 'YYYY-MM' hasta hoy. */
export function mesesDesde(desde, hasta = new Date()) {
  const [anio, mes] = String(desde).split('-').map(Number)
  if (!anio || !mes) return 0

  const fin = hasta instanceof Date ? hasta : new Date(hasta)
  const total = (fin.getUTCFullYear() - anio) * 12 + (fin.getUTCMonth() + 1 - mes)
  return Math.max(0, total)
}

/**
 * Duración legible: "2 años y 3 meses".
 * Los textos llegan por parámetro (`ui.duracion`) porque el sitio es
 * bilingüe y esta función no tiene por qué saber en qué idioma está.
 */
export function duracion(desde, textos, hasta) {
  const total = mesesDesde(desde, hasta)
  const anios = Math.floor(total / 12)
  const meses = total % 12

  const partes = []
  if (anios) partes.push(`${anios} ${anios === 1 ? textos.anio : textos.anios}`)
  if (meses) partes.push(`${meses} ${meses === 1 ? textos.mes : textos.meses}`)

  if (!partes.length) return `< 1 ${textos.mes}`
  return partes.join(` ${textos.union} `)
}

/** Primer día del mes de un 'YYYY-MM', en UTC. */
function mesComoFecha(ym) {
  const [anio, mes] = String(ym).split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, 1))
}

/**
 * Período de una entrada de trayectoria, con la duración pegada si la
 * entrada declara desde cuándo. Un tramo cerrado lleva además `hasta`
 * ('YYYY-MM') y la duración se calcula entre los dos; uno abierto se
 * calcula hasta hoy. Los tramos con `soloAnio` —agrupados, donde el mes
 * exacto no aporta— se muestran tal cual, sin la cuenta de meses.
 */
export function periodoCon(item, textos, hasta) {
  if (!item?.desde || item.soloAnio) return item?.periodo ?? ''
  const fin = item.hasta ? mesComoFecha(item.hasta) : hasta
  return `${item.periodo} · ${duracion(item.desde, textos, fin)}`
}
