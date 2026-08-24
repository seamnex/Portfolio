// ─────────────────────────────────────────────────────────────
//  Escenarios de chaos engineering — el sandbox de simulacros.
//
//  ACLARACIÓN QUE NO ES DECORATIVA: esto NO rompe nada real. El panel
//  de estado de al lado dice, con todas las letras, que nada de lo que
//  muestra está precargado ni simulado. Si un simulacro pintara ese
//  panel de rojo sin avisar, esa frase pasaría a ser mentira y el panel
//  entero dejaría de valer.
//
//  Por eso todo lo que sale de este módulo viaja marcado como simulacro
//  (`simulado: true`), la UI lo rotula como tal en el banner, y los
//  chequeos reales se siguen ejecutando por debajo: al terminar el
//  simulacro no se "restaura" un valor inventado, se vuelve a mostrar el
//  que ya estaba midiéndose.
//
//  Los tiempos imitan la forma de un incidente real —inyección, alerta,
//  diagnóstico, remediación, verificación— porque esa secuencia es lo
//  que el simulacro enseña. Los valores en segundos son de la simulación
//  y no se presentan como medidos en ningún lado.
// ─────────────────────────────────────────────────────────────

/** Cuánto tarda el auto-healing en cerrar el ciclo, en milisegundos. */
export const AUTOHEALING_MS = 10000

/**
 * Escenarios inyectables.
 *
 * Los campos son técnicos y NO se traducen: son la señal, el síntoma y
 * el remedio tal como los escribiría una regla de alerta o un runbook.
 * El texto humano vive en `ui.caos` de cada idioma y se arma con esto.
 *
 *   · servicio  → id del servicio del panel al que afecta el simulacro
 *   · impacto   → estado agregado que fuerza mientras dura
 *   · senal     → la expresión que dispararía la alerta
 *   · sintoma   → lo que vería el panel de estado durante el simulacro
 *   · remedio   → la acción de auto-healing que cierra el ciclo
 */
export const ESCENARIOS = [
  {
    id: 'latencia',
    icono: 'Timer',
    servicio: 'origen',
    impacto: 'degradado',
    severidad: 'P2',
    senal: 'p95_latency_ms{svc="origen"} > 3000 for 1m',
    sintoma: { latencia: 4180, codigo: 200 },
    remedio: 'drain edge PoP · reroute al más cercano',
  },
  {
    id: 'api-caida',
    icono: 'PlugZap',
    servicio: 'ci-portfolio',
    impacto: 'caido',
    severidad: 'P1',
    senal: 'up{job="github-actions-api"} == 0 for 30s',
    sintoma: { codigo: 0, motivo: 'red' },
    remedio: 'circuit breaker abierto · respuesta desde cache',
  },
  {
    id: 'error-500',
    icono: 'ServerCrash',
    servicio: 'origen',
    impacto: 'caido',
    severidad: 'P1',
    senal: 'rate(http_requests_total{code=~"5.."}[1m]) / rate(http_requests_total[1m]) > 0.05',
    sintoma: { codigo: 500, latencia: 91 },
    remedio: 'rollback al despliegue anterior · readiness probe en verde',
  },
]

export const IDS = ESCENARIOS.map((e) => e.id)

export function escenarioPorId(id) {
  return ESCENARIOS.find((e) => e.id === id) ?? null
}

/**
 * Fases del simulacro y en qué milisegundo entra cada una.
 *
 * La última cae exactamente en AUTOHEALING_MS: es la que devuelve el
 * sistema a operativo. Las intermedias existen porque un incidente que
 * pasa de rojo a verde sin nada en el medio no enseña nada; lo que se
 * quiere mostrar es que entre la detección y la recuperación hay
 * trabajo, y que ese trabajo se puede automatizar.
 */
export const FASES = [
  { id: 'inyeccion', en: 0, nivel: 'warn' },
  { id: 'deteccion', en: 1500, nivel: 'crit' },
  { id: 'diagnostico', en: 4000, nivel: 'muted' },
  { id: 'remediacion', en: 7500, nivel: 'accent' },
  { id: 'recuperado', en: AUTOHEALING_MS, nivel: 'ok' },
]

/**
 * Resultado que muestra el panel para el servicio afectado mientras dura
 * el simulacro. Va marcado con `simulado` para que la UI no pueda
 * confundirlo con un chequeo real ni por accidente.
 */
export function resultadoSimulado(escenario, real = {}) {
  if (!escenario) return real
  return {
    ...real,
    ...escenario.sintoma,
    estado: 'fallo',
    simulado: true,
  }
}

/** Estado agregado del panel durante un simulacro. */
export function agregadoSimulado(escenario, agregadoReal) {
  return escenario ? escenario.impacto : agregadoReal
}

/**
 * Línea de bitácora de una fase, lista para la consola.
 * El texto lo pone el idioma; acá solo se arma la estructura y el reloj.
 */
export function lineaDeFase(fase, escenario, ui, ahora = Date.now()) {
  const texto = ui.caos.fases[fase.id](escenario, ui)
  return {
    id: `${escenario.id}:${fase.id}:${ahora}`,
    ts: ahora,
    fase: fase.id,
    nivel: fase.nivel,
    escenario: escenario.id,
    texto,
  }
}

/** Reloj de la consola: hh:mm:ss, que es como se lee una bitácora. */
export function reloj(ts) {
  return new Date(ts).toTimeString().slice(0, 8)
}
