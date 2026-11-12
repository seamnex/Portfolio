import { ArrowRight, Download, FlaskConical, FolderGit2, Languages, Linkedin, MapPin, Github } from 'lucide-react'
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

            {/* El nombre es el h1: quien llega desde un link de LinkedIn o
                el mail de un reclutador tiene que saber de quién es esto en
                el primer segundo. El eslogan va debajo, como tesis. */}
            <h1 className="mt-7 text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
              {profile.alias}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-slate-400">
              <span>{profile.rol}</span>
              <ArrowRight size={14} className="text-slate-500" aria-hidden="true" />
              <span className="sr-only">{hero.transicion}</span>
              <span className="text-accent">{profile.target}</span>
            </p>

            <p className="mt-6 text-balance text-2xl font-semibold leading-snug tracking-tight text-slate-200 sm:text-[1.7rem]">
              {hero.headline[0]} <span className="text-accent">{hero.headline[1]}</span>
            </p>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-400">{hero.subtitle}</p>

            {/* El par principal es CV y contacto: es lo que viene a hacer
                un reclutador. Los labs quedan como tercera opción. */}
            <div className="mt-8 flex flex-wrap gap-3">
              {/* `download` con nombre explícito: el archivo servido se llama
                  cv-…-sre.pdf, pero en la carpeta de descargas de un reclutador
                  conviene que se llame por la persona y el rol. */}
              <a href={profile.cv} download={profile.cvArchivo} className="btn-primary">
                <Download size={16} /> {ui.acciones.descargarCV}
              </a>
              <a href="#contacto" className="btn-ghost">
                {ui.acciones.contactar} <ArrowRight size={16} />
              </a>
              <a href="#labs" className="btn-ghost">
                <FolderGit2 size={16} /> {ui.acciones.verLabs}
              </a>
            </div>

            {/* La puerta al laboratorio, ahora secundaria: es lo que un PDF
                no puede ofrecer, pero no tiene que tapar al CV ni al
                contacto. Una fila liviana, sin brillo, que cambia de vista
                sin recargar. */}
            <button
              type="button"
              onClick={() => irA('laboratorio')}
              className="group mt-6 flex w-full max-w-xl items-center gap-3.5 rounded-xl border border-base-600 bg-base-700/40 px-4 py-3.5 text-left transition-colors duration-200 hover:border-accent/50 hover:bg-base-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-base-800"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-accent/30 bg-base-900 text-accent">
                <FlaskConical size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ok">
                  <span className="relative flex h-2 w-2" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-ok" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
                  </span>
                  {hero.sandbox.tag}
                </span>
                <span className="mt-0.5 block text-[15px] font-semibold text-white">{hero.sandbox.titulo}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-slate-400">{hero.sandbox.texto}</span>
              </span>
              <ArrowRight
                size={16}
                className="shrink-0 text-slate-500 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                aria-hidden="true"
              />
            </button>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {profile.ubicacion}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages size={13} /> {profile.idiomas}
              </span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 py-1.5 transition-colors hover:text-accent"
              >
                <Linkedin size={13} /> LinkedIn
              </a>
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 py-1.5 transition-colors hover:text-accent"
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
