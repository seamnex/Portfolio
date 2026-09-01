import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Github, Linkedin, Menu, Terminal, X } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import LangToggle from './ui/LangToggle'

// ─────────────────────────────────────────────────────────────
//  Estructura del nav.
//
//  Los ids son la clave de traducción: así el nav y `ui.nav` no pueden
//  desincronizarse sin que salte a la vista.
//
//  Un ítem con `hijos` es un grupo. Se agrupa porque diez enlaces sueltos
//  en la barra no son diez caminos: son un muro que nadie lee. Todo lo que
//  sale del mismo laboratorio —lo que se mide, lo que se rompe a propósito,
//  el procedimiento para arreglarlo y lo que se consulta— entra bajo un
//  solo rótulo.
//
//  Los tres del medio ya no son secciones sino pestañas del Observability
//  Hub: sus anclas viven dentro de paneles que pueden estar ocultos, así
//  que el hub escucha el hash y abre la pestaña que corresponde antes de
//  saltar. Por eso los rótulos repiten el nombre de la pestaña — el enlace
//  y la pestaña que abre tienen que llamarse igual.
//
//  `destino` es adónde apunta el rótulo del grupo cuando alguien lo toca
//  en vez de abrirlo: el hub, que es lo que el grupo nombra.
// ─────────────────────────────────────────────────────────────
const NAV = [
  { id: 'sobre-mi' },
  { id: 'skills' },
  {
    id: 'observabilidad',
    destino: 'observabilidad',
    hijos: ['metricas', 'telemetria', 'caos', 'playbooks', 'consola', 'postmortems'],
  },
  { id: 'labs' },
  { id: 'trayectoria' },
  { id: 'contacto' },
]

/** Todas las secciones con ancla en la página, para el scroll-spy. */
const SECCIONES = NAV.flatMap((item) => item.hijos ?? [item.id])

export default function Navbar() {
  const { profile, ui } = useContenido()
  const [scrolled, setScrolled] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [grupoAbierto, setGrupoAbierto] = useState(null)
  const [activo, setActivo] = useState('')

  const navRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Scroll-spy: marca la sección visible en el nav
  useEffect(() => {
    const secciones = SECCIONES.map((id) => document.getElementById(id)).filter(Boolean)

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActivo(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    secciones.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  // El desplegable se abre al pasar el mouse, pero tiene que poder cerrarse
  // sin mouse: Escape y un clic afuera. Sin esto, quien navega con teclado lo
  // abre con Enter y se queda con el panel encima del contenido.
  useEffect(() => {
    if (!grupoAbierto) return undefined

    const alClic = (e) => {
      if (!navRef.current?.contains(e.target)) setGrupoAbierto(null)
    }
    const alTeclear = (e) => {
      if (e.key === 'Escape') setGrupoAbierto(null)
    }

    document.addEventListener('mousedown', alClic)
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('mousedown', alClic)
      document.removeEventListener('keydown', alTeclear)
    }
  }, [grupoAbierto])

  /** Un grupo está activo si la sección visible es cualquiera de sus hijas. */
  const estaActivo = (item) => (item.hijos ? item.hijos.includes(activo) : item.id === activo)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-base-600/80 bg-base-900/85 backdrop-blur-lg' : 'border-b border-transparent'
      }`}
    >
      <nav ref={navRef} className="container-x flex h-16 items-center justify-between gap-3">
        <a href="#inicio" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            <Terminal size={16} />
          </span>
          <span className="whitespace-nowrap font-mono text-sm font-semibold text-white">
            samuel<span className="text-accent">.garcia</span>
            <span className="animate-blink text-accent">_</span>
          </span>
        </a>

        {/* El nav completo aparece recién en lg: aun con seis ítems, en md se
            apretaría contra el logo y el bloque de acciones. Hasta ahí manda el
            menú desplegable, que las muestra todas sin comprimir nada. */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((item) => {
            const marcado = estaActivo(item)

            if (!item.hijos) {
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className={`block whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                      marcado ? 'text-accent' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {ui.nav[item.id]}
                  </a>
                </li>
              )
            }

            const desplegado = grupoAbierto === item.id
            return (
              <li
                key={item.id}
                className="relative"
                onMouseEnter={() => setGrupoAbierto(item.id)}
                onMouseLeave={() => setGrupoAbierto(null)}
              >
                <button
                  type="button"
                  onClick={() => setGrupoAbierto(desplegado ? null : item.id)}
                  aria-expanded={desplegado}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                    marcado || desplegado ? 'text-accent' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {ui.nav[item.id]}
                  <ChevronDown
                    size={13}
                    className={`transition-transform ${desplegado ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>

                {desplegado && (
                  // `pt-1` en el contenedor y no `mt-1`: si hubiera un hueco
                  // real entre el botón y el panel, el mouse lo cruzaría y el
                  // onMouseLeave cerraría el menú antes de llegar al primer link.
                  <div className="absolute left-0 top-full pt-1">
                    <ul className="min-w-[13rem] overflow-hidden rounded-lg border border-base-600 bg-base-900/95 py-1 shadow-2xl shadow-black/50 backdrop-blur-lg">
                      {item.hijos.map((hijo) => (
                        <li key={hijo}>
                          <a
                            href={`#${hijo}`}
                            onClick={() => setGrupoAbierto(null)}
                            className={`block whitespace-nowrap px-4 py-2 text-[13px] transition-colors hover:bg-base-700/60 ${
                              activo === hijo ? 'text-accent' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {ui.nav[hijo]}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

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
          <a href="#contacto" className="btn-primary hidden whitespace-nowrap px-4 py-2 text-xs lg:inline-flex">
            {ui.nav.cta}
          </a>

          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            aria-label={abierto ? ui.nav.cerrar : ui.nav.abrir}
            aria-expanded={abierto}
            className="rounded-md border border-base-600 p-2 text-slate-300 lg:hidden"
          >
            {abierto ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {abierto && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-base-600 bg-base-900/95 backdrop-blur-lg lg:hidden">
          <ul className="container-x flex flex-col py-3">
            {NAV.map((item) =>
              // En el menú móvil el grupo no se despliega: se muestra abierto,
              // como encabezado y sublista. Un acordeón dentro de un panel que
              // ya es un acordeón obliga a dos toques para llegar a un ancla.
              item.hijos ? (
                <li key={item.id} className="border-b border-base-700/60 py-3">
                  <a
                    href={`#${item.destino}`}
                    onClick={() => setAbierto(false)}
                    className="block text-sm text-slate-300 hover:text-accent"
                  >
                    {ui.nav[item.id]}
                  </a>
                  <ul className="mt-1 border-l border-base-700 pl-4">
                    {item.hijos.map((hijo) => (
                      <li key={hijo}>
                        <a
                          href={`#${hijo}`}
                          onClick={() => setAbierto(false)}
                          className="block py-2 text-[13px] text-slate-500 hover:text-accent"
                        >
                          {ui.nav[hijo]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setAbierto(false)}
                    className="block border-b border-base-700/60 py-3 text-sm text-slate-300 hover:text-accent"
                  >
                    {ui.nav[item.id]}
                  </a>
                </li>
              ),
            )}
            <li className="flex gap-2 pt-4">
              <a href={profile.linkedin} target="_blank" rel="noreferrer noopener" className="btn-ghost flex-1 py-2 text-xs">
                <Linkedin size={14} /> LinkedIn
              </a>
              {profile.github && (
                <a href={profile.github} target="_blank" rel="noreferrer noopener" className="btn-ghost flex-1 py-2 text-xs">
                  <Github size={14} /> GitHub
                </a>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
