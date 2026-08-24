import { useEffect, useRef } from 'react'
import { Activity, GitCommitHorizontal, Radio, Rocket, ShieldAlert, Timer } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useTelemetria } from '../telemetria/TelemetriaProvider'
import { useCaos } from '../caos/CaosProvider'
import { MEDIDAS, num } from '../data/medidas.js'
import { OBJETIVOS } from '../data/dora.js'
import { cadencia, cumple, formatearDuracion } from '../lib/dora.js'
import Section from './ui/Section'
import Sparkline from './ui/Sparkline'

const iconos = { Rocket, GitCommitHorizontal, ShieldAlert, Timer, Activity }

// Clases completas, por el purge de Tailwind: `text-${tone}` no sobrevive.
const tonos = {
  ok: { valor: 'text-ok', icono: 'border-ok/30 bg-ok/10 text-ok', borde: 'hover:border-ok/40' },
  accent: { valor: 'text-accent', icono: 'border-accent/30 bg-accent/10 text-accent', borde: 'hover:border-accent/40' },
  warn: { valor: 'text-warn', icono: 'border-warn/30 bg-warn/10 text-warn', borde: 'hover:border-warn/40' },
  crit: { valor: 'text-crit', icono: 'border-crit/30 bg-crit/10 text-crit', borde: 'hover:border-crit/40' },
  muted: { valor: 'text-slate-500', icono: 'border-base-600 bg-base-800 text-slate-500', borde: '' },
}

/**
 * Un tile del tablero: valor medido arriba, objetivo declarado abajo.
 *
 * La jerarquía tipográfica hace el mismo trabajo que la etiqueta: el
 * número grande es siempre el medido, y el objetivo va chico, en otra
 * fila y rotulado. Al revés —objetivo grande, medición al pie— es como se
 * arma un tablero DORA que miente sin escribir un solo número falso.
 */
function Tile({ icono, titulo, valor, unidad, tone = 'accent', detalle, objetivo, veredicto, serie, tipoSerie, t }) {
  const Icono = iconos[icono]
  const tono = tonos[valor == null ? 'muted' : tone] ?? tonos.accent

  return (
    <article className={`card flex h-full flex-col p-5 transition-colors ${tono.borde}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`flex h-7 w-7 items-center justify-center rounded-md border ${tono.icono}`}>
            {Icono && <Icono size={13} />}
          </span>
          <h3 className="font-mono text-[10.5px] uppercase leading-tight tracking-[0.14em] text-slate-400">
            {titulo}
          </h3>
        </div>
        {veredicto != null && (
          <span
            className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${
              veredicto ? 'border-ok/30 bg-ok/10 text-ok' : 'border-warn/30 bg-warn/10 text-warn'
            }`}
          >
            {veredicto ? t.cumple : t.noCumple}
          </span>
        )}
      </div>

      <p className="mt-4 flex items-baseline gap-1.5">
        <span className={`font-mono text-[27px] font-bold leading-none tracking-tight ${tono.valor}`}>
          {valor ?? t.sinDatos}
        </span>
        {valor != null && unidad && <span className="font-mono text-[12px] text-slate-500">{unidad}</span>}
      </p>

      <div className="mt-3">
        <Sparkline datos={serie} tone={valor == null ? 'muted' : tone} tipo={tipoSerie} etiqueta={titulo} />
      </div>

      <p className="mt-2 font-mono text-[10px] leading-relaxed text-slate-600">{detalle}</p>

      <div className="mt-auto flex items-baseline justify-between gap-2 border-t border-base-600/50 pt-3">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-slate-600">{t.objetivo}</span>
        <span className="font-mono text-[11px] text-slate-400">{objetivo}</span>
      </div>
    </article>
  )
}

