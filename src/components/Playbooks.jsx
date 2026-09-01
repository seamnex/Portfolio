import { Check, ChevronRight, Cpu, Database, MemoryStick, Play, RotateCcw, SquareTerminal, TriangleAlert, X } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { usePlaybook } from '../playbooks/PlaybookProvider'
import Bloque from './ui/Bloque'

const iconos = { MemoryStick, Cpu, Database }

// Clases completas por el purge de Tailwind, igual que en el resto del sitio.
const SEVERIDAD = {
  P1: { icono: 'border-crit/30 bg-crit/10 text-crit', pill: 'border-crit/30 text-crit' },
  P2: { icono: 'border-warn/30 bg-warn/10 text-warn', pill: 'border-warn/30 text-warn' },
}

/** Estado visual de cada paso en la lista. */
const PASO = {
  hecho: { punto: 'border-ok/40 bg-ok/15 text-ok', texto: 'text-slate-400', titulo: 'text-slate-300' },
  actual: { punto: 'border-accent/50 bg-accent/15 text-accent', texto: 'text-slate-300', titulo: 'text-white' },
  pendiente: { punto: 'border-base-600 bg-base-800 text-slate-600', texto: 'text-slate-600', titulo: 'text-slate-500' },
}

function TarjetaPlaybook({ playbook, texto, activo, onElegir, t }) {
  const Icono = iconos[playbook.icono]
  const tono = SEVERIDAD[playbook.severidad] ?? SEVERIDAD.P2

  return (
    <button
      type="button"
      onClick={() => onElegir(playbook.id)}
      aria-pressed={activo}
      className={`card group flex h-full flex-col p-5 text-left transition-all duration-200 ${
        activo ? 'border-accent/60 bg-accent/[0.05]' : 'text-slate-400 hover:-translate-y-0.5 hover:border-accent/50'
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg border ${tono.icono}`}>
          {Icono && <Icono size={15} />}
        </span>
        <span className={`pill font-mono text-[10px] ${tono.pill}`}>{playbook.severidad}</span>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-white">{texto.titulo}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{texto.descripcion}</p>

      <p className="mt-3 w-full overflow-x-auto whitespace-pre font-mono text-[10px] text-slate-600">
        {playbook.senal}
      </p>

      <span
        className={`mt-auto inline-flex items-center gap-1.5 pt-4 font-mono text-[11px] ${
          activo ? 'text-accent' : 'text-slate-500 transition-colors group-hover:text-accent'
        }`}
      >
        <Play size={11} />
        {activo ? t.abierto : t.abrir}
        <span className="text-slate-600">· {t.pasosCount(playbook.pasos.length)}</span>
      </span>
    </button>
  )
}

