import { useEffect, useRef, useState } from 'react'
import { HeartPulse, PlugZap, ServerCrash, ShieldCheck, Timer, TriangleAlert, Zap } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useCaos } from '../caos/CaosProvider'
import { ESCENARIOS, FASES, escenarioPorId, reloj } from '../lib/caos.js'
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
      // Nombre corto: sin esto el lector de pantalla lee la tarjeta entera
      // (descripción y regla de alerta incluidas) como nombre del botón.
      aria-label={`${activo ? ui.caos.enCurso : ui.caos.inyectar}: ${texto.titulo}`}
      className={`card group flex h-full min-w-0 flex-col items-start p-5 text-left transition-all duration-200 ${
        activo ? tono.activo : `text-slate-400 ${tono.boton} hover:-translate-y-0.5`
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tono.icono}`}>
          {Icono && <Icono size={15} />}
        </span>
        <span className="pill font-mono text-xs">{escenario.severidad}</span>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">{texto.titulo}</h3>
      <p className="mb-4 mt-2 text-[13px] leading-relaxed text-slate-400">{texto.descripcion}</p>

      {/* La regla de alerta no va en la tarjeta: se escribe en la bitácora
          en el momento en que dispara, que es donde dice algo. */}
      <span
        className={`mt-auto inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[13px] font-semibold ${
          activo
            ? `border-current ${tono.texto}`
            : 'border-base-500 text-slate-300 transition-colors group-hover:border-accent/60 group-hover:text-accent'
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
  // La bitácora se vuelve a escribir con el idioma activo: cada línea
  // guarda su fase y su escenario, no solo el texto ya armado.
  const textoDe = (l) => {
    const armar = ui.caos.fases[l.fase]
    const esc = escenarioPorId(l.escenario)
    return armar && esc ? armar(esc, ui) : l.texto
  }
  const restante = useCuentaRegresiva(terminaEn)

  const tono = escenario ? IMPACTO[escenario.impacto] ?? IMPACTO.degradado : null
  const indiceFase = fase ? FASES.findIndex((f) => f.id === fase) : -1
  const progreso = restante != null ? Math.min(100, 100 - (restante * 1000 * 100) / autohealingMs) : 0

  // El panel del simulacro aparece con el primer fallo y se queda: antes de
  // eso era una caja que solo decía "no pasa nada" debajo de tres botones
  // que ya lo dicen. Después conserva la bitácora, que es lo que se revisa.
  const hayPanel = activo || registro.length > 0

  // En el teléfono las tarjetas van apiladas y el panel queda fuera de
  // pantalla: inyectar desde acá lo trae a la vista, si no el botón parece
  // no haber hecho nada. `nearest` no mueve nada cuando ya se ve.
  const panel = useRef(null)
  const inyectarAca = (id) => {
    inyectar(id)
    requestAnimationFrame(() => panel.current?.scrollIntoView({ block: 'nearest' }))
  }

  return (
    <Bloque id="caos" label={t.label} titulo={t.titulo} bajada={t.bajada}>
      {/* Aviso primero, no al pie: el visitante tiene que saber que esto es
          un simulacro ANTES de apretar el botón, no después de ver el panel
          de estado en rojo y asustarse. */}
      <p className="mb-6 flex items-start gap-2.5 rounded-lg border border-warn/20 bg-warn/[0.05] px-4 py-3 text-[13px] leading-relaxed text-slate-400">
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
            onInyectar={inyectarAca}
            ui={ui}
          />
        ))}
      </div>

      {/* La región viva existe desde el principio: una que nace junto con
          su primer texto no se anuncia. */}
      <span className="sr-only" aria-live="polite">
        {registro.length > 0 && textoDe(registro.at(-1))}
      </span>

      {/* Consola del simulacro: estado, cuenta regresiva y bitácora */}
      {hayPanel && (
      <div ref={panel} className={`card mt-5 scroll-mb-28 scroll-mt-28 overflow-hidden ${activo ? tono.caja : ''}`}>
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
              <p className={`font-mono text-[13px] font-semibold ${activo ? tono.texto : 'text-ok'}`}>
                {activo ? t.activo(t.escenarios[escenario.id].titulo) : t.listo}
              </p>
              <p className="mt-0.5 font-mono text-xs text-slate-600">
                {activo && indiceFase >= 0
                  ? `${t.fase} ${indiceFase + 1}/${FASES.length} · ${t.nombresFase[fase]}`
                  : t.listoDetalle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activo && (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-400">
                <HeartPulse size={13} className="text-ok" />
                {t.autoHealing(restante ?? 0)}
              </span>
            )}
            <button
              type="button"
              onClick={() => restaurar()}
              disabled={!activo}
              className="toque rounded-md border border-base-600 px-3 py-2 font-mono text-xs text-slate-400 transition-colors hover:border-ok/40 hover:text-ok disabled:opacity-40 disabled:hover:border-base-600 disabled:hover:text-slate-400"
            >
              {t.restaurar}
            </button>
          </div>
        </div>

        {/* Barra de progreso del auto-healing */}
        {/* Lo que falta para que vuelva va rayado en el tono del fallo —el
            mismo rayado de la barra del incidente de la marca—, y el verde
            lo va tapando. */}
        <div className={`h-1 w-full ${activo ? `rayado ${tono.texto}` : 'bg-base-600/40'}`} aria-hidden="true">
          <div
            className={`h-full transition-[width] duration-200 ease-linear ${activo ? 'bg-ok' : 'w-0'}`}
            style={{ width: activo ? `${progreso}%` : 0 }}
          />
        </div>

        {/* Bitácora. Es la misma que se escribe en la consola del sitio:
            un simulacro sin registro no deja nada que revisar después. */}
        {/* Alto fijo desde que nace: si creciera línea a línea, el panel
            recién traído a la vista se iría saliendo por abajo. */}
        <div className="h-52 overflow-y-auto p-4 font-mono text-xs leading-relaxed">
          {registro.map((l) => (
            <p key={l.id} className="flex gap-3">
              <span className="shrink-0 text-slate-600">{reloj(l.ts)}</span>
              <span className={NIVEL[l.nivel] ?? 'text-slate-400'}>{textoDe(l)}</span>
            </p>
          ))}
        </div>
      </div>
      )}
    </Bloque>
  )
}
