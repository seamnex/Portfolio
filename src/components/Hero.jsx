import { ArrowRight, Download, FolderGit2, Linkedin, MapPin, Github } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import StatusBadge from './ui/StatusBadge'
import CopyButton from './ui/CopyButton'

const toneMap = {
  ok: 'text-ok',
  accent: 'text-accent',
  crit: 'text-crit',
  muted: 'text-slate-400',
}

export default function Hero() {
  const { hero, metrics, profile, ui } = useContenido()

  return (
    <section id="inicio" className="relative z-10 overflow-hidden pb-20 pt-32 sm:pt-40">
      <div className="container-x">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          {/* Columna izquierda — mensaje */}
          <div className="animate-fade-up">
            <StatusBadge texto={profile.disponibilidad} tone="ok" />

            <h1 className="mt-7 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {hero.headline[0]}
              <br />
              <span className="bg-gradient-to-r from-accent via-accent-soft to-ok bg-clip-text text-transparent">
                {hero.headline[1]}
              </span>
            </h1>

            <p className="mt-4 font-mono text-sm text-slate-400">
              {profile.rol} <span className="text-base-500">·</span>{' '}
              <span className="text-accent">{profile.target}</span>
            </p>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-400">{hero.subtitle}</p>

            <div className="mt-9 flex flex-wrap gap-3">
              {/* `download` con nombre explícito: el archivo servido se llama
                  cv-…-sre.pdf, pero en la carpeta de descargas de un reclutador
                  conviene que se llame por la persona y el rol. */}
              <a href={profile.cv} download={profile.cvArchivo} className="btn-primary">
                <Download size={16} /> {ui.acciones.descargarCV}
              </a>
              <a href="#labs" className="btn-ghost">
                <FolderGit2 size={16} /> {ui.acciones.verLabs}
              </a>
              <a href="#contacto" className="btn-ghost">
                {ui.acciones.contactar} <ArrowRight size={16} />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {profile.ubicacion}
              </span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
              >
                <Linkedin size={13} /> LinkedIn
              </a>
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                >
                  <Github size={13} /> GitHub
                </a>
              )}
              <CopyButton value={profile.email} label={profile.email} />
            </div>
          </div>

          {/* Columna derecha — terminal / status panel */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="card overflow-hidden shadow-2xl shadow-black/40">
              <div className="flex items-center gap-2 border-b border-base-600 bg-base-800/80 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-crit/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
                <span className="ml-2 font-mono text-[11px] text-slate-500">{hero.terminal.titulo}</span>
              </div>

              <div className="relative p-5 font-mono text-[12.5px] leading-relaxed sm:text-[13px]">
                <span className="pointer-events-none absolute inset-x-0 top-0 h-16 animate-scanline bg-gradient-to-b from-accent/[0.06] to-transparent" />

                <p className="text-slate-500">
                  <span className="text-ok">{hero.terminal.prompt}</span>{' '}
                  <span className="text-slate-300">{hero.terminal.comando}</span>
                </p>

                <div className="mt-4 space-y-2.5">
                  {hero.terminal.salida.map((linea) => (
                    <div key={linea.k} className="flex items-baseline justify-between gap-4 border-b border-base-600/50 pb-2">
                      <span className="text-slate-500">{linea.k}</span>
                      <span className={`text-right ${toneMap[linea.tone]}`}>{linea.v}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-slate-500">
                  <span className="text-ok">{hero.terminal.prompt}</span>{' '}
                  <span className="animate-blink text-accent">▊</span>
                </p>
              </div>
            </div>

            {/* Métricas rápidas */}
            <dl className="mt-5 grid grid-cols-2 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="card card-hover p-4">
                  <dt className="text-xl font-bold text-white">
                    {m.valor}
                    {m.unidad && <span className="ml-1 text-xs font-medium text-accent">{m.unidad}</span>}
                  </dt>
                  <dd className="mt-1 text-[11.5px] leading-snug text-slate-500">{m.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
