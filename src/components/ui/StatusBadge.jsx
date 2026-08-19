/** Badge de disponibilidad con punto titilante (estilo status page). */
export default function StatusBadge({ texto, tone = 'ok' }) {
  const tones = {
    ok: 'border-ok/30 bg-ok/10 text-ok',
    accent: 'border-accent/30 bg-accent/10 text-accent',
    crit: 'border-crit/30 bg-crit/10 text-crit',
  }
  const dots = { ok: 'bg-ok', accent: 'bg-accent', crit: 'bg-crit' }

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-medium tracking-wide ${tones[tone]}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full ${dots[tone]} animate-pulse-dot`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${dots[tone]}`} />
      </span>
      {texto}
    </span>
  )
}
