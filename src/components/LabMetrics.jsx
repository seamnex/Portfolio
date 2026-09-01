import { ArrowUpRight, FlaskConical, HeartPulse, RefreshCw, Siren } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import Bloque from './ui/Bloque'

const iconos = { HeartPulse, RefreshCw, Siren }

// Tailwind necesita las clases completas en el código: interpolarlas
// (`text-${tone}`) hace que el purge no las encuentre y salen sin color.
const tonos = {
  ok: {
    valor: 'text-ok',
    icono: 'border-ok/30 bg-ok/10 text-ok',
    hover: 'hover:border-ok/50',
  },
  accent: {
    valor: 'text-accent',
    icono: 'border-accent/30 bg-accent/10 text-accent',
    hover: 'hover:border-accent/50',
  },
  crit: {
    valor: 'text-crit',
    icono: 'border-crit/30 bg-crit/10 text-crit',
    hover: 'hover:border-crit/50',
  },
}

function MetricCard({ m, verBitacora }) {
  const Icono = iconos[m.icono]
  const tono = tonos[m.tone] ?? tonos.accent

  return (
    <article className={`card group flex flex-col p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow ${tono.hover}`}>
      <div className="flex items-center gap-3">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg border ${tono.icono}`}>
          {Icono && <Icono size={16} />}
        </span>
        <h3 className="text-sm font-semibold leading-tight text-white">{m.titulo}</h3>
      </div>

      <p className="mt-5 flex items-baseline gap-1.5">
        <span className={`font-mono text-4xl font-bold tracking-tight ${tono.valor}`}>{m.valor}</span>
        <span className="font-mono text-sm font-medium text-slate-500">{m.unidad}</span>
      </p>

      <p className="mt-3 text-[13.5px] leading-relaxed text-slate-400">{m.resumen}</p>

      <p className="mt-4 border-l-2 border-base-600 pl-3 text-[12.5px] leading-relaxed text-slate-500">
        {m.evidencia}
      </p>

      <div className="mt-auto pt-5">
        <p className="font-mono text-[10.5px] uppercase leading-relaxed tracking-wider text-slate-600">
          {m.metodo}
        </p>
        <a
          href={m.repo}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11.5px] text-slate-400 transition-colors hover:text-accent"
        >
          {verBitacora}
          <ArrowUpRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </article>
  )
}

export default function LabMetrics() {
  const { labMetrics } = useContenido()

  return (
    <Bloque
      id="metricas"
      label={labMetrics.label}
      titulo={labMetrics.titulo}
      bajada={labMetrics.bajada}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {labMetrics.items.map((m) => (
          <MetricCard key={m.id} m={m} verBitacora={labMetrics.verBitacora} />
        ))}
      </div>

      <div className="card mt-5 border-accent/20 bg-accent/[0.04] p-6">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-accent">
          <FlaskConical size={13} /> {labMetrics.nota.titulo}
        </p>
        <p className="mt-3 max-w-4xl text-[13.5px] leading-relaxed text-slate-400">
          {labMetrics.nota.texto}
        </p>
      </div>
    </Bloque>
  )
}
