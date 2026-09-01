import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowRight, ChevronUp, ClipboardList, FlaskConical, Radar, Waypoints } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useCaos } from '../caos/CaosProvider'
import { usePlaybook } from '../playbooks/PlaybookProvider'
import Section from './ui/Section'
import Telemetry from './Telemetry'
import Topology from './Topology'
import ChaosPanel from './ChaosPanel'
import Playbooks from './Playbooks'
import SloCalculator from './SloCalculator'
import LabMetrics from './LabMetrics'
import Incidents from './Incidents'
import Projects from './Projects'
import Console from './Console'

// ─────────────────────────────────────────────────────────────
//  Observability Hub.
//
//  Todo el laboratorio —tablero DORA, topología, sandbox de caos,
//  Command Center, presupuesto de error, métricas de los labs,
//  post-mortems, proyectos y la consola— vive acá adentro, y acá adentro
//  arranca cerrado.
//
//  El motivo es de lectura, no de peso: son nueve paneles y quien entra a
//  ver un perfil no pidió nueve paneles. Cerrado, la portada es hero →
//  perfil → skills → trayectoria → esta tarjeta → contacto, que se
//  recorre de una sentada. Abierto, es el sitio entero.
//
//  Tres estados y no dos, a propósito:
//
//   · `montado` es irreversible. Antes del primer clic no se monta nada:
//     ni el muestreo de latencia, ni los chequeos del panel de estado, ni
//     el intérprete de la consola. Una portada no tiene por qué pagar el
//     costo de un sandbox que nadie abrió.
//   · `abierto` va y viene, pero cerrar oculta con `hidden`, no
//     desmonta: un simulacro con su cuenta regresiva y un runbook en el
//     paso 3 tienen que seguir ahí al reabrir. Es la misma regla que
//     entre pestañas.
//   · `activa` es la pestaña.
//
//  Ojo con las clases del panel: `hidden` es un atributo y Tailwind lo
//  respeta desde el preflight, pero cualquier utilidad de `display`
//  (`grid`, `flex`) sobre el mismo nodo le ganaría por especificidad y el
//  panel oculto se vería igual. Por eso el espaciado va con `space-y`,
//  que solo toca márgenes — y que además saltea los `[hidden]` al contar
//  hermanos, así el panel apagado tampoco deja su hueco.
// ─────────────────────────────────────────────────────────────

function PanelTelemetria() {
  return <Telemetry />
}

function PanelTopologia() {
  return (
    <>
      <Topology />
      <ChaosPanel />
    </>
  )
}

function PanelRunbooks() {
  return (
    <>
      <Playbooks />
      <SloCalculator />
    </>
  )
}

function PanelLabs() {
  return (
    <>
      <LabMetrics />
      <Incidents />
      <Projects />
    </>
  )
}

// `bloques` son las anclas que vive cada pestaña. Las usa el nav: un
// enlace a #caos tiene que abrir el sandbox y su pestaña antes de
// intentar el salto, porque un elemento con `display: none` no se puede
// desplazar a la vista.
const PESTANAS = [
  { id: 'telemetria', icono: Activity, bloques: ['telemetria'], Panel: PanelTelemetria },
  { id: 'topologia', icono: Waypoints, bloques: ['topologia', 'caos'], Panel: PanelTopologia },
  { id: 'runbooks', icono: ClipboardList, bloques: ['playbooks', 'slo'], Panel: PanelRunbooks },
  { id: 'labs', icono: FlaskConical, bloques: ['metricas', 'postmortems', 'labs'], Panel: PanelLabs },
]

// La consola no es de ninguna pestaña: es la salida compartida de todas.
// Vive debajo de los paneles, siempre visible con el sandbox abierto.
const ANCLA_CONSOLA = 'consola'

const pestanaDe = (ancla) => PESTANAS.find((p) => p.id === ancla || p.bloques.includes(ancla))

/**
 * La tarjeta destacada: lo único que el hub muestra cerrado.
 *
 * Enumera lo que hay adentro en vez de resumirlo en una frase, porque el
 * costo de abrir es un clic y la decisión de darlo se toma leyendo qué
 * hay. Si algo quedó corriendo de una sesión anterior de la misma visita,
 * lo dice: el estado sobrevive al cierre y ocultarlo sería mentir.
 */
