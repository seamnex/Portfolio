// ─────────────────────────────────────────────────────────────
//  Anotaciones del tablero DORA — lecturas derivadas, no números nuevos.
//
//  REGLA, la misma de todo el resto del sitio: acá NO se inventa nada ni
//  se hardcodea un "antes" favorable. Cada función recibe la serie que ya
//  se calculó sobre corridas reales y devuelve una lectura de esa serie,
//  o `null` cuando la serie no alcanza para sostenerla.
//
//  Es la diferencia entre "optimizamos de 15 min a 33 s" —una frase que
//  se escribe sola y no se puede comprobar— y "la mediana de la primera
//  mitad de la ventana fue 15,2 min y la de la segunda 33 s", que sale
//  del mismo array que dibuja el sparkline de al lado.
//
//  Cuando la mejora no está en los datos, la anotación no aparece. Un
//  tablero que siempre encuentra una buena noticia no está midiendo.
// ─────────────────────────────────────────────────────────────
import { mediana, percentil } from './dora.js'

/** Ventana corta para la lectura "¿cómo viene ahora?", en muestras. */
export const VENTANA_CORTA = 10

/**
 * Lectura de las últimas N corridas del change failure rate.
 *
 * La serie de CFR es 1 por corrida fallida y 0 por exitosa, en orden
 * cronológico. Sobre eso se responden dos preguntas distintas:
 *
 *   · ¿está limpia la ventana reciente?  → `limpia`
 *   · ¿hubo rojos ANTES de esa ventana?  → `recuperado`
 *
 * Las dos juntas son lo único que autoriza a hablar de recuperación: una
 * ventana limpia sobre un pipeline que nunca falló no demuestra que se
 * sepa recuperar, solo que todavía no se rompió.
 *
 * @param {number[]} serie   1 = corrida fallida, 0 = exitosa, cronológica
 * @param {number}   n       tamaño de la ventana reciente
 */
export function rachaCfr(serie, n = VENTANA_CORTA) {
  if (!serie?.length) return null

  const ventana = serie.slice(-n)
  const previas = serie.slice(0, -n)
  const fallidas = ventana.reduce((acc, v) => acc + (v ? 1 : 0), 0)
  const fallidasPrevias = previas.reduce((acc, v) => acc + (v ? 1 : 0), 0)

  return {
    ventana: ventana.length,
    fallidas,
    cfr: (fallidas / ventana.length) * 100,
    limpia: fallidas === 0,
    recuperado: fallidas === 0 && fallidasPrevias > 0,
  }
}

/**
 * Tendencia del lead time dentro de la misma ventana de análisis.
 *
 * Compara la mediana de la primera mitad de la serie contra la de la
 * segunda. Mediana y no mínimo/máximo a propósito: tomar el peor valor
 * de arriba y el mejor de abajo daría siempre una mejora espectacular y
 * siempre falsa.
 *
 * Devuelve `null` si hay pocas muestras o si la mejora no supera
 * `factorMinimo`: sin eso, el ruido normal de dos o tres corridas se
 * presentaría como una optimización.
 *
 * @param {number[]} serie  lead times en segundos, orden cronológico
 * @returns {{antes:number, ahora:number, factor:number, muestras:number}|null}
 */
export function tendenciaLeadTime(serie, { minimoMuestras = 4, factorMinimo = 1.3 } = {}) {
  if (!serie || serie.length < minimoMuestras) return null

  const corte = Math.floor(serie.length / 2)
  const antes = mediana(serie.slice(0, corte))
  const ahora = mediana(serie.slice(corte))
  if (antes == null || ahora == null || ahora <= 0) return null

  const factor = antes / ahora
  if (factor < factorMinimo) return null

  return { antes, ahora, factor, muestras: serie.length }
}

/**
 * Costo del arranque en frío contra la latencia ya estabilizada.
 *
 * La primera muestra de la sesión es la que paga la resolución DNS, el
 * handshake TLS y el miss de cache del edge. Compararla con la mediana
 * del resto es la única línea de "antes y después" que este navegador
 * puede medir por sí mismo, y por eso es la que se dibuja: cualquier
 * otro "pre-optimización" sería un número traído de afuera sin bitácora.
 *
 * @param {number[]} muestras  latencias en ms, orden de llegada
 */
export function arranqueLatencia(muestras, { minimoMuestras = 5, factorMinimo = 1.3 } = {}) {
  if (!muestras || muestras.length < minimoMuestras) return null

  const [primera, ...resto] = muestras
  const estable = percentil(resto, 0.5)
  if (estable == null || estable <= 0) return null

  const factor = primera / estable
  if (factor < factorMinimo) return null

  return { primera, estable, factor }
}
