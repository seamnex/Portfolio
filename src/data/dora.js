// ─────────────────────────────────────────────────────────────
//  Configuración del tablero DORA.
//
//  Acá viven dos cosas que conviene no mezclar nunca:
//
//   · lo MEDIDO  → no está en este archivo. Sale de la API pública de
//                  GitHub Actions (frecuencia de despliegue, lead time,
//                  change failure rate) y de medidas.js (MTTD). Se
//                  calcula al vuelo en `src/lib/dora.js`.
//   · el OBJETIVO → sí está acá. Es una meta declarada, no un resultado.
//                  Por eso se muestra rotulado como objetivo y al lado
//                  del valor real, nunca en su lugar.
//
//  La distinción no es formal. Un tablero que muestra el objetivo con
//  tipografía de resultado es la forma más común de mentir con métricas
//  DORA sin escribir un solo número falso.
// ─────────────────────────────────────────────────────────────
import { MEDIDAS } from './medidas.js'
import { OWNER } from './servicios.js'

/** Repo del que se leen los despliegues. Es el que publica este sitio. */
export const REPO_DESPLIEGUE = `${OWNER}/Portfolio`

/** Ventana de análisis, en días. DORA se mide sobre un período, no sobre el último evento. */
export const VENTANA_DIAS = 30

/**
 * Metas declaradas. `comparar` dice de qué lado del objetivo está el
 * cumplimiento: 'menor' es "cuanto más bajo, mejor".
 */
export const OBJETIVOS = {
  despliegues: {
    // Equivalente a "Daily" en la escala DORA: al menos un despliegue por día.
    valor: 30,
    unidad: 'despl. / 30 d',
    etiqueta: 'diario',
    comparar: 'mayor',
  },
  leadTime: {
    // < 15 min desde el commit hasta que el pipeline termina en verde.
    valor: 900,
    unidad: 's',
    etiqueta: '< 15 min',
    comparar: 'menor',
  },
  cfr: {
    valor: 1,
    unidad: '%',
    etiqueta: '< 1 %',
    comparar: 'menor',
  },
  mttd: {
    // No es un número inventado: es el MTTD que la misma regla del
    // observability-lab alcanza exigiendo una sola evaluación sobre el
    // umbral. Está medido y publicado, y por eso sirve como meta.
    valor: MEDIDAS.mttdSensible,
    unidad: 's',
    etiqueta: `< ${MEDIDAS.mttdSensible} s`,
    comparar: 'menor',
  },
}

/** Cada cuánto se toma una muestra de latencia mientras el panel está a la vista. */
export const MUESTREO_MS = 4000

/** Cuántas muestras entran en la ventana deslizante del p95. */
export const MUESTRAS_MAX = 40