function Tarjeta({ t, vivo, onAbrir, botonRef }) {
  return (
    <div className="card overflow-hidden border-accent/30 bg-accent/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-base-600/70 bg-base-800/50 px-6 py-3.5">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          <Radar size={14} aria-hidden="true" />
          {t.tarjeta.etiqueta}
        </p>
        {vivo && (
          <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-warn">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-warn" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-warn" />
            </span>
            {t.tarjeta.vivo}
          </span>
        )}
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{t.tarjeta.titulo}</h3>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-slate-400">{t.tarjeta.texto}</p>

        {/* El índice de lo que hay adentro: los mismos cuatro rótulos que
            después son las pestañas, para que abrir no sorprenda. */}
        <ul className="mt-7 grid gap-3 sm:grid-cols-2">
          {PESTANAS.map((p) => {
            const texto = t.pestanas[p.id]
            const Icono = p.icono
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-base-600/70 bg-base-800/40 px-4 py-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-base-600 bg-base-900 text-accent">
                  <Icono size={15} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold text-slate-200">{texto.titulo}</span>
                  <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">{texto.resumen}</span>
                </span>
              </li>
            )
          })}
        </ul>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" ref={botonRef} onClick={onAbrir} className="btn-primary">
            {t.tarjeta.abrir}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <span className="font-mono text-[11px] text-slate-600">{t.tarjeta.pie}</span>
        </div>
      </div>
    </div>
  )
}

