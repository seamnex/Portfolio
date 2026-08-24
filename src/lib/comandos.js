// ─────────────────────────────────────────────────────────────
//  Intérprete de la consola del sitio.
//
//  Es una función pura: recibe la entrada y un contexto, devuelve las
//  líneas a pintar y, si corresponde, una acción para que el componente
//  ejecute (limpiar, abrir un post-mortem, cambiar de idioma, bajar el CV).
//  Separarlo de la UI permite probar los comandos sin montar React y evita
//  que el componente se llene de `if` de negocio.
//
//  Honestidad de las salidas, que es lo que distingue esto de un GIF:
//   · `status` y `curl /health` usan los chequeos EN VIVO del panel.
//   · `metrics` y `curl /metrics` salen de `medidas.js`.
//   · `kubectl` reproduce corridas registradas en los labs y lo dice en la
//     propia salida, no solo en el aviso de la cabecera.
//   · `chaos` inyecta un simulacro y lo rotula como tal en cada línea que
//     imprime, incluida la de `status` mientras dura.
// ─────────────────────────────────────────────────────────────
import { MEDIDAS, num } from '../data/medidas.js'
import { ESCENARIOS, escenarioPorId } from './caos.js'

/** Comandos ofrecidos al autocompletado, en el orden en que se sugieren. */
export const COMANDOS = [
  'help',
  'status',
  'metrics',
  'incidents',
  'incident ',
  'labs',
  'kubectl get pods',
  'kubectl get nodes',
  'curl /health',
  'curl /metrics',
  'chaos',
  'chaos latencia',
  'chaos api-caida',
  'chaos error-500',
  'chaos heal',
  'whoami',
  'cv',
  'contact',
  'lang es',
  'lang en',
  'clear',
]

// Constructores de línea. El renderer solo entiende estas cuatro formas.
const texto = (t, tone) => ({ t: 'linea', texto: t, tone })
const titulo = (t) => ({ t: 'titulo', texto: t })
const kv = (k, v, tone) => ({ t: 'kv', k, v, tone })
const raw = (t, tone) => ({ t: 'raw', texto: t, tone })
const link = (t, href) => ({ t: 'link', texto: t, href })
const vacio = () => texto('')

/** Alinea la primera columna de una tabla de texto plano. */
const columna = (v, ancho) => String(v).padEnd(ancho)

// ── Chequeos en vivo → línea de consola ──────────────────────
function lineaServicio(servicio, resultado, ui) {
  const etiqueta =
    resultado.estado === 'ok'
      ? ui.estado.etiquetas.ok
      : resultado.estado === 'fallo'
        ? ui.estado.etiquetas.fallo
        : resultado.estado === 'corriendo'
          ? ui.ci.corriendo
          : resultado.estado === 'consultando'
            ? ui.estado.etiquetas.consultando
            : ui.estado.etiquetas.desconocido

  const tono =
    resultado.estado === 'ok'
      ? 'ok'
      : resultado.estado === 'fallo'
        ? 'crit'
        : resultado.estado === 'corriendo'
          ? 'warn'
          : 'muted'

  const detalle =
    resultado.tipo === 'origen'
      ? resultado.estado === 'ok'
        ? `${resultado.latencia} ms · HTTP ${resultado.codigo}`
        : ''
      : resultado.numero != null
        ? `#${resultado.numero}`
        : resultado.motivo === 'sin-pipeline'
          ? ui.estado.sinPipeline
          : resultado.motivo === 'limite'
            ? ui.estado.limiteApi
            : ''

  return kv(servicio.etiqueta, `${etiqueta}${detalle ? ` · ${detalle}` : ''}`, tono)
}

// ── Comandos ─────────────────────────────────────────────────

function cmdHelp(ui) {
  const ayuda = ui.consola.ayuda
  const ancho = Math.max(...ayuda.comandos.map(([c]) => c.length)) + 2
  return [
    titulo(ayuda.titulo),
    ...ayuda.comandos.map(([comando, desc]) => raw(`  ${columna(comando, ancho)}${desc}`)),
    vacio(),
    texto(ayuda.pista, 'muted'),
  ]
}

