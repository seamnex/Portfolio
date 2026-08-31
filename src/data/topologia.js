// ─────────────────────────────────────────────────────────────
//  Topología del sistema que sirve esta página.
//
//  REGLA (la misma de servicios.js): acá solo entra lo que el navegador
//  del visitante puede comprobar. Cada nodo que no es el cliente apunta
//  a un servicio de `servicios.js`, y su salud sale del chequeo real de
//  ese servicio — no de un color puesto a mano en este archivo.
//
//  SOBRE LA FORMA DEL GRAFO: los dos enlaces salen del navegador, no uno
//  del otro. Es tentador dibujar la cadena cliente → edge → API porque
//  queda más prolija, pero este sitio es estático: no hay backend que
//  llame a GitHub. Las dos peticiones las hace el mismo navegador que
//  está leyendo esto, y dibujarlas en cadena sería inventar un salto de
//  red que no existe. Por eso el cliente es el origen de ambas aristas.
//
//  Los textos humanos viven en `ui.topologia` de cada idioma; acá queda
//  lo técnico, que no se traduce.
// ─────────────────────────────────────────────────────────────
import { REPO_DESPLIEGUE } from './dora.js'

/**
 * Nodos del diagrama, en orden de lectura.
 *
 *   · id        → clave de traducción en `ui.topologia.nodos`
 *   · icono     → nombre del ícono de lucide-react
 *   · servicio  → id en `servicios.js` del que sale la salud, o null
 *                 para el cliente, que es el propio navegador
 *   · fuente    → de dónde sale el dato, para el tooltip
 */
export const NODOS = [
  {
    id: 'cliente',
    icono: 'MonitorSmartphone',
    servicio: null,
    fuente: 'performance.now()',
  },
  {
    id: 'edge',
    icono: 'Cloud',
    servicio: 'origen',
    fuente: 'GET /favicon.svg',
  },
  {
    id: 'actions',
    icono: 'GitBranch',
    servicio: 'ci-portfolio',
    fuente: `api.github.com/repos/${REPO_DESPLIEGUE}`,
  },
]

/**
 * Aristas. `de` es siempre el cliente por lo que explica la cabecera.
 * `peticion` es la llamada literal que se cronometra, y va sin traducir
 * porque es lo que se vería en la pestaña de red del navegador.
 */
export const ENLACES = [
  { id: 'origen', de: 'cliente', a: 'edge', peticion: 'GET /favicon.svg' },
  { id: 'actions', de: 'cliente', a: 'actions', peticion: 'GET /actions/runs?branch=main' },
]

export function nodoPorId(id) {
  return NODOS.find((n) => n.id === id) ?? null
}

/**
 * ¿Este nodo es el que está pintando de rojo el simulacro?
 *
 * El escenario de caos declara a qué servicio afecta; el nodo declara
 * qué servicio representa. Comparar los dos es lo único que hace falta
 * para que el diagrama se degrade junto con el panel de estado, sin que
 * ninguno de los dos sepa nada del otro.
 */
export function nodoAfectado(nodo, escenario) {
  return Boolean(escenario && nodo.servicio && escenario.servicio === nodo.servicio)
}
