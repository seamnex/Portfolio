import { ArrowRightLeft, CheckCircle2 } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import Section from './ui/Section'

export default function About() {
  const { about } = useContenido()

  return (
    <Section id="sobre-mi" label={about.label} titulo={about.titulo} bajada={about.bajada}>
      <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          {about.parrafos.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-slate-400">
              {p}
            </p>
          ))}

          {/* Puente conceptual ITIL → SRE */}
          <div className="card mt-6 p-6">
            <p className="section-label">{about.puente.label}</p>
            <div className="mt-5 grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-crit/25 bg-crit/[0.06] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-crit">{about.puente.reactivo.etiqueta}</p>
                <p className="mt-2 text-sm text-slate-300">{about.puente.reactivo.texto}</p>
              </div>
              <ArrowRightLeft size={20} className="mx-auto hidden text-accent sm:block" />
              <div className="rounded-lg border border-ok/25 bg-ok/[0.06] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ok">{about.puente.preventivo.etiqueta}</p>
                <p className="mt-2 text-sm text-slate-300">{about.puente.preventivo.texto}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="section-label">{about.comoTrabajo}</p>
          {about.principios.map((pr) => (
            <article key={pr.titulo} className="card card-hover p-5">
              <h3 className="flex items-start gap-2.5 text-sm font-semibold text-white">
                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-accent" />
                {pr.titulo}
              </h3>
              <p className="mt-2 pl-[26px] text-[13px] leading-relaxed text-slate-400">{pr.texto}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}