export default function Telemetry() {
  const { ui, lang } = useContenido()
  const t = ui.telemetria
  const { dora, motivo, cargando, latencia, activarMuestreo, ventanaDias, repo } = useTelemetria()
  const { activo: simulacro } = useCaos()

  // El muestreo de latencia arranca cuando el panel entra en pantalla y se
  // corta cuando sale. Sin esto el sitio dispara una petición cada cuatro
  // segundos durante toda la visita para dibujar algo que nadie mira.
  const ref = useRef(null)
  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return undefined
    const obs = new IntersectionObserver(([e]) => activarMuestreo(e.isIntersecting), { threshold: 0.15 })
    obs.observe(nodo)
    return () => {
      obs.disconnect()
      activarMuestreo(false)
    }
  }, [activarMuestreo])

  const lt = dora?.leadTime ? formatearDuracion(dora.leadTime.valor, lang) : null
  const cad = dora ? cadencia(dora.despliegues.porDia) : null
  const sinFuente = !cargando && !dora
  const sinDato = t.motivo[motivo] ?? t.midiendo

  return (
    <Section id="telemetria" label={t.label} titulo={t.titulo} bajada={t.bajada}>
      <div ref={ref} className="card overflow-hidden">
        {/* Cabecera de tablero: qué se está mirando y sobre qué ventana */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-base-600 bg-base-800/70 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-ok" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            <span className="font-mono text-[11px] text-slate-300">{t.tablero}</span>
            <span className="pill">{t.ventana(ventanaDias)}</span>
          </div>
          <span className="truncate font-mono text-[10.5px] text-slate-600">
            {t.fuenteActions} · {repo}
          </span>
        </div>

        {simulacro && (
          // El simulacro no toca estos números y conviene decirlo justo acá:
          // alguien que acaba de inyectar un fallo espera ver el tablero en
          // rojo, y el silencio se leería como que el tablero está roto.
          <p className="border-b border-warn/20 bg-warn/[0.06] px-5 py-2 font-mono text-[10.5px] text-warn">
            {t.duranteSimulacro}
          </p>
        )}

        <div className="grid gap-px bg-base-600/40 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-base-700/40 p-1">
            <Tile
              t={t}
              icono="Rocket"
              titulo={t.tiles.despliegues}
              valor={dora ? dora.despliegues.valor : null}
              unidad={t.unidades.despliegues(ventanaDias)}
              tone={cumple(dora?.despliegues.valor, OBJETIVOS.despliegues) ? 'ok' : 'accent'}
              veredicto={cumple(dora?.despliegues.valor, OBJETIVOS.despliegues)}
              detalle={
                dora
                  ? `${t.cadencia[cad] ?? ''} · ${t.corridasVerdes(dora.despliegues.muestras)}`
                  : sinDato
              }
              objetivo={OBJETIVOS.despliegues.etiqueta}
              serie={dora?.despliegues.serie}
              tipoSerie="barras"
            />
          </div>

          <div className="bg-base-700/40 p-1">
            <Tile
              t={t}
              icono="GitCommitHorizontal"
              titulo={t.tiles.leadTime}
              valor={lt?.valor ?? null}
              unidad={lt?.unidad}
              tone={cumple(dora?.leadTime?.valor, OBJETIVOS.leadTime) ? 'ok' : 'warn'}
              veredicto={cumple(dora?.leadTime?.valor, OBJETIVOS.leadTime)}
              detalle={dora?.leadTime ? t.medianaDe(dora.leadTime.muestras) : sinDato}
              objetivo={OBJETIVOS.leadTime.etiqueta}
              serie={dora?.leadTime?.serie}
            />
          </div>

          <div className="bg-base-700/40 p-1">
            <Tile
              t={t}
              icono="ShieldAlert"
              titulo={t.tiles.cfr}
              valor={dora?.cfr ? num(dora.cfr.valor.toFixed(1), lang) : null}
              unidad="%"
              tone={cumple(dora?.cfr?.valor, OBJETIVOS.cfr) ? 'ok' : 'crit'}
              veredicto={cumple(dora?.cfr?.valor, OBJETIVOS.cfr)}
              detalle={dora?.cfr ? t.fallidasDe(dora.cfr.fallidas, dora.cfr.muestras) : sinDato}
              objetivo={OBJETIVOS.cfr.etiqueta}
              serie={dora?.cfr?.serie}
              tipoSerie="barras"
            />
          </div>

          <div className="bg-base-700/40 p-1">
            <Tile
              t={t}
              icono="Timer"
              titulo={t.tiles.mttd}
              valor={num(MEDIDAS.mttd, lang)}
              unidad="s"
              tone="accent"
              veredicto={cumple(MEDIDAS.mttd, OBJETIVOS.mttd)}
              // Dos barras: la regla por defecto y la sensible. Son las dos
              // corridas que efectivamente se midieron en el lab, no una serie.
              serie={[MEDIDAS.mttd, MEDIDAS.mttdSensible]}
              tipoSerie="barras"
              detalle={t.mttdDetalle(MEDIDAS.ventanaSegundos, MEDIDAS.umbralPorcentaje)}
              objetivo={OBJETIVOS.mttd.etiqueta}
            />
          </div>

          <div className="bg-base-700/40 p-1">
            <Tile
              t={t}
              icono="Activity"
              titulo={t.tiles.p95}
              valor={latencia.p95 != null ? num(latencia.p95.toFixed(1), lang) : null}
              unidad="ms"
              tone="accent"
              detalle={latencia.n ? t.muestras(latencia.n) : t.midiendo}
              objetivo={latencia.p50 != null ? `p50 ${num(latencia.p50.toFixed(1), lang)} ms` : t.sinDatos}
              serie={latencia.muestras}
            />
          </div>

          <div className="bg-base-700/40 p-1">
            {/* Sexta celda: el pie del tablero. Explica de dónde sale cada
                cosa, que es lo que hace verificable a las otras cinco. */}
            <div className="flex h-full flex-col justify-center gap-2.5 rounded-lg border border-base-600/60 bg-base-800/40 p-5">
              <p className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent">
                <Radio size={12} /> {t.comoSeMide}
              </p>
              <p className="text-[12px] leading-relaxed text-slate-500">{t.aviso}</p>
              {sinFuente && <p className="font-mono text-[10.5px] text-warn">{sinDato}</p>}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
