// ─────────────────────────────────────────────────────────────
//  Valores medidos en los labs — fuente única, sin formato.
//
//  REGLA (la misma de labMetrics): acá va SOLO lo que salió de una
//  corrida con bitácora publicada. Si un número no se puede rastrear
//  hasta un experimento real, no entra.
//
//  Viven acá como NÚMEROS, no como strings, por dos motivos:
//
//   1. El sitio es bilingüe y el separador decimal cambia: 7,2 en
//      español, 7.2 en inglés. Con el dato crudo hay una sola verdad
//      y dos formatos; con strings habría dos verdades que se
//      desincronizan en cuanto una corrida nueva mueva el valor.
//   2. La consola, las métricas, los post-mortems y la card de Open
//      Graph consumen los mismos números. Una copia por consumidor es
//      una copia que queda vieja sin avisar.
// ─────────────────────────────────────────────────────────────

export const MEDIDAS = {
  // ── observability-lab ──────────────────────────────────────
  /** Detección del pico de 5xx con la regla de umbral por defecto. */
  mttd: 25.6,
  /** Misma regla exigiendo una sola evaluación sobre el umbral. */
  mttdSensible: 11.5,
  /** Ciclo completo: inyección → alerta → runbook → servicio sano. */
  mttr: 75.1,
  /** Latencia de la propia ventana deslizante, medida dos veces. */
  ventanaInstrumento: [45.1, 45.2],
  /** Parámetros de la regla que produjo el MTTD de arriba. */
  ventanaSegundos: 60,
  umbralPorcentaje: 5,

  // ── k8s-lab · auto-healing ─────────────────────────────────
  /** Vuelta a 3/3 pods Ready tras matar un pod en caliente. */
  autohealing: 7.2,
  autohealingOk: 66,
  autohealingTotal: 66,
  sondaReqPorSegundo: 5,
  kubernetes: 'v1.36.1',
  replicas: 3,

  // ── k8s-lab · rolling update ───────────────────────────────
  /** A/B en el mismo cluster y la misma sesión, alternando solo el hook. */
  rollingFallosConHook: 0,
  rollingTotalConHook: 317,
  rollingFallosSinHook: 8,
  rollingTotalSinHook: 425,
  rollingPorcentajeSinHook: 1.88,
  preStopSegundos: 10,
  /** Lo que cuesta el fix: el rollout tarda ~1 s más. */
  rolloutCostoSegundos: 1,
}

/**
 * Formatea un número medido según el idioma activo.
 * Español usa coma decimal; inglés, punto. No redondea: si el valor
 * se midió con un decimal, se muestra con un decimal.
 */
export function num(valor, lang = 'es') {
  const texto = String(valor)
  return lang === 'es' ? texto.replace('.', ',') : texto
}
