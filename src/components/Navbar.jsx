import { useEffect, useState } from 'react'
import { Github, Linkedin, Menu, Terminal, X } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import LangToggle from './ui/LangToggle'

// Los ids son la clave de traducción: así el nav y `ui.nav` no pueden
// desincronizarse sin que salte a la vista.
const SECCIONES = ['sobre-mi', 'skills', 'metricas', 'telemetria', 'postmortems', 'labs', 'caos', 'consola', 'trayectoria', 'contacto']

export default function Navbar() {
  const { profile, ui } = useContenido()
  const [scrolled, setScrolled] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState('')

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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-base-600/80 bg-base-900/85 backdrop-blur-lg' : 'border-b border-transparent'
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between gap-3">
        <a href="#inicio" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            <Terminal size={16} />
          </span>
          <span className="font-mono text-sm font-semibold text-white">
            samuel<span className="text-accent">.garcia</span>
            <span className="animate-blink text-accent">_</span>
          </span>
        </a>

        {/* El nav completo aparece recién en lg: con ocho secciones, en md se
            apretaba contra el logo y el bloque de acciones. Hasta ahí manda el
            menú desplegable, que las muestra todas sin comprimir nada. */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {SECCIONES.map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                  activo === id ? 'text-accent' : 'text-slate-400 hover:text-white'
                }`}
              >
                {ui.nav[id]}
              </a>
            </li>
          ))}
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
          <a href="#contacto" className="btn-primary hidden px-4 py-2 text-xs lg:inline-flex">
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
            {SECCIONES.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setAbierto(false)}
                  className="block border-b border-base-700/60 py-3 text-sm text-slate-300 hover:text-accent"
                >
                  {ui.nav[id]}
                </a>
              </li>
            ))}
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
