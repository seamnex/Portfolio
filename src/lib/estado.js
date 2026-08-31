// ─────────────────────────────────────────────────────────────
//  Chequeos de estado — todos reales, todos desde el navegador.
//
//  Un panel de status que muestra verde sin haber consultado nada es
//  peor que no tener panel: es exactamente la clase de tablero que en
//  un incidente real hace perder los primeros diez minutos. Así que acá
//  hay tres estados posibles y ninguno se inventa:
//
//    'ok'           → se consultó y respondió bien
//    'fallo'        → se consultó y respondió mal
//    'desconocido'  → no se pudo consultar (y se dice por qué)
//
//  El cuarto, 'consultando', solo existe mientras la promesa está en
//  vuelo. Nunca se degrada un 'desconocido' a verde por comodidad.
// ─────────────────────────────────────────────────────────────

import { normalizarCorrida } from './dora.js'

const TIMEOUT_MS = 8000

/** Cuánto vale una respuesta antes de volver a pedirla. */
export const TTL_MS = 5 * 60 * 1000

// La API pública de GitHub permite 60 consultas por hora y por IP. Con dos
// repos vigilados, un visitante que recarga varias veces la agota rápido y
// termina viendo "sin datos" por culpa nuestra. El cache de sesión hace que
// recargar la página no cueste una consulta nueva.
const CACHE = 'portfolio:estado'

function leerCache(clave) {
  try {
    const crudo = window.sessionStorage.getItem(`${CACHE}:${clave}`)
    if (!crudo) return null
    const { ts, dato } = JSON.parse(crudo)
    return Date.now() - ts < TTL_MS ? dato : null
  } catch {
    return null
  }
}

function guardarCache(clave, dato) {
  try {
    window.sessionStorage.setItem(`${CACHE}:${clave}`, JSON.stringify({ ts: Date.now(), dato }))
  } catch {
    // sessionStorage puede no existir. El chequeo igual funciona, solo que
    // sin cache: es una optimización, no un requisito.
  }
}

/** fetch con corte por tiempo: una promesa colgada deja el panel en "consultando" para siempre. */
async function fetchConTimeout(url, opciones = {}) {
  const control = new AbortController()
  const corte = setTimeout(() => control.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...opciones, signal: control.signal })
  } finally {
    clearTimeout(corte)
  }
}

/**
 * Petición real y cronometrada contra el origen que sirve esta página.
 * Mide exactamente lo que dice medir: ida y vuelta hasta el edge, sin
 * inventar percentiles ni promedios de una sola muestra.
 */
export async function chequearOrigen(recurso = '/favicon.svg') {
  const arranque = performance.now()
  try {
    const res = await fetchConTimeout(`${recurso}?t=${Date.now()}`, { cache: 'no-store' })
    const latencia = Math.round(performance.now() - arranque)
    return {
      estado: res.ok ? 'ok' : 'fallo',
      latencia,
      codigo: res.status,
      // En producción el origen es el edge de Vercel; en `npm run dev`, el
      // dev server. Decirlo evita que el número se lea como algo que no es.
      entorno: window.location.hostname === 'localhost' ? 'dev-server' : window.location.hostname,
    }
  } catch (error) {
    return {
      estado: 'desconocido',
      motivo: error?.name === 'AbortError' ? 'timeout' : 'red',
      entorno: window.location.hostname,
    }
  }
}

/**
 * Última corrida de GitHub Actions en `main` para un repo público.
 * Es el mismo dato que alimenta el badge del README, leído de la API en
 * vez de embebido como imagen: así se puede mostrar el número de corrida
 * y la fecha, y no depende de que el SVG de GitHub siga cacheado.
 */
