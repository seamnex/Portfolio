import { CircleDashed, CircleSlash, GitBranch, XCircle, CheckCircle2 } from 'lucide-react'
import { useContenido } from '../../i18n/LanguageProvider'

// Estilo de badge clásico de CI —etiqueta oscura, valor de color— pero armado
// con el dato de la API en vez de con el SVG que sirve GitHub. Así el badge
// dice el número de corrida, respeta el tema del sitio y no depende de que el
// CDN de shields.io siga en pie.
const ESTILOS = {
  ok: { clase: 'border-ok/30 bg-ok/10 text-ok', Icono: CheckCircle2 },
  fallo: { clase: 'border-crit/30 bg-crit/10 text-crit', Icono: XCircle },
  corriendo: { clase: 'border-warn/30 bg-warn/10 text-warn', Icono: CircleDashed },
  consultando: { clase: 'border-base-600 bg-base-800 text-slate-500', Icono: CircleDashed },
  desconocido: { clase: 'border-base-600 bg-base-800 text-slate-500', Icono: CircleSlash },
}

/**
 * Badge de estado de GitHub Actions.
 *
 * Devuelve `null` cuando no hay pipeline que mostrar: un repo sin workflows
 * no lleva badge gris de adorno, y mucho menos uno verde. La ausencia del
 * badge ya comunica lo correcto.
 */
export default function CIBadge({ pipeline, className = '' }) {
  const { ui } = useContenido()
  if (!pipeline) return null
  if (pipeline.estado === 'desconocido' && pipeline.motivo === 'sin-pipeline') return null

  const { clase, Icono } = ESTILOS[pipeline.estado] ?? ESTILOS.desconocido
  const texto =
    pipeline.estado === 'ok'
      ? ui.ci.passing
      : pipeline.estado === 'fallo'
        ? ui.ci.failing
        : pipeline.estado === 'corriendo'
          ? ui.ci.corriendo
          : ui.ci.desconocido

  const contenido = (
    <>
      <span className="flex items-center gap-1.5 rounded-l-[5px] bg-base-900/80 px-2 py-1 text-slate-400">
        <GitBranch size={11} aria-hidden="true" />
        {ui.ci.titulo}
      </span>
      <span className={`flex items-center gap-1.5 rounded-r-[5px] px-2 py-1 ${clase}`}>
        <Icono size={11} className={pipeline.estado === 'corriendo' ? 'animate-spin' : ''} aria-hidden="true" />
        {texto}
        {pipeline.numero != null && <span className="opacity-60">#{pipeline.numero}</span>}
      </span>
    </>
  )

  const claseBase = `inline-flex overflow-hidden rounded-md border border-base-600 font-mono text-[10px] leading-none ${className}`

  // Sin URL de corrida (por ejemplo mientras se consulta) el badge no debe ser
  // un enlace: un <a> sin href es un elemento que no recibe foco ni anuncia rol.
  if (!pipeline.url) {
    return (
      <span className={claseBase} title={pipeline.repo}>
        {contenido}
      </span>
    )
  }

  return (
    <a
      href={pipeline.url}
      target="_blank"
      rel="noreferrer noopener"
      title={`${ui.ci.verCorrida} · ${pipeline.repo}`}
      className={`${claseBase} transition-colors hover:border-accent/40`}
    >
      {contenido}
    </a>
  )
}
