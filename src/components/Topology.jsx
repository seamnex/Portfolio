import { Fragment, useState } from 'react'
import { Cloud, FlaskConical, GitBranch, MonitorSmartphone, Waypoints } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useEstado } from '../estado/EstadoProvider'
import { useCaos } from '../caos/CaosProvider'
import { useTelemetria } from '../telemetria/TelemetriaProvider'
import { ENLACES, NODOS, nodoAfectado } from '../data/topologia.js'
import { resultadoSimulado } from '../lib/caos.js'
import { num } from '../data/medidas.js'

// ─────────────────────────────────────────────────────────────
//  Diagrama de topología en vivo.
//
//  No dibuja una arquitectura de referencia: dibuja las tres piezas que
//  el navegador del visitante puede comprobar, con el resultado del
//  mismo chequeo que alimenta el panel de estado de arriba. Si un nodo
//  no tiene dato, se muestra sin dato — igual que en todo el resto.
//
//  El simulacro de caos entra por el mismo camino que en el panel de
//  estado: se superpone `resultadoSimulado()` sobre el chequeo real, sin
//  reemplazarlo. Así el nodo se pinta de rojo y el chequeo verdadero
//  sigue corriendo por debajo, listo para volver a verse al terminar.
// ─────────────────────────────────────────────────────────────

const iconos = { MonitorSmartphone, Cloud, GitBranch }

// Clases completas: Tailwind purga por coincidencia textual y una clase
// armada con plantilla no sobrevive al build.
const TONO = {
  ok: {
    borde: 'border-ok/40',
    fondo: 'bg-ok/[0.05]',
    icono: 'border-ok/30 bg-ok/10 text-ok',
    punto: 'bg-ok',
    texto: 'text-ok',
    valor: 'text-ok',
    linea: 'border-ok/40',
    paquete: 'bg-ok',
  },
  fallo: {
    borde: 'border-crit/50',
    fondo: 'bg-crit/[0.07]',
    icono: 'border-crit/30 bg-crit/10 text-crit',
    punto: 'bg-crit',
    texto: 'text-crit',
    valor: 'text-crit',
    linea: 'border-crit/50',
    paquete: 'bg-crit',
  },
  corriendo: {
    borde: 'border-warn/40',
    fondo: 'bg-warn/[0.05]',
    icono: 'border-warn/30 bg-warn/10 text-warn',
    punto: 'bg-warn',
    texto: 'text-warn',
    valor: 'text-warn',
    linea: 'border-warn/40',
    paquete: 'bg-warn',
  },
  desconocido: {
    borde: 'border-base-600',
    fondo: 'bg-base-700/30',
    icono: 'border-base-600 bg-base-800 text-slate-500',
    punto: 'bg-slate-500',
    texto: 'text-slate-400',
    valor: 'text-slate-400',
    linea: 'border-base-500',
    paquete: 'bg-slate-500',
  },
  consultando: {
    borde: 'border-base-600',
    fondo: 'bg-base-700/30',
    icono: 'border-base-600 bg-base-800 text-slate-600',
    punto: 'bg-slate-600',
    texto: 'text-slate-500',
    valor: 'text-slate-500',
    linea: 'border-base-600',
    paquete: 'bg-slate-600',
  },
}

const tonoDe = (estado) => TONO[estado] ?? TONO.desconocido

/**
 * El número grande de cada nodo. Siempre una medición, nunca un valor
 * por defecto: si no se midió, sale el guion de "sin dato".
 */
function metricaDe(nodo, resultado, latencia, t, lang) {
  if (nodo.id === 'cliente') {
    return latencia.p95 != null
      ? { valor: num(latencia.p95.toFixed(1), lang), unidad: t.unidades.p95 }
      : { valor: t.sinDato, unidad: null }
  }
  return resultado.latencia != null
    ? { valor: num(String(resultado.latencia), lang), unidad: t.unidades.ms }
    : { valor: t.sinDato, unidad: null }
}

