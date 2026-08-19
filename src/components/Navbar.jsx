import { useEffect, useState } from 'react'
import { Github, Linkedin, Menu, Terminal, X } from 'lucide-react'
import { profile } from '../data/content'

const links = [
  { href: '#sobre-mi', label: 'Sobre mí' },
  { href: '#skills', label: 'Especialización' },
  { href: '#labs', label: 'Labs & Proyectos' },
  { href: '#trayectoria', label: 'Trayectoria' },
  { href: '#contacto', label: 'Contacto' },
]

export default function Navbar() {
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
    const secciones = links
      .map((l) => document.querySelector(l.href))
      .filter(Boolean)

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActivo(`#${e.target.id}`)
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
      <nav className="container-x flex h-16 items-center justify-between">
        <a href="#inicio" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/40 bg-accent/10 text-accent transition-colors group-hover:bg-accent/20">
            <Terminal size={16} />
          </span>
          <span className="font-mono text-sm font-semibold text-white">
            samuel<span className="text-accent">.garcia</span>
            <span className="animate-blink text-accent">_</span>
          </span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={`rounded-md px-3 py-2 text-sm transition-colors ${
                  activo === l.href ? 'text-accent' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Github size={16} />
            </a>
          )}
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Linkedin size={16} />
          </a>
          <a href="#contacto" className="btn-primary px-4 py-2 text-xs">
            Contactar
          </a>
        </div>

        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-label="Abrir menú"
          aria-expanded={abierto}
          className="rounded-md border border-base-600 p-2 text-slate-300 md:hidden"
        >
          {abierto ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {abierto && (
        <div className="border-t border-base-600 bg-base-900/95 backdrop-blur-lg md:hidden">
          <ul className="container-x flex flex-col py-3">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setAbierto(false)}
                  className="block border-b border-base-700/60 py-3 text-sm text-slate-300 hover:text-accent"
                >
                  {l.label}
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
