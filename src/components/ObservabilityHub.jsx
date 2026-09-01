import { useEffect, useRef, useState } from 'react'
import { Activity, ClipboardList, Waypoints } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useCaos } from '../caos/CaosProvider'
import { usePlaybook } from '../playbooks/PlaybookProvider'
import Section from './ui/Section'
import Telemetry from './Telemetry'
import Topology from './Topology'
import ChaosPanel from './ChaosPanel'
import Playbooks from './Playbooks'
import SloCalculator from './SloCalculator'

// ─────────────────────────────────────────────────────────────
//  Observability Hub.
//
//  Las cinco piezas del laboratorio —tablero DORA, topología, sandbox de
//  caos, Command Center y presupuesto de error— eran cinco secciones
//  apiladas. Sumaban varias pantallas de scroll y, sobre todo, ninguna
//  quedaba nunca al lado de la otra: inyectar un fallo y mirar cómo se
//  come el presupuesto exigía recordar un número mientras se bajaba.
//  Acá van agrupadas en tres pestañas por lo que responden, no por el
//  orden en que se fueron escribiendo.
//
//  Los tres paneles se montan siempre y el inactivo se oculta con el
//  atributo `hidden`. Es la decisión que sostiene todo lo demás: un
//  simulacro de caos tiene una cuenta regresiva de diez segundos y el
//  Command Center guarda el paso en el que quedó el runbook. Desmontar
//  el panel al cambiar de pestaña mataría los intervalos y devolvería
//  los componentes a su estado inicial, así que la pestaña que no se ve
//  se apaga en CSS, no en React.
//
//  Ojo con las clases del panel: `hidden` es un atributo y Tailwind lo
//  respeta desde el preflight, pero cualquier utilidad de `display`
//  (`grid`, `flex`) sobre el mismo nodo le ganaría por especificidad y
//  el panel oculto se vería igual. Por eso el espaciado va con `space-y`,
//  que solo toca márgenes.
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

// `bloques` son las anclas que vive cada pestaña. Las usa el nav: un
// enlace a #caos tiene que abrir la pestaña que lo contiene antes de
// intentar el salto, porque un elemento con `display: none` no se puede
// desplazar a la vista.
const PESTANAS = [
  { id: 'telemetria', icono: Activity, bloques: ['telemetria'], Panel: PanelTelemetria },
  { id: 'topologia', icono: Waypoints, bloques: ['topologia', 'caos'], Panel: PanelTopologia },
  { id: 'runbooks', icono: ClipboardList, bloques: ['playbooks', 'slo'], Panel: PanelRunbooks },
]

const pestanaDe = (ancla) => PESTANAS.find((p) => p.id === ancla || p.bloques.includes(ancla))

export default function ObservabilityHub() {
  const { ui } = useContenido()
  const t = ui.hub

  const [activa, setActiva] = useState(PESTANAS[0].id)

  // Estado vivo de las otras pestañas. Es lo que hace visible que cambiar
  // de pestaña no cancela nada: con un simulacro corriendo o un runbook
  // abierto, la pestaña que lo contiene queda marcada aunque no se mire.
  const { activo: simulacro } = useCaos()
  const { activo: runbook } = usePlaybook()
  const aviso = {
    topologia: simulacro ? t.enCurso : null,
    runbooks: runbook ? t.abierto : null,
  }

  const cabeceraRef = useRef(null)
  const botonesRef = useRef({})
  // Ancla pendiente de un salto: se resuelve recién cuando React repintó
  // con la pestaña nueva ya visible, no antes.
  const pendiente = useRef(null)
  // El listener del hash se registra una sola vez, así que no puede leer
  // `activa` de la clausura: se quedaría con el valor del primer render.
  const activaRef = useRef(activa)

  // ── Enlaces del nav ────────────────────────────────────────
  // El navegador ya intentó el salto y no pudo si el bloque estaba en un
  // panel oculto. Acá se abre la pestaña correcta y el efecto de abajo
  // completa el desplazamiento.
  useEffect(() => {
    const alHash = () => {
      const ancla = decodeURIComponent(window.location.hash.slice(1))
      const destino = ancla && pestanaDe(ancla)
      if (!destino) return
      // Con la pestaña ya abierta, el bloque está visible y el salto lo
      // hace el navegador solo. Anotar un pendiente que nunca se resuelve
      // —React no re-renderiza si el estado no cambió— dejaría el salto
      // guardado para disparar solo en el próximo cambio de pestaña.
      if (activaRef.current === destino.id) return
      pendiente.current = ancla
      setActiva(destino.id)
    }

    alHash()
    window.addEventListener('hashchange', alHash)
    return () => window.removeEventListener('hashchange', alHash)
  }, [])

  useEffect(() => {
    activaRef.current = activa
    const ancla = pendiente.current
    if (!ancla) return
    pendiente.current = null
    document.getElementById(ancla)?.scrollIntoView({ block: 'start' })
  }, [activa])

  const elegir = (id) => {
    setActiva(id)
    // Si la barra de pestañas quedó arriba de la ventana, el panel nuevo
    // —más corto que el que se estaba mirando— dejaría la página flotando
    // debajo del final del hub. Se vuelve a la barra y desde ahí se lee.
    const caja = cabeceraRef.current?.getBoundingClientRect()
    if (caja && caja.top < 0) cabeceraRef.current.scrollIntoView({ block: 'start' })
  }

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
      <div
        ref={cabeceraRef}
        role="tablist"
        aria-label={t.aria}
        onKeyDown={alTeclear}
        className="grid gap-2.5 scroll-mt-24 sm:grid-cols-3"
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
                <span className={`block truncate text-[13px] font-semibold ${sel ? 'text-white' : 'text-slate-300'}`}>
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
                  <span className="hidden lg:inline">{marca}</span>
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
            className="mt-10 space-y-14"
          >
            <Panel />
          </div>
        )
      })}
    </Section>
  )
}