/** Las filas del tooltip: qué se midió y de dónde salió. */
function camposDe(nodo, resultado, latencia, t, lang) {
  const filas = []

  if (nodo.id === 'cliente') {
    filas.push({
      etiqueta: t.campos.p50,
      valor: latencia.p50 != null ? `${num(latencia.p50.toFixed(1), lang)} ms` : t.sinDato,
    })
    filas.push({ etiqueta: t.campos.muestras, valor: String(latencia.n) })
  } else if (nodo.servicio === 'origen') {
    filas.push({ etiqueta: t.campos.codigo, valor: resultado.codigo != null ? `HTTP ${resultado.codigo}` : t.sinDato })
    filas.push({ etiqueta: t.campos.entorno, valor: resultado.entorno ?? t.sinDato })
  } else {
    filas.push({ etiqueta: t.campos.corrida, valor: resultado.numero != null ? `#${resultado.numero}` : t.sinDato })
    filas.push({ etiqueta: t.campos.rama, valor: resultado.rama ?? t.sinDato })
    if (resultado.deCache) filas.push({ etiqueta: t.campos.latencia, valor: t.desdeCache })
  }

  filas.push({ etiqueta: t.campos.fuente, valor: nodo.fuente })
  return filas
}

function Nodo({ nodo, resultado, latencia, simulado, abierto, onAbrir, onCerrar, t, ui, lang }) {
  const Icono = iconos[nodo.icono]
  const texto = t.nodos[nodo.id]
  const tono = tonoDe(resultado.estado)
  const metrica = metricaDe(nodo, resultado, latencia, t, lang)
  const panelId = `topologia-${nodo.id}-detalle`

  return (
    <article className="relative h-full">
      <button
        type="button"
        // Hover para el mouse, foco para el teclado y clic para dejarlo
        // fijo: un tooltip que solo responde al puntero es un tooltip que
        // no existe para quien navega con tabulador.
        onMouseEnter={() => onAbrir(nodo.id, false)}
        onMouseLeave={onCerrar}
        onFocus={() => onAbrir(nodo.id, false)}
        onBlur={onCerrar}
        onClick={() => onAbrir(nodo.id, true)}
        aria-expanded={abierto}
        aria-controls={panelId}
        className={`card flex h-full w-full flex-col p-4 text-left transition-colors ${tono.borde} ${tono.fondo} hover:border-accent/50`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${tono.icono}`}>
            {Icono && <Icono size={15} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{texto.titulo}</p>
            <p className="truncate font-mono text-[10px] text-slate-500">{texto.sub}</p>
          </div>
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className={`absolute inline-flex h-full w-full animate-pulse-dot rounded-full ${tono.punto}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${tono.punto}`} />
          </span>
        </div>

        <p className="mt-3 flex items-baseline gap-1.5">
          <span className={`font-mono text-[19px] font-bold leading-none tracking-tight ${tono.valor}`}>
            {metrica.valor}
          </span>
          {metrica.unidad && <span className="font-mono text-[10px] text-slate-500">{metrica.unidad}</span>}
        </p>

        <p className={`mt-1.5 font-mono text-[10px] ${tono.texto}`}>{t.estados[resultado.estado] ?? t.estados.desconocido}</p>

        {simulado && (
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md border border-warn/40 bg-warn/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-warn">
            <FlaskConical size={10} aria-hidden="true" />
            {ui.caos.simulacro}
          </span>
        )}
      </button>

      {abierto && (
        <div
          id={panelId}
          role="tooltip"
          className="absolute inset-x-0 top-full z-20 mt-2 rounded-lg border border-base-500 bg-base-900/95 p-3.5 shadow-glow backdrop-blur-sm"
        >
          <p className="text-[11.5px] leading-relaxed text-slate-400">{texto.descripcion}</p>
          <dl className="mt-3 space-y-1.5 border-t border-base-600/60 pt-3">
            {camposDe(nodo, resultado, latencia, t, lang).map((f) => (
              <div key={f.etiqueta} className="flex items-baseline justify-between gap-3">
                <dt className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-slate-600">
                  {f.etiqueta}
                </dt>
                <dd className="truncate font-mono text-[10.5px] text-slate-300">{f.valor}</dd>
              </div>
            ))}
          </dl>
          {simulado && <p className="mt-3 font-mono text-[10px] leading-relaxed text-warn">{t.simulado}</p>}
        </div>
      )}
    </article>
  )
}

/**
 * Arista cliente → dependencia.
 *
 * Vertical en móvil y horizontal en escritorio, con el paquete animado
 * viajando en el sentido de la petición. Cuando el destino está en fallo
 * el paquete no sale y la línea queda punteada: un tráfico que sigue
 * fluyendo hacia un nodo caído sería una animación mintiendo.
 */
function Conector({ enlace, estadoDestino, t }) {
  const tono = tonoDe(estadoDestino)
  const fluye = estadoDestino === 'ok' || estadoDestino === 'corriendo'

  return (
    <div className="relative flex h-14 items-center justify-center md:h-16" aria-hidden="true">
      <span
        className={`absolute bottom-0 left-1/2 top-0 -translate-x-1/2 border-l md:bottom-auto md:left-0 md:right-0 md:top-1/2 md:translate-x-0 md:border-l-0 md:border-t ${tono.linea} ${
          fluye ? '' : 'border-dashed'
        }`}
      />
      {fluye && (
        <span
          className={`absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full animate-flow-y md:left-0 md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:animate-flow-x ${tono.paquete}`}
        />
      )}
      <span className="relative rounded border border-base-600 bg-base-800 px-2 py-0.5 font-mono text-[9.5px] text-slate-500">
        {t.enlaces[enlace.id] ?? enlace.peticion}
      </span>
    </div>
  )
}

export default function Topology() {
  const { ui, lang } = useContenido()
  const t = ui.topologia
  const { resultados: reales } = useEstado()
  const { escenario } = useCaos()
  const { latencia } = useTelemetria()

  // `fijado` es el clic; `sobrevolado`, el mouse o el foco. El clic gana,
  // para que se pueda leer el tooltip sin mantener el puntero quieto.
  const [fijado, setFijado] = useState(null)
  const [sobrevolado, setSobrevolado] = useState(null)
  const visible = fijado ?? sobrevolado

  const abrir = (id, porClic) => {
    if (porClic) setFijado((actual) => (actual === id ? null : id))
    else setSobrevolado(id)
  }
  const cerrar = () => setSobrevolado(null)

  // Igual que en el panel de estado: el simulacro se pinta ENCIMA del
  // chequeo real y solo sobre el servicio que el escenario declara.
  const estadoDe = (nodo) => {
    const real = nodo.servicio ? (reales[nodo.servicio] ?? { estado: 'consultando' }) : null
    if (!nodo.servicio) {
      // El cliente es este navegador: si está renderizando esto, responde.
      return { estado: 'ok', tipo: 'cliente' }
    }
    return nodoAfectado(nodo, escenario) ? resultadoSimulado(escenario, real) : real
  }

  const porId = Object.fromEntries(NODOS.map((n) => [n.id, estadoDe(n)]))
  const cliente = NODOS[0]

  const nodoProps = (nodo) => ({
    nodo,
    resultado: porId[nodo.id],
    latencia,
    simulado: Boolean(porId[nodo.id].simulado),
    abierto: visible === nodo.id,
    onAbrir: abrir,
    onCerrar: cerrar,
    t,
    ui,
    lang,
  })

  return (
    <div className="card mt-5 overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-base-600 bg-base-800/70 px-5 py-3">
        <p className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
          <Waypoints size={13} className="text-accent" aria-hidden="true" />
          {t.tablero}
        </p>
        <span className="font-mono text-[10.5px] text-slate-600">{t.pista}</span>
      </div>

      <p className="border-b border-base-600/60 px-5 py-3 text-[12.5px] leading-relaxed text-slate-500">{t.bajada}</p>

      {/* En escritorio el cliente ocupa las dos filas y de él salen las dos
          aristas; en móvil todo se apila, y cada conector lleva escrita su
          petición para que se siga leyendo como dos llamadas del navegador
          y no como una cadena. */}
      <div className="grid gap-x-4 bg-base-800 p-5 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,17rem)] md:items-center md:gap-y-4">
        <div className="md:row-span-2">
          <Nodo {...nodoProps(cliente)} />
        </div>

        {ENLACES.map((enlace) => {
          const destino = NODOS.find((n) => n.id === enlace.a)
          return (
            <Fragment key={enlace.id}>
              <Conector enlace={enlace} estadoDestino={porId[destino.id].estado} t={t} />
              <Nodo {...nodoProps(destino)} />
            </Fragment>
          )
        })}
      </div>

      <p className="border-t border-base-600/60 px-5 py-3 font-mono text-[10px] leading-relaxed text-slate-600">
        {t.leyenda}
      </p>
    </div>
  )
}