export default function Playbooks() {
  const { ui } = useContenido()
  const t = ui.playbooks
  const { playbooks, activo, paso, total, completado, iniciar, siguiente, reiniciar, cerrar } = usePlaybook()

  const texto = activo ? t.escenarios[activo.id] : null

  // Abrir un runbook y correr un paso escriben en la consola de más abajo.
  // Llevar la vista hasta ahí es parte de la acción: si la salida aparece
  // fuera de pantalla, el botón parece no haber hecho nada.
  const irAConsola = () => document.getElementById('consola')?.scrollIntoView({ block: 'start' })

  const elegir = (id) => {
    if (activo?.id === id) {
      irAConsola()
      return
    }
    iniciar(id)
  }

  const correrPaso = () => {
    siguiente()
    irAConsola()
  }

  return (
    <Bloque id="playbooks" label={t.label} titulo={t.titulo} bajada={t.bajada}>
      {/* El rótulo va antes de las tarjetas, no al pie: quien mira esto
          tiene que saber qué está viendo ANTES de leer una salida de
          kubectl y darla por una corrida registrada. */}
      <p className="mb-6 flex items-start gap-2.5 rounded-lg border border-warn/20 bg-warn/[0.05] px-4 py-3 text-[12.5px] leading-relaxed text-slate-400">
        <TriangleAlert size={14} className="mt-0.5 shrink-0 text-warn" aria-hidden="true" />
        {t.aviso}
      </p>

      <div className="grid gap-5 md:grid-cols-3">
        {playbooks.map((p) => (
          <TarjetaPlaybook
            key={p.id}
            playbook={p}
            texto={t.escenarios[p.id]}
            activo={activo?.id === p.id}
            onElegir={elegir}
            t={t}
          />
        ))}
      </div>

      {/* Command Center: el runbook abierto, paso por paso */}
      <div className={`card mt-5 overflow-hidden ${activo ? 'border-accent/40' : ''}`}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-base-600/70 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <SquareTerminal size={15} className={`shrink-0 ${activo ? 'text-accent' : 'text-slate-600'}`} aria-hidden="true" />
            <div className="min-w-0">
              <p className={`font-mono text-[13px] font-semibold ${activo ? 'text-accent' : 'text-slate-500'}`} aria-live="polite">
                {activo ? texto.titulo : t.sinPlaybook}
              </p>
              <p className="mt-0.5 font-mono text-[10.5px] text-slate-600">
                {activo
                  ? paso < 0
                    ? t.listoParaCorrer
                    : `${t.paso} ${paso + 1}/${total} · ${t.escenarios[activo.id].pasos[activo.pasos[paso].id].titulo}`
                  : t.sinPlaybookDetalle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={correrPaso}
              disabled={!activo || completado}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 font-mono text-[11px] text-accent transition-colors hover:border-accent/70 hover:bg-accent/15 disabled:opacity-40 disabled:hover:border-accent/40 disabled:hover:bg-accent/10"
            >
              {paso < 0 ? <Play size={12} /> : <ChevronRight size={12} />}
              {paso < 0 ? t.correrPrimero : completado ? t.finalizado : t.correrSiguiente}
            </button>
            <button
              type="button"
              onClick={reiniciar}
              disabled={!activo || paso < 0}
              aria-label={t.reiniciar}
              className="rounded-md border border-base-600 p-2 text-slate-500 transition-colors hover:border-warn/40 hover:text-warn disabled:opacity-40 disabled:hover:border-base-600 disabled:hover:text-slate-500"
            >
              <RotateCcw size={13} />
            </button>
            <button
              type="button"
              onClick={cerrar}
              disabled={!activo}
              aria-label={t.cerrar}
              className="rounded-md border border-base-600 p-2 text-slate-500 transition-colors hover:border-crit/40 hover:text-crit disabled:opacity-40 disabled:hover:border-base-600 disabled:hover:text-slate-500"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Barra de avance del runbook */}
        <div className="h-0.5 w-full bg-base-600/40" aria-hidden="true">
          <div
            className="h-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: activo ? `${((paso + 1) / total) * 100}%` : 0 }}
          />
        </div>

        {activo ? (
          <div className="p-5">
            <p className="mb-4 text-[12.5px] leading-relaxed text-slate-400">{texto.hipotesis}</p>
            <ol className="space-y-0">
              {activo.pasos.map((p, i) => {
                const estado = i <= paso ? 'hecho' : i === paso + 1 ? 'actual' : 'pendiente'
                const tono = PASO[estado]
                const tp = texto.pasos[p.id]
                return (
                  <li key={p.id} className="flex gap-3.5 pb-4 last:pb-0">
                    {/* Columna del hilo: punto y línea vertical */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${tono.punto}`}
                      >
                        {i <= paso ? <Check size={11} /> : i + 1}
                      </span>
                      {i < activo.pasos.length - 1 && (
                        <span className={`mt-1 w-px flex-1 ${i <= paso ? 'bg-ok/30' : 'bg-base-600/60'}`} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-semibold ${tono.titulo}`}>{tp.titulo}</p>
                      <p className={`mt-1 text-[12.5px] leading-relaxed ${tono.texto}`}>{tp.porQue}</p>
                      <p
                        className={`mt-2 overflow-x-auto whitespace-pre rounded border px-2.5 py-1.5 font-mono text-[10.5px] ${
                          i <= paso
                            ? 'border-base-600 bg-base-900/60 text-slate-400'
                            : 'border-base-600/50 bg-base-900/30 text-slate-600'
                        }`}
                      >
                        $ {p.comando}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>

            <p className="mt-2 flex items-center gap-2 border-t border-base-600/50 pt-4 font-mono text-[10.5px] text-slate-600">
              <SquareTerminal size={12} aria-hidden="true" />
              {completado ? t.completado : t.salidaEnConsola}
            </p>
          </div>
        ) : (
          <p className="px-5 py-8 text-center text-[12.5px] text-slate-600">{t.elegiUno}</p>
        )}
      </div>
    </Bloque>
  )
}