function cmdStatus(ctx) {
  const { ui, estado, caos } = ctx
  const escenario = caos?.escenario ?? null

  // Con un simulacro activo, el panel muestra rojo. Si `status` mostrara lo
  // mismo sin aclarar nada, la salida que alguien copia y pega diría que el
  // sitio se cayó. La aclaración va arriba de todo y en la línea afectada.
  const linea = (s) => {
    if (escenario && s.id === escenario.servicio) {
      return kv(s.etiqueta, `${ui.estado.etiquetas.fallo} · ${ui.caos.valorSimulado}`, 'warn')
    }
    return lineaServicio(s, estado.resultados[s.id] ?? { estado: 'consultando' }, ui)
  }

  return [
    titulo(ui.consola.status.titulo),
    ...(escenario ? [texto(ui.caos.consola.enCurso(escenario.id), 'warn')] : []),
    ...estado.servicios.map(linea),
    vacio(),
    texto(escenario ? ui.caos.avisoPanel : ui.estado.aviso, 'muted'),
  ]
}

function cmdMetrics(ctx) {
  const { ui, contenido } = ctx
  const salida = [titulo(ui.consola.metrics.titulo)]
  contenido.labMetrics.items.forEach((m) => {
    salida.push(kv(m.titulo, `${m.valor} ${m.unidad}`, m.tone))
    salida.push(raw(`    ${ui.consola.metrics.metodo}: ${m.metodo}`, 'muted'))
  })
  salida.push(vacio())
  salida.push(texto(contenido.labMetrics.nota.texto, 'muted'))
  return salida
}

function cmdIncidents(ctx) {
  const { ui, contenido } = ctx
  const ancho = Math.max(...contenido.incidentes.map((i) => i.id.length)) + 2
  return [
    titulo(ui.consola.incidents.titulo),
    ...contenido.incidentes.map((i) =>
      raw(`  ${columna(i.id, ancho)}${i.codigo}  [${i.severidad}]  ${i.titulo}`),
    ),
    vacio(),
    texto(ui.consola.incidents.pista, 'muted'),
  ]
}

function cmdIncident(ctx, argumento) {
  const { ui, contenido } = ctx
  if (!argumento) return { lineas: [texto(ui.consola.faltaArgumento('incident'), 'crit')] }

  const buscado = argumento.toLowerCase()
  const incidente = contenido.incidentes.find(
    (i) => i.id.toLowerCase() === buscado || i.codigo.toLowerCase() === buscado,
  )
  if (!incidente) return { lineas: [texto(ui.consola.incidents.noEncontrado(argumento), 'crit')] }

  return {
    lineas: [texto(ui.consola.incidents.abriendo(incidente.codigo), 'accent')],
    accion: { tipo: 'abrir-postmortem', id: incidente.id },
  }
}

