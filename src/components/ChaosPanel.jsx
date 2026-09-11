import { useEffect, useState } from 'react'
import { HeartPulse, PlugZap, ServerCrash, ShieldCheck, Timer, TriangleAlert, Zap } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useCaos } from '../caos/CaosProvider'
import { ESCENARIOS, FASES, reloj } from '../lib/caos.js'
import Bloque from './ui/Bloque'

const iconos = { Timer, PlugZap, ServerCrash }

const NIVEL = {
  ok: 'text-ok',
  accent: 'text-accent',
  crit: 'text-crit',
  warn: 'text-warn',
  muted: 'text-slate-500',
}

// El tono del escenario según el estado que fuerza. Clases completas por
// el purge de Tailwind, igual que en el resto del sitio.
const IMPACTO = {
  degradado: {
    icono: 'border-warn/30 bg-warn/10 text-warn',
    boton: 'hover:border-warn/50 hover:text-warn',
    activo: 'border-warn/60 bg-warn/10 text-warn',
    caja: 'border-warn/40 bg-warn/[0.05]',
    punto: 'bg-warn',
    texto: 'text-warn',
  },
  caido: {
    icono: 'border-crit/30 bg-crit/10 text-crit',
    boton: 'hover:border-crit/50 hover:text-crit',
    activo: 'border-crit/60 bg-crit/10 text-crit',
    caja: 'border-crit/40 bg-crit/[0.05]',
    punto: 'bg-crit',
    texto: 'text-crit',
  },
}

/** Cuenta regresiva hasta el auto-healing, en segundos enteros. */
function useCuentaRegresiva(terminaEn) {
  const [restante, setRestante] = useState(null)

  useEffect(() => {
    if (!terminaEn) {
      setRestante(null)
      return undefined
    }
    const calcular = () => setRestante(Math.max(0, Math.ceil((terminaEn - Date.now()) / 1000)))
    calcular()
    // 250 ms y no 1000: con un tick de un segundo, el número que se ve al
    // arrancar puede estar hasta un segundo desfasado del real.
    const t = setInterval(calcular, 250)
    return () => clearInterval(t)
  }, [terminaEn])

  return restante
}

function BotonEscenario({ escenario, texto, activo, onInyectar, ui }) {
  const Icono = iconos[escenario.icono]
  const tono = IMPACTO[escenario.impacto] ?? IMPACTO.degradado

  return (
    <button
      type="button"
      onClick={() => onInyectar(escenario.id)}
      aria-pressed={activo}
      className={`card group flex h-full min-w-0 flex-col items-start p-5 text-left transition-all duration-200 ${
        activo ? tono.activo : `text-slate-400 ${tono.boton} hover:-translate-y-0.5`
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tono.icono}`}>
          {Icono && <Icono size={15} />}
        </span>
        <span className="pill font-mono text-[10px]">{escenario.severidad}</span>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">{texto.titulo}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{texto.descripcion}</p>

      <p className="mt-3 w-full overflow-x-auto whitespace-pre font-mono text-[10px] text-slate-600">
        {escenario.senal}
      </p>

      <span
        className={`mt-auto inline-flex items-center gap-1.5 pt-4 font-mono text-[11px] ${
          activo ? tono.texto : 'text-slate-500 transition-colors group-hover:text-accent'
        }`}
      >
        <Zap size={12} />
        {activo ? ui.caos.enCurso : ui.caos.inyectar}
      </span>
    </button>
  )
}

export default function ChaosPanel() {
  const { ui } = useContenido()
  const t = ui.caos
  const { escenario, fase, terminaEn, registro, activo, inyectar, restaurar, autohealingMs } = useCaos()
  const restante = useCuentaRegresiva(terminaEn)

  const tono = escenario ? IMPACTO[escenario.impacto] ?? IMPACTO.degradado : null
  const indiceFase = fase ? FASES.findIndex((f) => f.id === fase) : -1
  const progreso = restante != null ? Math.min(100, 100 - (restante * 1000 * 100) / autohealingMs) : 0

  return (
    <Bloque id="caos" label={t.label} titulo={t.titulo} bajada={t.bajada}>
      {/* Aviso primero, no al pie: el visitante tiene que saber que esto es
          un simulacro ANTES de apretar el botón, no después de ver el panel
          de estado en rojo y asustarse. */}
      <p className="mb-6 flex items-start gap-2.5 rounded-lg border border-warn/20 bg-warn/[0.05] px-4 py-3 text-[12.5px] leading-relaxed text-slate-400">
        <TriangleAlert size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
        {t.aviso}
      </p>

      <div className="grid gap-5 md:grid-cols-3">
        {ESCENARIOS.map((e) => (
          <BotonEscenario
            key={e.id}
            escenario={e}
            texto={t.escenarios[e.id]}
            activo={escenario?.id === e.id}
            onInyectar={inyectar}
            ui={ui}
          />
        ))}
      </div>

      {/* Consola del simulacro: estado, cuenta regresiva y bitácora */}
      <div className={`card mt-5 overflow-hidden ${activo ? tono.caja : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-base-600/70 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {activo ? (
              <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                <span className={`absolute inline-flex h-full w-full animate-pulse-dot rounded-full ${tono.punto}`} />
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${tono.punto}`} />
              </span>
            ) : (
              <ShieldCheck size={14} className="shrink-0 text-ok" aria-hidden="true" />
            )}

            <div className="min-w-0">
              <p
                className={`font-mono text-[13px] font-semibold ${activo ? tono.texto : 'text-ok'}`}
                aria-live="polite"
              >
                {activo ? t.activo(t.escenarios[escenario.id].titulo) : t.listo}
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] text-slate-600">
                {activo && indiceFase >= 0
                  ? `${t.fase} ${indiceFase + 1}/${FASES.length} · ${t.nombresFase[fase]}`
                  : t.listoDetalle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activo && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                <HeartPulse size={13} className="text-ok" />
                {t.autoHealing(restante ?? 0)}
              </span>
            )}
            <button
              type="button"
              onClick={() => restaurar()}
              disabled={!activo}
              className="rounded-md border border-base-600 px-3 py-2 font-mono text-[11px] text-slate-400 transition-colors hover:border-ok/40 hover:text-ok disabled:opacity-40 disabled:hover:border-base-600 disabled:hover:text-slate-400"
            >
              {t.restaurar}
            </button>
          </div>
        </div>

        {/* Barra de progreso del auto-healing */}
        <div className="h-0.5 w-full bg-base-600/40" aria-hidden="true">
          <div
            className={`h-full transition-[width] duration-200 ease-linear ${activo ? 'bg-ok' : 'w-0'}`}
            style={{ width: activo ? `${progreso}%` : 0 }}
          />
        </div>

        {/* Bitácora. Es la misma que se escribe en la consola del sitio:
            un simulacro sin registro no deja nada que revisar después. */}
        <div className="h-52 overflow-y-auto p-4 font-mono text-[11.5px] leading-relaxed">
          {registro.length === 0 ? (
            <p className="text-slate-600">{t.bitacoraVacia}</p>
          ) : (
            registro.map((l) => (
              <p key={l.id} className="flex gap-3">
                <span className="shrink-0 text-slate-600">{reloj(l.ts)}</span>
                <span className={NIVEL[l.nivel] ?? 'text-slate-400'}>{l.texto}</span>
              </p>
            ))
          )}
          <span className="sr-only" aria-live="polite">
            {registro.at(-1)?.texto}
          </span>
        </div>
      </div>
    </Bloque>
  )
}
