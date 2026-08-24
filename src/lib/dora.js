// ─────────────────────────────────────────────────────────────
//  Cálculo de las métricas DORA a partir de corridas reales.
//
//  Función pura sobre el historial de GitHub Actions: entra un array de
//  corridas normalizadas, sale el tablero. Que sea pura es lo que
//  permite ejercitarla en Node —incluida la ventana sin corridas, que en
//  un navegador hay que esperar treinta días para reproducir.
//
//  Tres definiciones, porque "DORA" se usa para cosas distintas y la
//  ambigüedad es donde se cuelan los números favorables:
//
//   · Deployment frequency → corridas EXITOSAS del pipeline de despliegue
//     en main dentro de la ventana. Cada push a main publica el sitio, así
//     que una corrida verde es un despliegue.
//   · Lead time for changes → mediana de (fin de la corrida − timestamp del
//     commit). Mediana y no promedio: con pocas muestras, una corrida rara
//     mueve el promedio y no describe a ninguna.
//   · Change failure rate → corridas fallidas sobre corridas completadas.
//     El denominador incluye las exitosas y las fallidas, no las canceladas
//     ni las que siguen corriendo: una corrida cancelada no dice nada sobre
//     la calidad del cambio.
//
//  Si no hay muestras, el resultado es `null` y el tablero muestra "sin
//  datos". No hay valor por defecto: un cero en change failure rate
//  cuando no se pudo consultar nada es exactamente el tipo de verde
//  inventado que este sitio no tiene en ninguna otra parte.
// ─────────────────────────────────────────────────────────────
import { VENTANA_DIAS } from '../data/dora.js'

const DIA_MS = 24 * 60 * 60 * 1000

/** Percentil por interpolación lineal sobre una muestra ya ordenada. */
export function percentil(valores, p) {
  if (!valores?.length) return null
  const orden = [...valores].sort((a, b) => a - b)
  if (orden.length === 1) return orden[0]

  const pos = (orden.length - 1) * p
  const bajo = Math.floor(pos)
  const alto = Math.ceil(pos)
  if (bajo === alto) return orden[bajo]
  return orden[bajo] + (orden[alto] - orden[bajo]) * (pos - bajo)
}

export function mediana(valores) {
  return percentil(valores, 0.5)
}

/**
 * Reparte las corridas en cubetas de un día, de la más vieja a la más
 * nueva. Es la serie que dibuja el sparkline: un dato por día, no una
 * curva suavizada que insinúe muestras que no existen.
 */
export function serieDiaria(corridas, { ahora = Date.now(), dias = VENTANA_DIAS } = {}) {
  const cubetas = new Array(dias).fill(0)
  for (const c of corridas) {
    const antiguedad = Math.floor((ahora - c.fin) / DIA_MS)
    if (antiguedad < 0 || antiguedad >= dias) continue
    cubetas[dias - 1 - antiguedad] += 1
  }
  return cubetas
}

/**
 * Normaliza una corrida de la API de GitHub a lo poco que necesitamos.
 * `head_commit.timestamp` puede faltar en corridas viejas o disparadas a
 * mano; sin él no hay lead time para esa corrida y se descarta del
 * cálculo en vez de rellenarse con la hora de inicio, que mediría el
 * pipeline y no el lead time.
 */
export function normalizarCorrida(run) {
  const fin = Date.parse(run.updated_at)
  const commit = run.head_commit?.timestamp ? Date.parse(run.head_commit.timestamp) : null
  return {
    numero: run.run_number,
    estado: run.status,
    conclusion: run.conclusion,
    fin: Number.isNaN(fin) ? null : fin,
    commit: commit && !Number.isNaN(commit) ? commit : null,
    url: run.html_url,
  }
}

/**
 * Tablero completo sobre la ventana pedida.
 *
 * @param {Array} corridas  corridas normalizadas, cualquier orden
 * @returns {{despliegues, leadTime, cfr, ventanaDias, total}}
 */
export function calcularDora(corridas, { ahora = Date.now(), dias = VENTANA_DIAS } = {}) {
  const desde = ahora - dias * DIA_MS
  const enVentana = (corridas ?? []).filter((c) => c.fin != null && c.fin >= desde && c.fin <= ahora)

  const completadas = enVentana.filter((c) => c.conclusion === 'success' || c.conclusion === 'failure')
  const exitosas = completadas.filter((c) => c.conclusion === 'success')
  const fallidas = completadas.filter((c) => c.conclusion === 'failure')

  // Lead time: solo las exitosas con timestamp de commit. Una corrida roja
  // no desplegó nada, así que su duración no es el lead time de un cambio.
  const leadTimes = exitosas.filter((c) => c.commit != null).map((c) => Math.max(0, (c.fin - c.commit) / 1000))

  return {
    ventanaDias: dias,
    total: enVentana.length,
    despliegues: {
      valor: exitosas.length,
      porDia: exitosas.length / dias,
      serie: serieDiaria(exitosas, { ahora, dias }),
      muestras: exitosas.length,
    },
    leadTime:
      leadTimes.length > 0
        ? {
            valor: mediana(leadTimes),
            p95: percentil(leadTimes, 0.95),
            serie: exitosas
              .filter((c) => c.commit != null)
              .sort((a, b) => a.fin - b.fin)
              .map((c) => (c.fin - c.commit) / 1000),
            muestras: leadTimes.length,
          }
        : null,
    cfr:
      completadas.length > 0
        ? {
            valor: (fallidas.length / completadas.length) * 100,
            fallidas: fallidas.length,
            muestras: completadas.length,
            // 1 por corrida fallida, 0 por exitosa, en orden cronológico:
            // el sparkline muestra dónde cayeron los rojos, no una tendencia.
            serie: completadas.sort((a, b) => a.fin - b.fin).map((c) => (c.conclusion === 'failure' ? 1 : 0)),
          }
        : null,
  }
}

/**
 * Escala DORA de frecuencia de despliegue, a partir de despliegues/día.
 * Devuelve la clave de traducción, no el texto.
 */
export function cadencia(porDia) {
  if (porDia == null) return null
  if (porDia >= 1) return 'diario'
  if (porDia >= 1 / 7) return 'semanal'
  if (porDia >= 1 / 30) return 'mensual'
  return 'esporadico'
}

/**
 * ¿El valor medido cumple el objetivo declarado?
 * Devuelve `null` cuando no hay medición: "no se sabe" no es "no cumple".
 */
export function cumple(valor, objetivo) {
  if (valor == null || !objetivo) return null
  return objetivo.comparar === 'menor' ? valor <= objetivo.valor : valor >= objetivo.valor
}

/** Segundos a la unidad que se lee mejor: 8.4 s, 3.2 min, 1.4 h. */
export function formatearDuracion(segundos, lang = 'es') {
  if (segundos == null) return null
  const coma = (n) => (lang === 'es' ? String(n).replace('.', ',') : String(n))

  if (segundos < 90) return { valor: coma(segundos.toFixed(1)), unidad: 's' }
  if (segundos < 5400) return { valor: coma((segundos / 60).toFixed(1)), unidad: 'min' }
  return { valor: coma((segundos / 3600).toFixed(1)), unidad: 'h' }
}
