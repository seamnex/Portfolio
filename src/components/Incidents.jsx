import { ArrowRight, ShieldAlert, TriangleAlert } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { usePostMortem } from '../postmortem/PostMortemProvider'
import Section from './ui/Section'

const SEVERIDAD = {
  P1: { chip: 'border-crit/40 bg-crit/10 text-crit', borde: 'hover:border-crit/50', punto: 'bg-crit' },
  P2: { chip: 'border-warn/40 bg-warn/10 text-warn', borde: 'hover:border-warn/50', punto: 'bg-warn' },
  P3: { chip: 'border-ok/40 bg-ok/10 text-ok', borde: 'hover:border-ok/50', punto: 'bg-ok' },
  P4: { chip: 'border-accent/40 bg-accent/10 text-accent', borde: 'hover:border-accent/50', punto: 'bg-accent' },
}

const TONO_METRICA = {
  ok: 'text-ok',
  accent: 'text-accent',
  crit: 'text-crit',
  warn: 'text-warn',
  muted: 'text-slate-400',
}

function IncidentCard({ incidente, cta, onAbrir }) {
  const sev = SEVERIDAD[incidente.severidad] ?? SEVERIDAD.P4

  return (
    <article className={`card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${sev.borde}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] tracking-wider text-slate-500">{incidente.codigo}</span>
          <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${sev.chip}`}>
            {incidente.severidad}
          </span>
        </div>
        <span className="font-mono text-[10.5px] text-slate-600">{incidente.lab}</span>
      </div>

      <h3 className="mt-3 text-base font-semibold leading-snug text-white transition-colors group-hover:text-accent">
        {incidente.titulo}
      </h3>

      <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{incidente.resumen}</p>

      <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-base-600/60 pt-4">
        {incidente.metricas.map((m) => (
          <div key={m.k} className="min-w-0">
            <dt className="truncate font-mono text-[9.5px] uppercase tracking-wider text-slate-600" title={m.k}>
              {m.k}
            </dt>
            <dd className={`mt-1 font-mono text-[13px] font-bold ${TONO_METRICA[m.tone] ?? TONO_METRICA.muted}`}>
              {m.v}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto pt-5">
        <button
          type="button"
          onClick={onAbrir}
          className="btn-ghost w-full px-3 py-2 text-xs"
          // El código del incidente en la etiqueta accesible: cuatro botones
          // que dicen "Abrir post-mortem" son indistinguibles en un lector de
          // pantalla que los recorre fuera de contexto.
          aria-label={`${cta} — ${incidente.codigo} ${incidente.titulo}`}
        >
          {cta}
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}

export default function Incidents() {
  const { incidentes, incidentesMeta } = useContenido()
  const { abrir } = usePostMortem()

  return (
    <Section
      id="postmortems"
      label={incidentesMeta.label}
      titulo={incidentesMeta.titulo}
      bajada={incidentesMeta.bajada}
    >
      {/* El aviso va arriba de las tarjetas, no en letra chica al pie: que
          las fallas sean inyectadas es lo primero que tiene que saber quien
          lee esto, y esconderlo sería justamente lo contrario del punto. */}
      <div className="card mb-8 flex items-start gap-3 border-warn/25 bg-warn/[0.05] p-4">
        <TriangleAlert size={15} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
        <p className="text-[12.5px] leading-relaxed text-slate-400">{incidentesMeta.aviso}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {incidentes.map((incidente) => (
          <IncidentCard
            key={incidente.id}
            incidente={incidente}
            cta={incidentesMeta.cta}
            onAbrir={() => abrir(incidente.id)}
          />
        ))}
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-center font-mono text-[11px] text-slate-600">
        <ShieldAlert size={12} aria-hidden="true" />
        {incidentesMeta.pista}
      </p>
    </Section>
  )
}
