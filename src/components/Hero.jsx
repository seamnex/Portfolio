import { ArrowRight, Download, FlaskConical, FolderGit2, Linkedin, MapPin, Github } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useVista } from '../navegacion/VistaProvider'
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
  const { irA } = useVista()

  return (
    <section id="inicio" className="relative z-10 overflow-hidden pb-10 pt-28 sm:pb-14 sm:pt-36">
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

            {/* La puerta al laboratorio, antes que los botones: un botón
                con forma de tarjeta, con el brillo que el resto reserva
                para el hover, porque es la única cosa de esta portada que
                un PDF no puede ofrecer. Cambia de vista sin recargar. */}
            <button
              type="button"
              onClick={() => irA('laboratorio')}
              className="group relative mt-7 flex w-full max-w-xl items-center gap-4 overflow-hidden rounded-xl border border-accent/50 bg-gradient-to-r from-accent/[0.14] via-base-700/60 to-ok/[0.10] p-4 text-left shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:from-accent/[0.22] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base-800 sm:p-5"
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-10 animate-scanline bg-gradient-to-b from-accent/[0.08] to-transparent" />
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-accent/40 bg-base-900 text-accent transition-colors group-hover:bg-accent/15">
                <FlaskConical size={22} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-ok">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-ok" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
                  </span>
                  {hero.sandbox.tag}
                </span>
                <span className="mt-1 block text-[15px] font-bold tracking-tight text-white sm:text-base">
                  {hero.sandbox.titulo}
                </span>
                <span className="mt-1 block text-[12.5px] leading-snug text-slate-400">{hero.sandbox.texto}</span>
                <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11.5px] font-semibold text-accent">
                  {hero.sandbox.cta}
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </span>
            </button>

            <div className="mt-6 flex flex-wrap gap-3">
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
