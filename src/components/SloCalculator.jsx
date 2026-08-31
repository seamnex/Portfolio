import { useEffect, useState } from 'react'
import { FlaskConical, Gauge, Info, Target, Timer } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useCaos } from '../caos/CaosProvider'
import { num } from '../data/medidas.js'
import {
  OBJETIVOS_SLO,
  PERIODOS,
  PERIODO_POR_DEFECTO,
  consumoDeSimulacros,
  estadoPresupuesto,
  formatearCaida,
  formatearObjetivo,
  periodoPorId,
  presupuesto,
} from '../lib/slo.js'
import Section from './ui/Section'

// Clases completas por el purge de Tailwind.
const NIVEL = {
  sano: { barra: 'bg-ok', texto: 'text-ok', borde: 'border-ok/30', fondo: 'bg-ok/[0.05]' },
  atencion: { barra: 'bg-warn', texto: 'text-warn', borde: 'border-warn/30', fondo: 'bg-warn/[0.05]' },
  critico: { barra: 'bg-warn', texto: 'text-warn', borde: 'border-warn/40', fondo: 'bg-warn/[0.07]' },
  agotado: { barra: 'bg-crit', texto: 'text-crit', borde: 'border-crit/40', fondo: 'bg-crit/[0.07]' },
}

export default function SloCalculator() {
  const { ui, lang } = useContenido()
  const t = ui.slo
  const { simulacros, activo: simulacroEnCurso } = useCaos()

  const [objetivo, setObjetivo] = useState(99.9)
  const [periodoId, setPeriodoId] = useState(PERIODO_POR_DEFECTO)

  // Mientras un simulacro corre, el consumo crece: sin este tick el panel
  // mostraría el mismo número durante los diez segundos y recién saltaría
  // al final, que es justo lo contrario de lo que un error budget enseña.
  const [, tick] = useState(0)
  useEffect(() => {
    if (!simulacroEnCurso) return undefined
    const t = setInterval(() => tick((v) => v + 1), 500)
    return () => clearInterval(t)
  }, [simulacroEnCurso])

  const periodo = periodoPorId(periodoId) ?? PERIODOS[2]
  // Sin memo a propósito: el simulacro abierto se cuenta hasta `Date.now()`,
  // así que el resultado depende del reloj y no solo de las dependencias.
  // Un `useMemo` acá devolvería el mismo número en cada tick, que es
  // exactamente el bug que el tick viene a evitar. Son cuatro entradas.
  const consumo = consumoDeSimulacros(simulacros)

  const presupuestoSegundos = presupuesto(objetivo, periodo.segundos)
  const budget = estadoPresupuesto(consumo.segundos, presupuestoSegundos)
  const tono = NIVEL[budget?.nivel ?? 'sano']
  const caida = (s) => formatearCaida(s, lang) ?? t.sinDatos

  return (
    <Section id="slo" label={t.label} titulo={t.titulo} bajada={t.bajada}>
      {/* ── Selector de objetivo ─────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-base-600 bg-base-800/70 px-5 py-3">
          <p className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
            <Target size={13} className="text-accent" aria-hidden="true" />
            {t.tablero}
          </p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.elegirObjetivo}>
            {OBJETIVOS_SLO.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setObjetivo(o)}
                aria-pressed={o === objetivo}
                className={`rounded-md border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                  o === objetivo
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-base-600 text-slate-500 hover:border-accent/40 hover:text-accent'
                }`}
              >
                {formatearObjetivo(o, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tabla: períodos × objetivos ──────────────────────
            Las cuatro columnas juntas y no solo la elegida: la pregunta
            real no es "cuánto permite 99,9" sino "cuánto cuesta el nueve
            que sigue", y eso solo se ve comparando. */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">{t.tablaAria}</caption>
            <thead>
              <tr className="border-b border-base-600/70">
                <th scope="col" className="px-5 py-3 font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">
                  {t.periodo}
                </th>
                {OBJETIVOS_SLO.map((o) => (
                  <th
                    key={o}
                    scope="col"
                    className={`px-4 py-3 text-right font-mono text-[10.5px] ${
                      o === objetivo ? 'bg-accent/[0.06] text-accent' : 'text-slate-500'
                    }`}
                  >
                    {formatearObjetivo(o, lang)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODOS.map((p) => (
                <tr key={p.id} className="border-b border-base-600/40 last:border-b-0">
                  <th
                    scope="row"
                    className="px-5 py-3 font-mono text-[11.5px] font-normal text-slate-400"
                  >
                    {t.periodos[p.id]}
                  </th>
                  {OBJETIVOS_SLO.map((o) => (
                    <td
                      key={o}
                      className={`px-4 py-3 text-right font-mono text-[11.5px] ${
                        o === objetivo ? 'bg-accent/[0.06] font-semibold text-accent' : 'text-slate-500'
                      }`}
                    >
                      {caida(presupuesto(o, p.segundos))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="flex items-start gap-2 border-t border-base-600/70 px-5 py-3 text-[11.5px] leading-relaxed text-slate-500">
          <Info size={13} className="mt-0.5 shrink-0 text-slate-600" aria-hidden="true" />
          {t.notaTabla}
        </p>
      </div>

      {/* ── Error budget consumido por los simulacros ────────── */}
      <div className={`card mt-5 overflow-hidden ${tono.borde} ${tono.fondo}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-base-600/70 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Gauge size={15} className={`shrink-0 ${tono.texto}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className={`font-mono text-[13px] font-semibold ${tono.texto}`} aria-live="polite">
                {t.niveles[budget?.nivel ?? 'sano']}
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] text-slate-600">
                {t.presupuestoDe(formatearObjetivo(objetivo, lang), t.periodos[periodo.id])}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t.elegirPeriodo}>
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodoId(p.id)}
                aria-pressed={p.id === periodoId}
                className={`rounded-md border px-2.5 py-1.5 font-mono text-[10.5px] transition-colors ${
                  p.id === periodoId
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-base-600 text-slate-500 hover:border-accent/40 hover:text-accent'
                }`}
              >
                {t.periodos[p.id]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-px bg-base-600/40 sm:grid-cols-3">
          <div className="bg-base-700/40 px-5 py-4">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">{t.tiles.presupuesto}</p>
            <p className="mt-2 font-mono text-[20px] font-bold leading-none tracking-tight text-slate-300">
              {caida(presupuestoSegundos)}
            </p>
          </div>
          <div className="bg-base-700/40 px-5 py-4">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">{t.tiles.consumido}</p>
            <p className={`mt-2 font-mono text-[20px] font-bold leading-none tracking-tight ${tono.texto}`}>
              {caida(consumo.segundos)}
            </p>
            <p className="mt-1.5 font-mono text-[10px] text-slate-600">
              {consumo.cantidad ? t.simulacrosCorridos(consumo.cantidad) : t.sinSimulacros}
            </p>
          </div>
          <div className="bg-base-700/40 px-5 py-4">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">{t.tiles.restante}</p>
            <p className="mt-2 font-mono text-[20px] font-bold leading-none tracking-tight text-slate-300">
              {budget ? caida(budget.restante) : t.sinDatos}
            </p>
            <p className="mt-1.5 font-mono text-[10px] text-slate-600">
              {budget ? t.porcentajeGastado(num(budget.porcentaje.toFixed(2), lang)) : ''}
            </p>
          </div>
        </div>

        {/* Barra del presupuesto */}
        <div className="px-5 pb-1 pt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-900/70" aria-hidden="true">
            <div
              className={`h-full rounded-full transition-[width] duration-300 ease-out ${tono.barra}`}
              style={{ width: `${Math.min(100, budget?.porcentaje ?? 0)}%` }}
            />
          </div>
        </div>

        {/* Desglose: caída contra degradación */}
        <div className="flex flex-wrap gap-x-6 gap-y-1.5 px-5 py-4 font-mono text-[10.5px] text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-crit" aria-hidden="true" />
            {t.desglose.caido(caida(consumo.caido))}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-warn" aria-hidden="true" />
            {t.desglose.degradado(caida(consumo.degradado))}
          </span>
          {consumo.enCurso > 0 && (
            <span className={`inline-flex items-center gap-1.5 ${tono.texto}`}>
              <Timer size={11} aria-hidden="true" />
              {t.desglose.enCurso}
            </span>
          )}
        </div>

        {/* La aclaración que hace honesto todo el panel */}
        <p className="flex items-start gap-2 border-t border-base-600/70 px-5 py-3 text-[11.5px] leading-relaxed text-slate-500">
          <FlaskConical size={13} className="mt-0.5 shrink-0 text-warn/70" aria-hidden="true" />
          {consumo.cantidad ? t.avisoConSimulacros : t.avisoSinSimulacros}
        </p>
      </div>
    </Section>
  )
}
