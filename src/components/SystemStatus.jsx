import { useEffect, useState } from 'react'
import { ChevronDown, Info, RefreshCw } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useEstado } from '../estado/EstadoProvider'

// Igual que en el resto del sitio: las clases van completas porque Tailwind
// purga por coincidencia textual y `border-${tono}/40` no la encuentra.
const AGREGADO = {
  ok: { punto: 'bg-ok', texto: 'text-ok', borde: 'border-ok/25', fondo: 'bg-ok/[0.04]' },
  degradado: { punto: 'bg-warn', texto: 'text-warn', borde: 'border-warn/30', fondo: 'bg-warn/[0.05]' },
  caido: { punto: 'bg-crit', texto: 'text-crit', borde: 'border-crit/30', fondo: 'bg-crit/[0.05]' },
  desconocido: { punto: 'bg-slate-500', texto: 'text-slate-400', borde: 'border-base-600', fondo: 'bg-base-700/40' },
  cargando: { punto: 'bg-slate-600', texto: 'text-slate-500', borde: 'border-base-600', fondo: 'bg-base-700/40' },
}

const SERVICIO = {
  ok: 'text-ok',
  fallo: 'text-crit',
  corriendo: 'text-warn',
  desconocido: 'text-slate-500',
  consultando: 'text-slate-600',
}

/** Motivos por los que un chequeo puede quedar sin dato, en texto humano. */
function motivoLegible(resultado, ui) {
  switch (resultado.motivo) {
    case 'limite':
      return ui.estado.limiteApi
    case 'sin-pipeline':
      return ui.estado.sinPipeline
    case 'timeout':
    case 'red':
      return ui.estado.sinRed
    default:
      return resultado.codigo ? `HTTP ${resultado.codigo}` : ui.estado.sinRed
  }
}

/** La línea de detalle de cada servicio: lo que efectivamente se midió. */
function detalle(resultado, ui) {
  if (resultado.estado === 'consultando') return ui.estado.etiquetas.consultando
  if (resultado.tipo === 'origen') {
    if (resultado.estado === 'ok') return `${resultado.latencia} ms · HTTP ${resultado.codigo} · ${resultado.entorno}`
    return motivoLegible(resultado, ui)
  }
  if (resultado.estado === 'desconocido') return motivoLegible(resultado, ui)
  return [
    resultado.workflow,
    resultado.numero != null ? `${ui.estado.corrida} #${resultado.numero}` : null,
    resultado.rama ? `${ui.estado.rama} ${resultado.rama}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
}

function etiquetaEstado(estado, ui) {
  if (estado === 'ok') return ui.estado.etiquetas.ok
  if (estado === 'fallo') return ui.estado.etiquetas.fallo
  if (estado === 'corriendo') return ui.ci.corriendo
  if (estado === 'consultando') return ui.estado.etiquetas.consultando
  return ui.estado.etiquetas.desconocido
}

export default function SystemStatus() {
  const { ui } = useContenido()
  const { servicios, resultados, agregado, cargando, verificadoEn, refrescar } = useEstado()
  const [abierto, setAbierto] = useState(false)

  // "Verificado hace 40 s" tiene que envejecer solo, o miente a los dos
  // minutos. Un tick cada 20 s alcanza para la resolución que muestra.
  const [, tick] = useState(0)
  useEffect(() => {
    const t = setInterval(() => tick((v) => v + 1), 20000)
    return () => clearInterval(t)
  }, [])

  const tono = AGREGADO[agregado] ?? AGREGADO.desconocido
  const antiguedad = verificadoEn ? Math.max(0, Math.round((Date.now() - verificadoEn) / 1000)) : null

  return (
    <section id="estado" className="relative z-10 scroll-mt-24 pb-6">
      <div className="container-x">
        <div className={`card overflow-hidden ${tono.borde} ${tono.fondo}`}>
          {/* Banner */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                <span className={`absolute inline-flex h-full w-full rounded-full ${tono.punto} animate-pulse-dot`} />
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${tono.punto}`} />
              </span>
              <div className="min-w-0">
                <p className={`font-mono text-[13px] font-semibold ${tono.texto}`} aria-live="polite">
                  {ui.estado.banner[agregado] ?? ui.estado.banner.desconocido}
                </p>
                <p className="mt-0.5 font-mono text-[10.5px] text-slate-600">
                  {ui.estado.label}
                  {antiguedad != null && ` · ${ui.estado.chequeadoEn} ${ui.estado.hace(antiguedad)}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => refrescar({ usarCache: false })}
                disabled={cargando}
                aria-label={ui.estado.reintentar}
                className="rounded-md border border-base-600 p-2 text-slate-500 transition-colors hover:border-accent/40 hover:text-accent disabled:opacity-50"
              >
                <RefreshCw size={13} className={cargando ? 'animate-spin' : ''} />
              </button>
              <button
                type="button"
                onClick={() => setAbierto((v) => !v)}
                aria-expanded={abierto}
                aria-controls="estado-detalle"
                className="inline-flex items-center gap-1.5 rounded-md border border-base-600 px-3 py-2 font-mono text-[11px] text-slate-400 transition-colors hover:border-accent/40 hover:text-accent"
              >
                {abierto ? ui.estado.ocultarDetalle : ui.estado.verDetalle}
                <ChevronDown size={13} className={`transition-transform ${abierto ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Detalle */}
          <div
            id="estado-detalle"
            className={`grid transition-all duration-300 ease-out ${
              abierto ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <ul className="border-t border-base-600/70">
                {servicios.map((s) => {
                  const r = resultados[s.id] ?? { estado: 'consultando' }
                  return (
                    <li
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-base-600/40 px-5 py-3 last:border-b-0"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-[12px] text-slate-300">{s.etiqueta}</p>
                        <p className="mt-0.5 text-[12px] leading-snug text-slate-500">{ui.estado.servicios[s.id]}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-mono text-[11.5px] font-medium ${SERVICIO[r.estado] ?? SERVICIO.desconocido}`}>
                          {etiquetaEstado(r.estado, ui)}
                        </p>
                        <p className="mt-0.5 font-mono text-[10.5px] text-slate-600">{detalle(r, ui)}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <p className="flex items-start gap-2 border-t border-base-600/70 px-5 py-3 text-[11.5px] leading-relaxed text-slate-500">
                <Info size={13} className="mt-0.5 shrink-0 text-slate-600" aria-hidden="true" />
                {ui.estado.aviso}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
