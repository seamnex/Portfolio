import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Crosshair,
  FileDown,
  FlaskConical,
  Lightbulb,
  Loader2,
  Search,
  Users,
  X,
} from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useAvisos } from '../avisos/AvisosProvider'

const SEVERIDAD = {
  P1: 'border-crit/40 bg-crit/10 text-crit',
  P2: 'border-warn/40 bg-warn/10 text-warn',
  P3: 'border-ok/40 bg-ok/10 text-ok',
  P4: 'border-accent/40 bg-accent/10 text-accent',
}

const TONO_TEXTO = {
  ok: 'text-ok',
  accent: 'text-accent',
  crit: 'text-crit',
  warn: 'text-warn',
  muted: 'text-slate-400',
}

const TONO_PUNTO = {
  ok: 'bg-ok',
  accent: 'bg-accent',
  crit: 'bg-crit',
  warn: 'bg-warn',
  muted: 'bg-slate-600',
}

// Los estados de acción correctiva llegan traducidos desde los datos, así que
// el color se elige por la forma del texto y no por una clave: 'Pendiente' /
// 'Pending' es lo único que se muestra distinto.
const esPendiente = (estado) => /^(pendiente|pending)$/i.test(estado)

function Campo({ etiqueta, valor }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-600">{etiqueta}</dt>
      <dd className="mt-1 text-[12.5px] leading-snug text-slate-300">{valor}</dd>
    </div>
  )
}

