// ─────────────────────────────────────────────────────────────
//  SLO y error budget — aritmética, no estimación.
//
//  Todo lo que sale de este módulo es una cuenta cerrada sobre datos
//  declarados: el objetivo lo elige el visitante, el período está
//  definido acá abajo, y el presupuesto de caída es la multiplicación de
//  los dos. No hay nada que medir ni nada que inventar.
//
//  La parte que SÍ es una medición es el consumo: los segundos que
//  duraron los simulacros de caos que el visitante corrió en esta
//  sesión. Son segundos de reloj reales sobre un incidente simulado, y
//  esa distinción va escrita en la propia interfaz — un error budget
//  gastado por un simulacro no es un error budget gastado por una caída.
//
//  REGLA DE CONTEO, declarada porque es la única decisión discutible:
//  un simulacro cuenta ENTERO, dure lo que dure y sea caída o
//  degradación. Lo correcto en un SLO de verdad sería ponderar la
//  degradación por la fracción de peticiones que efectivamente falló —
//  pero acá esa fracción no se midió, y elegir un número para ella
//  sería inventar el dato más importante de la cuenta.
// ─────────────────────────────────────────────────────────────

const MINUTO = 60
const HORA = 60 * MINUTO
const DIA = 24 * HORA

/**
 * Períodos sobre los que se declara un SLO, en segundos.
 *
 * El mes son 30 días y el año 365: es la convención con la que se
 * publican las tablas de disponibilidad, y decirlo evita la discusión de
 * por qué esta tabla no coincide al segundo con otra que usa 30,44.
 */
export const PERIODOS = [
  { id: 'dia', segundos: DIA },
  { id: 'semana', segundos: 7 * DIA },
  { id: 'mes', segundos: 30 * DIA },
  { id: 'anio', segundos: 365 * DIA },
]

/** Objetivos ofrecidos por el selector, del más laxo al más exigente. */
export const OBJETIVOS_SLO = [99, 99.9, 99.95, 99.99]

/** El período que abre el panel de presupuesto. */
export const PERIODO_POR_DEFECTO = 'mes'

export function periodoPorId(id) {
  return PERIODOS.find((p) => p.id === id) ?? null
}

/**
 * Caída máxima permitida por un objetivo en un período, en segundos.
 * Es toda la cuenta: (1 − objetivo) × período.
 */
export function presupuesto(objetivo, segundosPeriodo) {
  if (objetivo == null || segundosPeriodo == null) return null
  return segundosPeriodo * (1 - objetivo / 100)
}

/**
 * Consumo de los simulacros corridos en esta sesión.
 *
 * Los que siguen en curso se cuentan hasta `ahora`, así el panel avanza
 * mientras el simulacro corre en vez de saltar al final de golpe.
 *
 * @param {Array} simulacros  `{ escenario, impacto, inicio, fin }`
 * @returns {{segundos, caido, degradado, cantidad, enCurso}}
 */
export function consumoDeSimulacros(simulacros, ahora = Date.now()) {
  let caido = 0
  let degradado = 0
  let enCurso = 0

  for (const s of simulacros ?? []) {
    const fin = s.fin ?? ahora
    const segundos = Math.max(0, (fin - s.inicio) / 1000)
    if (s.fin == null) enCurso += 1
    if (s.impacto === 'caido') caido += segundos
    else degradado += segundos
  }

  return {
    segundos: caido + degradado,
    caido,
    degradado,
    cantidad: (simulacros ?? []).length,
    enCurso,
  }
}

/**
 * Estado del presupuesto: cuánto queda y de qué lado del objetivo está.
 *
 * `restante` puede ser negativo a propósito: un budget pasado de rosca
 * es exactamente lo que hay que ver, y recortarlo a cero escondería el
 * único caso en el que este panel tiene algo urgente que decir.
 */
export function estadoPresupuesto(consumidoSegundos, presupuestoSegundos) {
  if (presupuestoSegundos == null || presupuestoSegundos <= 0) return null

  const consumido = Math.max(0, consumidoSegundos ?? 0)
  const porcentaje = (consumido / presupuestoSegundos) * 100

  return {
    consumido,
    presupuesto: presupuestoSegundos,
    restante: presupuestoSegundos - consumido,
    porcentaje,
    // Los cortes son los de una política de error budget al uso: por
    // debajo del 50 % se sigue desplegando, por encima del 100 % se
    // congela. Están acá y no en la UI porque son parte de la regla.
    nivel: porcentaje >= 100 ? 'agotado' : porcentaje >= 75 ? 'critico' : porcentaje >= 50 ? 'atencion' : 'sano',
  }
}

/**
 * Duración legible: "36 s", "4 min 23 s", "8 h 45 min", "3 d 2 h".
 *
 * Dos unidades como máximo. "43200 segundos" es correcto y no le dice
 * nada a nadie; "12 h" es la misma cifra en la unidad en la que se
 * conversa sobre una caída.
 */
export function formatearCaida(segundos, lang = 'es') {
  if (segundos == null || !Number.isFinite(segundos)) return null

  // d / h / min / s se escriben igual en los dos idiomas; lo único que
  // cambia es el separador decimal del caso por debajo del segundo.
  const signo = segundos < 0 ? '-' : ''
  const total = Math.abs(segundos)

  if (total < 1) {
    const dec = total.toFixed(1)
    return `${signo}${lang === 'es' ? dec.replace('.', ',') : dec} s`
  }
  if (total < MINUTO) return `${signo}${Math.round(total)} s`

  if (total < HORA) {
    const min = Math.floor(total / MINUTO)
    const seg = Math.round(total % MINUTO)
    return seg ? `${signo}${min} min ${seg} s` : `${signo}${min} min`
  }

  if (total < DIA) {
    const hs = Math.floor(total / HORA)
    const min = Math.round((total % HORA) / MINUTO)
    return min ? `${signo}${hs} h ${min} min` : `${signo}${hs} h`
  }

  const dias = Math.floor(total / DIA)
  const hs = Math.round((total % DIA) / HORA)
  return hs ? `${signo}${dias} d ${hs} h` : `${signo}${dias} d`
}

/** El objetivo como se escribe: 99.9 → "99,9 %" en español. */
export function formatearObjetivo(objetivo, lang = 'es') {
  const texto = String(objetivo)
  return `${lang === 'es' ? texto.replace('.', ',') : texto} %`
}
