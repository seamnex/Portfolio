import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'

export default function Footer() {
  const { profile, ui } = useContenido()

  return (
    <footer className="relative z-10 border-t border-base-600 bg-base-900/60">
      <div className="container-x flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-mono text-sm text-white">
            {profile.alias}
            <span className="text-accent">_</span>
          </p>
          <p className="mt-1.5 text-[12px] text-slate-500">
            {profile.rol} · {profile.target}
          </p>
          <p className="mt-3 font-mono text-[11px] text-slate-600">
            © {new Date().getFullYear()} — {ui.footer.construido}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${profile.email}`}
            aria-label="Email"
            className="rounded-md border border-base-600 p-2.5 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Mail size={16} />
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="LinkedIn"
            className="rounded-md border border-base-600 p-2.5 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent"
          >
            <Linkedin size={16} />
          </a>
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub"
              className="rounded-md border border-base-600 p-2.5 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent"
            >
              <Github size={16} />
            </a>
          )}
          {/* Sube la vista que se está mirando, no la portada: con tres
              vistas, un ancla a #inicio sacaría al visitante del panel en
              el que estaba para llevarlo a otra página. */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0 })}
            aria-label={ui.nav.volverArriba}
            className="rounded-md border border-base-600 p-2.5 text-slate-400 transition-colors hover:border-accent/50 hover:text-accent"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