function Bloque({ icono: Icono, titulo, children }) {
  return (
    <section className="border-t border-base-600/70 px-6 py-6 sm:px-8">
      <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <Icono size={13} aria-hidden="true" />
        {titulo}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/**
 * Reporte de post-mortem en modal, con la estructura de un informe SRE:
 * cabecera de metadatos, línea de tiempo, causa raíz, impacto, acciones
 * correctivas y cierre. Se navega entre incidentes sin cerrar.
 */
export default function PostMortem({ incidente, posicion, onCerrar, onAnterior, onSiguiente }) {
  const { ui, lang, profile } = useContenido()
  const { avisar } = useAvisos()
  const [exportando, setExportando] = useState(false)
  const dialogo = useRef(null)
  const overlay = useRef(null)
  // Para devolver el foco a donde estaba: si el modal se abrió desde la
  // consola, el visitante estaba tipeando y perder el cursor ahí es molesto.
  const focoPrevio = useRef(null)

  useEffect(() => {
    focoPrevio.current = document.activeElement
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogo.current?.focus()

    return () => {
      document.body.style.overflow = anterior
      focoPrevio.current?.focus?.()
    }
  }, [])

  // Al navegar con ← → el componente no se remonta, así que el scroll se
  // quedaría donde estaba: en un informe largo, el siguiente arranca a la
  // vista por la mitad.
  useEffect(() => {
    overlay.current?.scrollTo({ top: 0 })
  }, [incidente.id])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'ArrowLeft') onAnterior()
      if (e.key === 'ArrowRight') onSiguiente()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCerrar, onAnterior, onSiguiente])

  const p = ui.postmortem

  // El PDF se arma en el navegador con el incidente que se está leyendo.
  // El módulo se carga recién acá: pdf-lib es más pesado que el sitio
  // entero y no tiene sentido que lo bajen los que nunca van a exportar.
  const exportar = async () => {
    if (exportando) return
    setExportando(true)
    try {
      const { construirPostMortem, descargar, nombreArchivo } = await import('../lib/postmortemPdf.js')
      const bytes = await construirPostMortem({ incidente, textos: p, autor: profile.nombre, lang })
      const archivo = nombreArchivo(incidente, lang)
      descargar(bytes, archivo)
      avisar({ estado: 'info', titulo: p.exportado(archivo), meta: incidente.codigo })
    } catch (err) {
      console.error('post-mortem → PDF', err)
      avisar({ estado: 'error', titulo: p.exportarError, meta: incidente.codigo })
    } finally {
      setExportando(false)
    }
  }

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-base-900/85 p-4 backdrop-blur-sm sm:p-8"
      // El backdrop cierra, pero solo si el click empezó y terminó en él:
      // arrastrar una selección de texto desde adentro no debería cerrar nada.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <article
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="postmortem-titulo"
        tabIndex={-1}
        className="card my-auto w-full max-w-3xl animate-fade-up overflow-hidden bg-base-800 shadow-2xl shadow-black/60 outline-none"
      >
        {/* Cabecera */}
        <header className="sticky top-0 z-10 border-b border-base-600 bg-base-800/95 px-6 py-5 backdrop-blur sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] tracking-wider text-slate-500">{incidente.codigo}</span>
                <span
                  className={`rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                    SEVERIDAD[incidente.severidad] ?? SEVERIDAD.P4
                  }`}
                >
                  {incidente.severidad}
                </span>
                <span className="pill">
                  <FlaskConical size={10} className="mr-1.5" aria-hidden="true" />
                  {incidente.lab}
                </span>
              </div>
              <h2 id="postmortem-titulo" className="mt-2.5 text-lg font-bold leading-snug text-white sm:text-xl">
                {incidente.titulo}
              </h2>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              aria-label={p.cerrar}
              className="shrink-0 rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-crit/40 hover:text-crit"
            >
              <X size={16} />
            </button>
          </div>
        </header>

        {/* Metadatos */}
        <dl className="grid gap-4 border-b border-base-600/70 bg-base-900/40 px-6 py-5 sm:grid-cols-3 sm:px-8">
          <Campo etiqueta={p.servicio} valor={incidente.servicio} />
          <Campo etiqueta={p.fecha} valor={incidente.fecha} />
          <Campo etiqueta={p.estado} valor={incidente.estado} />
          <Campo etiqueta={p.duracion} valor={incidente.duracion} />
          <Campo etiqueta={p.impactoUsuario} valor={incidente.impactoUsuario} />
          <Campo etiqueta={p.deteccion} valor={incidente.deteccion} />
        </dl>

        {/* Métricas del evento */}
        <div className="grid gap-3 px-6 py-6 sm:grid-cols-3 sm:px-8">
          {incidente.metricas.map((m) => (
            <div key={m.k} className="rounded-lg border border-base-600 bg-base-900/50 px-4 py-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-600">{m.k}</p>
              <p className={`mt-1 font-mono text-lg font-bold ${TONO_TEXTO[m.tone] ?? TONO_TEXTO.muted}`}>{m.v}</p>
            </div>
          ))}
        </div>

        <Bloque icono={Crosshair} titulo={p.resumenEjecutivo}>
          <p className="text-[13.5px] leading-relaxed text-slate-400">{incidente.resumen}</p>
        </Bloque>

        <Bloque icono={Clock} titulo={p.timeline}>
          <ol className="relative space-y-4 border-l border-base-600 pl-6">
            {incidente.timeline.map((paso, i) => (
              <li key={i} className="relative">
                <span
                  className={`absolute -left-[29px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-base-800 ${
                    TONO_PUNTO[paso.tone] ?? TONO_PUNTO.muted
                  }`}
                  aria-hidden="true"
                />
                <p className={`font-mono text-[11.5px] font-semibold ${TONO_TEXTO[paso.tone] ?? TONO_TEXTO.muted}`}>
                  {paso.t}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{paso.texto}</p>
              </li>
            ))}
          </ol>
        </Bloque>

        <Bloque icono={Search} titulo={p.causaRaiz}>
          <ul className="space-y-3">
            {incidente.causaRaiz.map((linea, i) => (
              <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-slate-400">
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-slate-600">{i + 1}.</span>
                {linea}
              </li>
            ))}
          </ul>
        </Bloque>

        <Bloque icono={Users} titulo={p.impacto}>
          <p className="text-[13px] leading-relaxed text-slate-400">{incidente.impacto}</p>
        </Bloque>

        <Bloque icono={ClipboardCheck} titulo={p.acciones}>
          <ul className="space-y-2.5">
            {incidente.acciones.map((a, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider ${
                    esPendiente(a.estado)
                      ? 'border-warn/30 bg-warn/10 text-warn'
                      : 'border-ok/30 bg-ok/10 text-ok'
                  }`}
                >
                  {a.estado}
                </span>
                <span className="text-[13px] leading-relaxed text-slate-400">{a.texto}</span>
              </li>
            ))}
          </ul>
        </Bloque>

        <Bloque icono={Lightbulb} titulo={p.leccion}>
          <p className="border-l-2 border-accent/40 pl-4 text-[13.5px] italic leading-relaxed text-slate-300">
            {incidente.leccion}
          </p>
        </Bloque>

        {/* Pie: navegación entre incidentes y salida a la bitácora real */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-base-600 bg-base-900/40 px-6 py-4 sm:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <button
              type="button"
              onClick={exportar}
              disabled={exportando}
              aria-busy={exportando}
              className="btn-ghost px-3.5 py-2 text-xs disabled:cursor-wait disabled:opacity-70"
            >
              {exportando ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" /> {p.exportando}
                </>
              ) : (
                <>
                  <FileDown size={14} aria-hidden="true" /> {p.exportar}
                </>
              )}
            </button>
            <a
              href={incidente.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 font-mono text-[11.5px] text-slate-400 transition-colors hover:text-accent"
            >
              {p.verBitacora}
              <ArrowUpRight size={13} />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10.5px] text-slate-600">
              {posicion.actual} / {posicion.total}
            </span>
            <button
              type="button"
              onClick={onAnterior}
              aria-label={p.anterior}
              className="rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={onSiguiente}
              aria-label={p.siguiente}
              className="rounded-md border border-base-600 p-2 text-slate-400 transition-colors hover:border-accent/40 hover:text-accent"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </article>
    </div>
  )
}
