import { AlertTriangle, BellRing, CheckCircle2, Info, ShieldCheck, X } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useAvisos } from '../avisos/AvisosProvider'
import { reloj } from '../lib/caos.js'

// ─────────────────────────────────────────────────────────────
//  La pila de avisos flotantes.
//
//  Tarjetas con la forma de una alerta de PagerDuty: rótulo de estado
//  arriba (TRIGGERED / ACKNOWLEDGED / RESOLVED), severidad, hora, título
//  y una línea técnica abajo. En escritorio cuelgan de la esquina
//  superior derecha, debajo de la barra; en móvil suben desde abajo, que
//  es donde el pulgar llega a cerrarlas.
//
//  `aria-live="polite"` en la región y no en cada tarjeta: el lector de
//  pantalla anuncia lo nuevo sin interrumpir lo que estaba leyendo, y
//  no vuelve a leer la pila entera cada vez que entra una.
// ─────────────────────────────────────────────────────────────
const ESTILO = {
  triggered: {
    icono: BellRing,
    borde: 'border-crit/50',
    barra: 'bg-crit',
    chip: 'border-crit/40 bg-crit/15 text-crit',
    punto: 'bg-crit',
    pulso: true,
  },
  acknowledged: {
    icono: ShieldCheck,
    borde: 'border-warn/50',
    barra: 'bg-warn',
    chip: 'border-warn/40 bg-warn/15 text-warn',
    punto: 'bg-warn',
    pulso: true,
  },
  resolved: {
    icono: CheckCircle2,
    borde: 'border-ok/50',
    barra: 'bg-ok',
    chip: 'border-ok/40 bg-ok/15 text-ok',
    punto: 'bg-ok',
    pulso: false,
  },
  info: {
    icono: Info,
    borde: 'border-accent/50',
    barra: 'bg-accent',
    chip: 'border-accent/40 bg-accent/15 text-accent',
    punto: 'bg-accent',
    pulso: false,
  },
  error: {
    icono: AlertTriangle,
    borde: 'border-crit/50',
    barra: 'bg-crit',
    chip: 'border-crit/40 bg-crit/15 text-crit',
    punto: 'bg-crit',
    pulso: false,
  },
}

const SEVERIDAD = {
  P1: 'border-crit/40 bg-crit/10 text-crit',
  P2: 'border-warn/40 bg-warn/10 text-warn',
  P3: 'border-ok/40 bg-ok/10 text-ok',
}

function Aviso({ aviso, onCerrar }) {
  const { ui } = useContenido()
  const t = ui.avisos
  const e = ESTILO[aviso.estado] ?? ESTILO.info
  const Icono = e.icono

  return (
    <div
      role="status"
      className={`card pointer-events-auto relative w-full animate-slide-in overflow-hidden border bg-base-800/95 shadow-2xl shadow-black/50 backdrop-blur ${e.borde}`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${e.barra}`} aria-hidden="true" />

      <div className="flex items-start gap-3 py-3 pl-4 pr-3">
        <span className="mt-0.5 shrink-0 text-slate-300">
          <Icono size={16} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] ${e.chip}`}
            >
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                {e.pulso && <span className={`absolute inline-flex h-full w-full animate-pulse-dot rounded-full ${e.punto}`} />}
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${e.punto}`} />
              </span>
              {t.estados[aviso.estado] ?? aviso.estado}
            </span>
            {aviso.severidad && (
              <span
                className={`rounded border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider ${
                  SEVERIDAD[aviso.severidad] ?? SEVERIDAD.P3
                }`}
              >
                {aviso.severidad}
              </span>
            )}
            <span className="ml-auto font-mono text-[10px] text-slate-500">{reloj(aviso.ts)}</span>
          </div>

          <p className="mt-1.5 text-[13px] font-semibold leading-snug text-white">{aviso.titulo}</p>
          {aviso.detalle && (
            <p className="mt-1 break-words font-mono text-[11px] leading-relaxed text-slate-400">{aviso.detalle}</p>
          )}
          {aviso.meta && (
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-600">{aviso.meta}</p>
          )}
        </div>

        <button
          type="button"
          onClick={onCerrar}
          aria-label={t.cerrar}
          className="-mr-1 -mt-1 shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-base-700 hover:text-white"
        >
          <X size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function Avisos() {
  const { ui } = useContenido()
  const { avisos, cerrar } = useAvisos()

  // La región existe siempre, aunque esté vacía: un `aria-live` que
  // aparece junto con su primer contenido no se anuncia.
  return (
    <div
      aria-live="polite"
      aria-label={ui.avisos.region}
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[70] flex flex-col gap-2.5 sm:inset-x-auto sm:right-5 sm:top-20 sm:w-[380px]"
    >
      {avisos.map((a) => (
        // La clave del incidente y no el id del aviso: cuando TRIGGERED pasa a
        // ACKNOWLEDGED la tarjeta cambia en su lugar en vez de volver a entrar.
        <Aviso key={a.clave ?? a.id} aviso={a} onCerrar={() => cerrar(a.id)} />
      ))}
    </div>
  )
}
