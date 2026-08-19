import { ArrowRightLeft, CheckCircle2 } from 'lucide-react'
import { about } from '../data/content'
import Section from './ui/Section'

export default function About() {
  return (
    <Section
      id="sobre-mi"
      label="Sobre mí"
      titulo="Perfil híbrido: quien apaga el incendio sabe dónde estaba el cortocircuito"
      bajada="La experiencia en gestión de incidentes no es un paso previo a SRE: es exactamente el insumo que hace valiosa la práctica SRE."
    >
      <div className="grid gap-12 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          {about.parrafos.map((p, i) => (
            <p key={i} className="text-[15px] leading-relaxed text-slate-400">
              {p}
            </p>
          ))}

          {/* Puente conceptual ITIL → SRE */}
          <div className="card mt-8 p-6">
            <p className="section-label">El puente</p>
            <div className="mt-5 grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-lg border border-crit/25 bg-crit/[0.06] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-crit">Reactivo · ITIL</p>
                <p className="mt-2 text-sm text-slate-300">Detectar, mitigar y restaurar el servicio bajo presión</p>
              </div>
              <ArrowRightLeft size={20} className="mx-auto hidden text-accent sm:block" />
              <div className="rounded-lg border border-ok/25 bg-ok/[0.06] p-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-ok">Preventivo · SRE</p>
                <p className="mt-2 text-sm text-slate-300">Instrumentar, automatizar y diseñar para que no vuelva a pasar</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="section-label">Cómo trabajo</p>
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
