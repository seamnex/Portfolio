import { useState } from 'react'
import { Briefcase, ChevronDown, GraduationCap } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { periodoCon } from '../lib/periodo.js'
import Section from './ui/Section'

// ─────────────────────────────────────────────────────────────
//  Resumen de trayectoria.
//
//  Cada puesto muestra siempre lo que se lee de un vistazo —rol,
//  organización, período, una línea de resumen y las tecnologías— y deja
//  los logros detrás de un desplegable. Cuatro puestos con todos sus
//  bullets abiertos son casi una pantalla entera de lista, y en una
//  portada eso compite con el resto por atención que no sobra.
//
//  El primero arranca abierto porque es el puesto actual: es el que casi
//  todo el mundo viene a leer, y esconderlo detrás de un clic para
//  ahorrar cuatro renglones sería ahorrar en el lugar equivocado.
// ─────────────────────────────────────────────────────────────
export default function Timeline() {
  const { timeline, timelineMeta, ui } = useContenido()
  const [abierto, setAbierto] = useState(0)

  return (
    <Section id="trayectoria" label={timelineMeta.label} titulo={timelineMeta.titulo} bajada={timelineMeta.bajada}>
      <ol className="relative space-y-5 border-l border-base-600 pl-8 sm:pl-10">
        {timeline.map((item, i) => {
          const esFormacion = item.tipo === 'formacion'
          const Icono = esFormacion ? GraduationCap : Briefcase
          const desplegado = abierto === i
          const panelId = `trayectoria-${i}-logros`

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

              <article className={`card overflow-hidden ${desplegado ? 'border-accent/40' : 'card-hover'}`}>
                <div className="p-6">
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
                      {periodoCon(item, ui.duracion)}
                    </span>
                  </div>

                  <p className="mt-4 text-[13.5px] leading-relaxed text-slate-400">{item.resumen}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-1.5">
                    {item.tags.map((t) => (
                      <span key={t} className="pill">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAbierto(desplegado ? null : i)}
                  aria-expanded={desplegado}
                  aria-controls={panelId}
                  className="flex w-full items-center justify-between gap-3 border-t border-base-600/70 px-6 py-3 font-mono text-[11px] text-slate-500 transition-colors hover:text-accent"
                >
                  <span>
                    {desplegado ? ui.trayectoria.ocultarLogros : ui.trayectoria.verLogros}
                    <span className="ml-2 text-slate-600">{ui.trayectoria.cuantos(item.bullets.length)}</span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${desplegado ? 'rotate-180 text-accent' : ''}`}
                  />
                </button>

                <div
                  id={panelId}
                  className={`grid transition-all duration-300 ease-out ${
                    desplegado ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-2 border-t border-base-600/70 px-6 py-5">
                      {item.bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-400">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