export async function chequearActions(repo, { usarCache = true } = {}) {
  if (usarCache) {
    const guardado = leerCache(repo)
    if (guardado) return { ...guardado, deCache: true }
  }

  let res
  const arranque = performance.now()
  try {
    res = await fetchConTimeout(
      `https://api.github.com/repos/${repo}/actions/runs?branch=main&per_page=1`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
  } catch (error) {
    return { estado: 'desconocido', motivo: error?.name === 'AbortError' ? 'timeout' : 'red', repo }
  }
  // Ida y vuelta real hasta api.github.com, para el diagrama de topología.
  // Solo vale para ESTA respuesta: más abajo se saca antes de cachear, para
  // que una lectura de cache no muestre la latencia de hace cinco minutos
  // como si acabara de medirse.
  const latencia = Math.round(performance.now() - arranque)

  if (res.status === 403 || res.status === 429) {
    // El límite por IP se agota con un visitante insistente, no con un fallo
    // nuestro. Se distingue del error de red porque la salida es distinta:
    // "volvé en un rato" y no "algo está roto".
    return { estado: 'desconocido', motivo: 'limite', repo }
  }
  if (!res.ok) return { estado: 'desconocido', motivo: 'api', codigo: res.status, repo }

  let datos
  try {
    datos = await res.json()
  } catch {
    return { estado: 'desconocido', motivo: 'api', repo }
  }

  const corrida = datos?.workflow_runs?.[0]
  // Repo público sin workflows: no es un fallo, simplemente no hay pipeline.
  if (!corrida) return { estado: 'desconocido', motivo: 'sin-pipeline', repo }

  const resultado = {
    estado:
      corrida.status !== 'completed'
        ? 'corriendo'
        : corrida.conclusion === 'success'
          ? 'ok'
          : 'fallo',
    repo,
    workflow: corrida.name,
    numero: corrida.run_number,
    rama: corrida.head_branch,
    conclusion: corrida.conclusion,
    url: corrida.html_url,
    fecha: corrida.updated_at,
    latencia,
  }

  // Una corrida en curso cambia en minutos: cachearla dejaría el panel
  // mostrando "running" mucho después de que terminó.
  if (resultado.estado !== 'corriendo') {
    const { latencia: _medida, ...cacheable } = resultado
    guardarCache(repo, cacheable)
  }
  return resultado
}

/** Consulta todos los servicios en paralelo y devuelve un mapa por id. */
export async function chequearServicios(servicios, opciones = {}) {
  const resultados = await Promise.all(
    servicios.map(async (s) => {
      const dato =
        s.tipo === 'origen'
          ? await chequearOrigen(s.recurso)
          : await chequearActions(s.repo, opciones)
      return [s.id, { ...dato, id: s.id, etiqueta: s.etiqueta, tipo: s.tipo }]
    }),
  )
  return Object.fromEntries(resultados)
}

/**
 * Estado agregado del panel, del peor al mejor.
 *
 * Un 'desconocido' NO se cuenta como bueno: si no se pudo verificar algo,
 * el titular no puede decir "todos los sistemas operativos". Dice que la
 * verificación quedó incompleta, que es lo que efectivamente pasó.
 */
export function agregar(resultados) {
  const estados = Object.values(resultados).map((r) => r.estado)
  if (estados.length === 0) return 'cargando'
  if (estados.every((e) => e === 'consultando')) return 'cargando'

  const fallos = estados.filter((e) => e === 'fallo').length
  if (fallos > 0) return fallos === estados.length ? 'caido' : 'degradado'
  if (estados.some((e) => e === 'desconocido' || e === 'consultando')) return 'desconocido'
  return 'ok'
}

/**
 * Historial de corridas en `main` para calcular las métricas DORA.
 *
 * Es una consulta más contra la misma API pública que ya usa el panel, así
 * que va por el mismo cache de sesión: sin él, abrir el sitio dos veces
 * costaría el doble de las 60 consultas por hora que da GitHub por IP.
 *
 * Se piden 100 corridas de una y el recorte por ventana lo hace
 * `calcularDora`. Paginar para cubrir treinta días exactos gastaría varias
 * consultas por una precisión que el tablero no usa: si un repo tiene más
 * de 100 corridas en la ventana, la frecuencia de despliegue ya está muy
 * por encima de cualquier objetivo que valga la pena mirar.
 */
export async function historialActions(repo, { usarCache = true, porPagina = 100 } = {}) {
  const clave = `${repo}:historial`
  if (usarCache) {
    const guardado = leerCache(clave)
    if (guardado) return { ...guardado, deCache: true }
  }

  let res
  try {
    res = await fetchConTimeout(
      `https://api.github.com/repos/${repo}/actions/runs?branch=main&per_page=${porPagina}`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
  } catch (error) {
    return { estado: 'desconocido', motivo: error?.name === 'AbortError' ? 'timeout' : 'red', repo }
  }

  if (res.status === 403 || res.status === 429) return { estado: 'desconocido', motivo: 'limite', repo }
  if (!res.ok) return { estado: 'desconocido', motivo: 'api', codigo: res.status, repo }

  let datos
  try {
    datos = await res.json()
  } catch {
    return { estado: 'desconocido', motivo: 'api', repo }
  }

  const corridas = datos?.workflow_runs ?? []
  const resultado = { estado: 'ok', repo, corridas: corridas.map(normalizarCorrida) }
  guardarCache(clave, resultado)
  return resultado
}

/**
 * Una muestra de latencia contra el origen, sin el resto del chequeo.
 *
 * El p95 del tablero se arma con muchas de estas: una sola petición no es
 * un percentil, y presentarla como tal sería inventar precisión. Devuelve
 * `null` si la petición falló, para que una caída de red no entre en la
 * muestra como una latencia buena.
 */
export async function muestraLatencia(recurso = '/favicon.svg') {
  const arranque = performance.now()
  try {
    const res = await fetchConTimeout(`${recurso}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    return performance.now() - arranque
  } catch {
    return null
  }
}
