import { useEffect, useRef, useState } from 'react'
import { Activity, FlaskConical, Github, Linkedin, Terminal, UserRound } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useVista } from '../navegacion/VistaProvider'
import { useCaos } from '../caos/CaosProvider'
import { usePlaybook } from '../playbooks/PlaybookProvider'
import LangToggle from './ui/LangToggle'

// ─────────────────────────────────────────────────────────────
//  La barra superior.
//
//  Tres pestañas, el selector de idioma y nada más. Ya no hay scroll-spy
//  ni menú desplegable ni hamburguesa: con tres destinos, esconderlos
//  detrás de un botón costaría un toque de más para no ahorrar nada, y
//  el ancho alcanza incluso en un teléfono angosto porque abajo de `sm`
//  las pestañas se quedan en su icono.
//
//  El punto de aviso al lado de una pestaña no es decoración: dice que
//  lo que pasa en esa vista sigue pasando aunque se esté mirando otra.
//  Un simulacro corriendo marca el laboratorio —es donde se inyectó— y
//  también observabilidad, porque ahí es donde se ve el rojo.
// ─────────────────────────────────────────────────────────────
const PESTANAS = [
  { id: 'perfil', icono: UserRound },
  { id: 'observabilidad', icono: Activity },
  { id: 'laboratorio', icono: FlaskConical },
]

export default function Navbar() {
  const { profile, ui } = useContenido()
  const { vista, irA } = useVista()
  const [scrolled, setScrolled] = useState(false)

  const { activo: simulacro } = useCaos()
  const { activo: runbook } = usePlaybook()
  const aviso = {
    observabilidad: simulacro ? ui.vistas.observabilidad.aviso : null,
    laboratorio: simulacro || runbook ? ui.vistas.laboratorio.aviso : null,
  }

  const botonesRef = useRef({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Flechas para moverse entre pestañas, como pide el patrón de tabs: con
  // `tabIndex -1` en las no seleccionadas, el tabulador entra y sale del
  // grupo de una vez y adentro se navega con el teclado direccional.
  const alTeclear = (e) => {
    const orden = PESTANAS.map((p) => p.id)
    const i = orden.indexOf(vista)
    const salto = { ArrowRight: 1, ArrowLeft: -1 }[e.key]

    let siguiente = null
    if (salto) siguiente = orden[(i + salto + orden.length) % orden.length]
    else if (e.key === 'Home') siguiente = orden[0]
    else if (e.key === 'End') siguiente = orden.at(-1)
    if (!siguiente) return

    e.preventDefault()
    irA(siguiente)
    botonesRef.current[siguiente]?.focus({ preventScroll: true })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-base-600/80 bg-base-900/85 backdrop-blur-lg' : 'border-b border-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => irA('perfil', 'inicio')}
          className="group flex shrink-0 items-center gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            <Terminal size={16} />
          </span>
          <span className="hidden whitespace-nowrap font-mono text-sm font-semibold text-white sm:inline">
            samuel<span className="text-accent">.garcia</span>
            <span className="animate-blink text-accent">_</span>
          </span>
        </button>

        <div
          role="tablist"
          aria-label={ui.vistas.aria}
          onKeyDown={alTeclear}
          className="flex min-w-0 items-center gap-1"
        >
          {PESTANAS.map((p) => {
            const texto = ui.vistas[p.id]
            const Icono = p.icono
            const sel = p.id === vista
            const marca = aviso[p.id]

            return (
              <button
                key={p.id}
                ref={(nodo) => {
                  botonesRef.current[p.id] = nodo
                }}
                type="button"
                role="tab"
                aria-selected={sel}
                aria-controls={`vista-${p.id}`}
                // El rótulo visible se recorta abajo de `md`, así que el
                // nombre completo de la vista viaja en el aria-label: es
                // el que lee un lector de pantalla en cualquier ancho.
                aria-label={texto.titulo}
                tabIndex={sel ? 0 : -1}
                onClick={() => irA(p.id)}
                className={`relative flex items-center gap-2 whitespace-nowrap rounded-md border px-2.5 py-2 text-[13px] transition-colors sm:px-3 ${
                  sel
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-transparent text-slate-400 hover:bg-base-700/60 hover:text-white'
                }`}
              >
                <Icono size={15} aria-hidden="true" />
                <span className="hidden md:inline">{texto.nav}</span>

                {marca && (
                  <span
                    className="absolute right-1 top-1 flex h-2 w-2 md:static md:right-auto md:top-auto"
                    title={marca}
                  >
                    <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-warn" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-warn" />
                    <span className="sr-only">{marca}</span>
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LangToggle />

          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="hidden rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent lg:inline-flex"
            >
              <Github size={16} />
            </a>
          )}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="hidden rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent lg:inline-flex"
          >
            <Linkedin size={16} />
          </a>
          <button
            type="button"
            onClick={() => irA('perfil', 'contacto')}
            className="btn-primary hidden whitespace-nowrap px-4 py-2 text-xs lg:inline-flex"
          >
            {ui.nav.cta}
          </button>
        </div>
      </nav>
    </header>
  )
}