export default function ObservabilityHub() {
  const { ui } = useContenido()
  const t = ui.hub

  const [montado, setMontado] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [activa, setActiva] = useState(PESTANAS[0].id)

  // Estado vivo de las otras pestañas. Es lo que hace visible que ni
  // cambiar de pestaña ni cerrar el sandbox cancela nada: con un simulacro
  // corriendo o un runbook abierto, queda marcado aunque no se mire.
  const { activo: simulacro } = useCaos()
  const { activo: runbook } = usePlaybook()
  const aviso = {
    topologia: simulacro ? t.enCurso : null,
    runbooks: runbook ? t.abierto : null,
  }

  const botonesRef = useRef({})
  // Ancla pendiente de un salto: se resuelve recién cuando React repintó
  // con el sandbox abierto y la pestaña correcta ya visible, no antes.
  const pendiente = useRef(null)
  // El listener del hash se registra una sola vez, así que no puede leer
  // el estado de la clausura: se quedaría con el del primer render.
  const activaRef = useRef(activa)
  const abiertoRef = useRef(abierto)

  // ── Enlaces del nav ────────────────────────────────────────
  // El navegador ya intentó el salto y no pudo si el bloque estaba en un
  // panel oculto —o adentro del sandbox cerrado—. Acá se abre lo que haga
  // falta y el efecto de abajo completa el desplazamiento.
  useEffect(() => {
    const alHash = () => {
      const ancla = decodeURIComponent(window.location.hash.slice(1))
      if (!ancla) return
      const destino = pestanaDe(ancla)
      if (!destino && ancla !== ANCLA_CONSOLA) return

      // Con el sandbox ya abierto en la pestaña correcta, el bloque está
      // visible y el salto lo hace el navegador solo. Anotar un pendiente
      // que nunca se resuelve —React no re-renderiza si el estado no
      // cambió— lo dejaría guardado para disparar en el próximo cambio.
      if (abiertoRef.current && (!destino || activaRef.current === destino.id)) return

      pendiente.current = ancla
      setMontado(true)
      setAbierto(true)
      if (destino) setActiva(destino.id)
    }

    alHash()
    window.addEventListener('hashchange', alHash)
    return () => window.removeEventListener('hashchange', alHash)
  }, [])

  useEffect(() => {
    activaRef.current = activa
    abiertoRef.current = abierto

    const ancla = pendiente.current
    if (!ancla) return
    pendiente.current = null
    document.getElementById(ancla)?.scrollIntoView({ block: 'start' })
  }, [activa, abierto])

  // Abrir no desplaza nada: la tarjeta se reemplaza por la barra de
  // pestañas más o menos donde estaba, y un salto acá se sentiría un
  // tirón sin motivo. Cerrar sí, porque la página acaba de perder varias
  // pantallas de alto y el visitante quedaría flotando debajo del final.
  //
  // Los dos botones se llevan el foco con ellos al desaparecer, así que
  // hay que devolverlo a mano: sin esto, quien abre o cierra con teclado
  // pierde el punto y el próximo tabulador lo manda de vuelta al principio
  // del documento. `preventScroll` para no pelearse con el salto de arriba.
  const focoAbrir = useRef(null)
  const devolverFoco = useRef(null)

  const abrirSandbox = () => {
    devolverFoco.current = 'pestanas'
    setMontado(true)
    setAbierto(true)
  }

  const cerrarSandbox = () => {
    pendiente.current = 'observabilidad'
    devolverFoco.current = 'tarjeta'
    setAbierto(false)
  }

  useEffect(() => {
    const destino = devolverFoco.current
    if (!destino) return
    devolverFoco.current = null
    const nodo = destino === 'tarjeta' ? focoAbrir.current : botonesRef.current[activaRef.current]
    nodo?.focus({ preventScroll: true })
  }, [abierto])

  const elegir = (id) => setActiva(id)

  // Flechas para moverse entre pestañas, como pide el patrón de tabs: con
  // `tabIndex -1` en las no seleccionadas, el tabulador entra y sale del
  // grupo de una vez y adentro se navega con el teclado direccional.
  const alTeclear = (e) => {
    const orden = PESTANAS.map((p) => p.id)
    const i = orden.indexOf(activa)
    const salto = { ArrowRight: 1, ArrowLeft: -1 }[e.key]

    let siguiente = null
    if (salto) siguiente = orden[(i + salto + orden.length) % orden.length]
    else if (e.key === 'Home') siguiente = orden[0]
    else if (e.key === 'End') siguiente = orden.at(-1)
    if (!siguiente) return

    e.preventDefault()
    setActiva(siguiente)
    botonesRef.current[siguiente]?.focus()
  }

  return (
    <Section id="observabilidad" label={t.label} titulo={t.titulo} bajada={t.bajada}>
      {!abierto && (
        <Tarjeta t={t} vivo={Boolean(simulacro || runbook)} onAbrir={abrirSandbox} botonRef={focoAbrir} />
      )}

      {montado && (
        <div hidden={!abierto} className="space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              <Radar size={14} aria-hidden="true" />
              {t.tarjeta.etiqueta}
            </p>
            <button
              type="button"
              onClick={cerrarSandbox}
              className="inline-flex items-center gap-1.5 rounded-md border border-base-600 px-3 py-2 font-mono text-[11px] text-slate-400 transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ChevronUp size={13} aria-hidden="true" />
              {t.cerrar}
            </button>
          </div>

          <div
            role="tablist"
            aria-label={t.aria}
            onKeyDown={alTeclear}
            className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {PESTANAS.map((p) => {
              const texto = t.pestanas[p.id]
              const Icono = p.icono
              const sel = p.id === activa
              const marca = aviso[p.id]

              return (
                <button
                  key={p.id}
                  ref={(nodo) => {
                    botonesRef.current[p.id] = nodo
                  }}
                  id={`hub-tab-${p.id}`}
                  type="button"
                  role="tab"
                  aria-selected={sel}
                  aria-controls={`hub-panel-${p.id}`}
                  tabIndex={sel ? 0 : -1}
                  onClick={() => elegir(p.id)}
                  className={`card flex items-center gap-3 p-4 text-left transition-all duration-200 ${
                    sel
                      ? 'border-accent/60 bg-accent/[0.06] shadow-glow'
                      : 'hover:-translate-y-0.5 hover:border-accent/40'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                      sel ? 'border-accent/40 bg-accent/10 text-accent' : 'border-base-600 bg-base-800 text-slate-500'
                    }`}
                  >
                    <Icono size={16} />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-[13px] font-semibold ${sel ? 'text-white' : 'text-slate-300'}`}
                    >
                      {texto.titulo}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">{texto.resumen}</span>
                  </span>

                  {/* El punto no es decorativo: dice que lo que pasa en esa
                      pestaña sigue pasando aunque se esté mirando otra. */}
                  {marca && (
                    <span className="flex shrink-0 items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider text-warn">
                      <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-warn" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-warn" />
                      </span>
                      <span className="hidden xl:inline">{marca}</span>
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {PESTANAS.map((p) => {
            const { Panel } = p
            return (
              <div
                key={p.id}
                id={`hub-panel-${p.id}`}
                role="tabpanel"
                aria-labelledby={`hub-tab-${p.id}`}
                hidden={p.id !== activa}
                className="space-y-14"
              >
                <Panel />
              </div>
            )
          })}

          {/* La consola cierra el sandbox y queda fuera de las pestañas: es
              la salida compartida de todas. Cada simulacro de caos y cada
              paso de runbook escriben acá, y si viviera dentro de una sola
              pestaña esos botones parecerían no hacer nada desde las otras. */}
          <Console />
        </div>
      )}
    </Section>
  )
}