function cmdLabs(ctx) {
  const { ui, contenido, estado } = ctx
  const salida = [titulo(ui.consola.labs.titulo)]
  contenido.projects.forEach((p) => {
    salida.push(kv(p.titulo, p.categoria, 'accent'))
    const pipeline = estado.pipelineDe(p.links.repo)
    if (pipeline && pipeline.estado !== 'desconocido') {
      const marca = pipeline.estado === 'ok' ? ui.ci.passing : pipeline.estado === 'fallo' ? ui.ci.failing : ui.ci.corriendo
      salida.push(raw(`    ci: ${marca}${pipeline.numero != null ? ` #${pipeline.numero}` : ''}`, pipeline.estado === 'ok' ? 'ok' : 'warn'))
    }
    if (p.links.repo) salida.push(link(`    ${p.links.repo}`, p.links.repo))
  })
  return salida
}

// Réplica de una corrida del k8s-lab: tres réplicas, una de ellas recién
// recreada por el auto-healing. La aclaración de que es una salida registrada
// va DENTRO del bloque a propósito — quien copie estas líneas a otro lado se
// lleva la aclaración pegada, no solo el aviso de la cabecera.
function cmdKubectlPods(ctx) {
  return [
    raw('NAME                          READY   STATUS    RESTARTS   AGE'),
    raw('web-6f8b7c9d4-2xk7p           1/1     Running   0          14m'),
    raw('web-6f8b7c9d4-9lm3q           1/1     Running   0          14m'),
    raw('web-6f8b7c9d4-tq8vn           1/1     Running   0          7s', 'ok'),
    vacio(),
    raw(ctx.ui.consola.kubectl.pods(num(MEDIDAS.autohealing, ctx.lang)), 'muted'),
  ]
}

function cmdKubectlNodes(ctx) {
  return [
    raw('NAME       STATUS   ROLES           AGE   VERSION'),
    raw(`lab-node   Ready    control-plane   —     ${MEDIDAS.kubernetes}`),
    vacio(),
    raw(ctx.ui.consola.kubectl.nodes, 'muted'),
  ]
}

/** Health check armado en el momento con los chequeos reales del panel. */
function cmdCurlHealth(ctx) {
  const { estado, caos } = ctx
  const escenario = caos?.escenario ?? null
  const agregado = escenario ? escenario.impacto : estado.agregado

  const cuerpo = {
    status:
      agregado === 'ok'
        ? 'operational'
        : agregado === 'degradado'
          ? 'degraded'
          : agregado === 'caido'
            ? 'outage'
            : 'partial',
    checked_at: estado.verificadoEn ? new Date(estado.verificadoEn).toISOString() : null,
    source: 'browser-side checks',
    // El flag va en el JSON y no solo en un comentario: si alguien pega esta
    // salida en un ticket, el simulacro viaja con ella.
    ...(escenario ? { chaos_drill: { scenario: escenario.id, simulated: true } } : {}),
    services: estado.servicios.map((s) => {
      const r = estado.resultados[s.id] ?? { estado: 'consultando' }
      const simulado = escenario?.servicio === s.id
      return {
        name: s.etiqueta,
        state: simulado ? 'fallo' : r.estado,
        ...(simulado ? { simulated: true } : {}),
        ...(r.latencia != null ? { latency_ms: r.latencia } : {}),
        ...(r.numero != null ? { run: r.numero } : {}),
        ...(r.motivo ? { reason: r.motivo } : {}),
      }
    }),
  }

  return [
    raw('HTTP/1.1 200 OK', 'ok'),
    raw('content-type: application/json', 'muted'),
    vacio(),
    ...JSON.stringify(cuerpo, null, 2).split('\n').map((l) => raw(l)),
  ]
}

/** Las mismas métricas medidas, en el formato que las leería un Prometheus. */
function cmdCurlMetrics() {
  const M = MEDIDAS
  const lineas = [
    '# HELP lab_autohealing_seconds Time back to 3/3 pods Ready after killing a pod.',
    '# TYPE lab_autohealing_seconds gauge',
    `lab_autohealing_seconds{lab="k8s-lab"} ${M.autohealing}`,
    '',
    '# HELP lab_rollout_failed_requests Requests dropped during the rolling update.',
    '# TYPE lab_rollout_failed_requests gauge',
    `lab_rollout_failed_requests{lab="k8s-lab",prestop="true"} ${M.rollingFallosConHook}`,
    `lab_rollout_failed_requests{lab="k8s-lab",prestop="false"} ${M.rollingFallosSinHook}`,
    '',
    '# HELP lab_mttd_seconds Time until the alert detects the 5xx spike.',
    '# TYPE lab_mttd_seconds gauge',
    `lab_mttd_seconds{lab="observability-lab",rule="default"} ${M.mttd}`,
    `lab_mttd_seconds{lab="observability-lab",rule="sensitive"} ${M.mttdSensible}`,
    '',
    '# HELP lab_mttr_seconds Full cycle: injection, alert, runbook, healthy service.',
    '# TYPE lab_mttr_seconds gauge',
    `lab_mttr_seconds{lab="observability-lab"} ${M.mttr}`,
    '',
    '# HELP lab_instrument_latency_seconds Latency contributed by the sliding window itself.',
    '# TYPE lab_instrument_latency_seconds gauge',
    `lab_instrument_latency_seconds{lab="observability-lab",run="1"} ${M.ventanaInstrumento[0]}`,
    `lab_instrument_latency_seconds{lab="observability-lab",run="2"} ${M.ventanaInstrumento[1]}`,
  ]
  return lineas.map((l) => raw(l, l.startsWith('#') ? 'muted' : undefined))
}

/**
 * Sandbox de chaos engineering desde la consola.
 *
 *   chaos              → lista los escenarios y el estado actual
 *   chaos <id>         → inyecta el fallo
 *   chaos heal|stop    → restaura sin esperar al auto-healing
 */
function cmdChaos(ctx, argumento) {
  const { ui, caos } = ctx
  const t = ui.caos
  const arg = (argumento ?? '').trim().toLowerCase()

  if (!arg) {
    const ancho = Math.max(...ESCENARIOS.map((e) => e.id.length)) + 2
    return {
      lineas: [
        titulo(t.consola.titulo),
        ...ESCENARIOS.map((e) =>
          raw(`  ${columna(e.id, ancho)}[${e.severidad}]  ${t.escenarios[e.id].titulo}`),
        ),
        vacio(),
        caos?.escenario
          ? texto(t.consola.enCurso(caos.escenario.id), 'warn')
          : texto(t.consola.sinEscenario, 'muted'),
        texto(t.consola.pista, 'muted'),
      ],
    }
  }

  if (arg === 'heal' || arg === 'stop' || arg === 'restore') {
    if (!caos?.escenario) return { lineas: [texto(t.consola.nadaQueRestaurar, 'muted')] }
    return {
      lineas: [texto(t.consola.restaurando(caos.escenario.id), 'ok')],
      accion: { tipo: 'restaurar-caos' },
    }
  }

  const escenario = escenarioPorId(arg)
  if (!escenario) return { lineas: [texto(t.consola.noExiste(arg), 'crit')] }

  return {
    lineas: [
      texto(t.consola.inyectando(escenario.id), 'warn'),
      raw(`  ${escenario.senal}`, 'muted'),
      texto(t.consola.seguiEnPanel, 'muted'),
    ],
    accion: { tipo: 'inyectar-caos', escenario: escenario.id },
  }
}

function cmdWhoami(ctx) {
  return ctx.ui.consola.whoami.map((l) => texto(l, l.startsWith('Samuel') ? 'accent' : undefined))
}

function cmdContact(ctx) {
  const { contenido } = ctx
  const salida = [
    kv('email', contenido.profile.email, 'accent'),
    kv('linkedin', contenido.profile.linkedin, 'accent'),
  ]
  if (contenido.profile.github) salida.push(kv('github', contenido.profile.github, 'accent'))
  salida.push(kv('location', contenido.profile.ubicacion, 'muted'))
  salida.push(vacio())
  salida.push(link(`mailto:${contenido.profile.email}`, `mailto:${contenido.profile.email}`))
  return salida
}

function cmdCv(ctx) {
  const { ui, contenido } = ctx
  return {
    lineas: [
      texto(ui.consola.cv.descargando, 'ok'),
      link(`${ui.consola.cv.enlace} → ${contenido.profile.cv}`, contenido.profile.cv),
    ],
    accion: { tipo: 'descargar-cv' },
  }
}

function cmdLang(ctx, argumento) {
  const { ui } = ctx
  const destino = (argumento ?? '').toLowerCase()
  if (destino !== 'es' && destino !== 'en') return { lineas: [texto(ui.consola.lang.invalido, 'crit')] }
  return {
    lineas: [texto(ui.consola.lang.cambiado(destino), 'ok')],
    accion: { tipo: 'cambiar-idioma', lang: destino },
  }
}

/**
 * Ejecuta una entrada de la consola.
 *
 * @returns {{ lineas: Array, accion?: object }}
 */
export function ejecutar(entrada, ctx) {
  const linea = entrada.trim()
  if (!linea) return { lineas: [] }

  const normalizado = linea.replace(/\s+/g, ' ').toLowerCase()
  const [comando, ...resto] = linea.split(/\s+/)
  const argumento = resto.join(' ')

  // Los comandos de dos palabras se comparan enteros: partirlos en verbo y
  // argumento haría que `kubectl get servicios` cayera en el caso de `pods`.
  switch (normalizado) {
    case 'help':
    case '?':
      return { lineas: cmdHelp(ctx.ui) }
    case 'clear':
      return { lineas: [], accion: { tipo: 'limpiar' } }
    case 'status':
      return { lineas: cmdStatus(ctx) }
    case 'metrics':
      return { lineas: cmdMetrics(ctx) }
    case 'incidents':
      return { lineas: cmdIncidents(ctx) }
    case 'labs':
      return { lineas: cmdLabs(ctx) }
    case 'whoami':
      return { lineas: cmdWhoami(ctx) }
    case 'contact':
      return { lineas: cmdContact(ctx) }
    case 'cv':
      return cmdCv(ctx)
    case 'kubectl get pods':
      return { lineas: cmdKubectlPods(ctx) }
    case 'kubectl get nodes':
      return { lineas: cmdKubectlNodes(ctx) }
    case 'curl /health':
    case 'curl /health.json':
      return { lineas: cmdCurlHealth(ctx) }
    case 'curl /metrics':
      return { lineas: cmdCurlMetrics() }
    default:
      break
  }

  if (comando.toLowerCase() === 'chaos') return cmdChaos(ctx, argumento)
  if (comando.toLowerCase() === 'incident') return cmdIncident(ctx, argumento)
  if (comando.toLowerCase() === 'lang') return cmdLang(ctx, argumento)

  return { lineas: [texto(ctx.ui.consola.desconocido(comando), 'crit')] }
}
