import { Briefcase, GraduationCap } from 'lucide-react'
import { timeline } from '../data/content'
import Section from './ui/Section'

export default function Timeline() {
  return (
    <Section
      id="trayectoria"
      label="Trayectoria & aprendizaje"
      titulo="Mapa de carrera: de la mesa de ayuda al diseño de resiliencia"
      bajada="Una progresión deliberada: primero entender al usuario, después el sistema, después el incidente y hoy la ingeniería que lo previene."
    >
      <ol className="relative space-y-6 border-l border-base-600 pl-8 sm:pl-10">
        {timeline.map((item, i) => {
          const esFormacion = item.tipo === 'formacion'
          const Icono = esFormacion ? GraduationCap : Briefcase

          return (
            <li key={i} className="relative">
              {/* Nodo */}
              <span
                className={`absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full border sm:-left-[49px] ${
                  esFormacion ? 'border-ok/40 bg-base-900 text-ok' : 'border-accent/40 bg-base-900 text-accent'
                }`}
              >
                <Icono size={12} />
                {esFormacion && (
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-ok/25" />
                )}
              </span>

              <article className="card card-hover p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{item.rol}</h3>
                    <p className="mt-1 font-mono text-[12px] text-accent">{item.org}</p>
                  </div>
                  <span
                    className={`rounded-md border px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-wider ${
                      esFormacion ? 'border-ok/30 bg-ok/10 text-ok' : 'border-base-600 bg-base-800 text-slate-400'
                    }`}
                  >
                    {item.periodo}
                  </span>
                </div>

                <p className="mt-4 text-[13.5px] leading-relaxed text-slate-400">{item.resumen}</p>

                <ul className="mt-4 space-y-2">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[13px] text-slate-400">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <span key={t} className="pill">
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
