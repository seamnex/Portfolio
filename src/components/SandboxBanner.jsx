import { Activity, ArrowRight, FlaskConical, Radar } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useCaos } from '../caos/CaosProvider'
import { usePlaybook } from '../playbooks/PlaybookProvider'
import { useVista } from '../navegacion/VistaProvider'

// ─────────────────────────────────────────────────────────────
//  El banner del sandbox: la puerta del laboratorio en la portada.
//
//  Es lo único que la vista de perfil dice sobre las otras dos, así que
//  enumera lo que hay del otro lado en vez de resumirlo en una frase: la
//  decisión de ir se toma leyendo qué hay, no leyendo un adjetivo.
//
//  Si algo quedó corriendo en el laboratorio —un simulacro con su cuenta
//  regresiva, un runbook abierto en el paso 3— lo dice. El estado
//  sobrevive al cambio de vista, y esconderlo sería mentir sobre lo que
//  el visitante va a encontrar cuando vuelva.
// ─────────────────────────────────────────────────────────────

const DESTINOS = [
  { id: 'observabilidad', icono: Activity },
  { id: 'laboratorio', icono: FlaskConical },
]

export default function SandboxBanner() {
  const { ui } = useContenido()
  const t = ui.sandbox
  const { irA } = useVista()

  const { activo: simulacro } = useCaos()
  const { activo: runbook } = usePlaybook()
  const vivo = Boolean(simulacro || runbook)

  return (
    <section id="sandbox" className="relative z-10 scroll-mt-24 py-20 sm:py-24">
      <div className="container-x">
        <div className="card overflow-hidden border-accent/30 bg-accent/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-base-600/70 bg-base-800/50 px-6 py-3.5">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              <Radar size={14} aria-hidden="true" />
              {t.etiqueta}
            </p>
            {vivo && (
              <span className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-wider text-warn">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-warn" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-warn" />
                </span>
                {t.vivo}
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{t.titulo}</h2>
            <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-slate-400">{t.texto}</p>

            {/* Las dos vistas del laboratorio, con los mismos rótulos que
                usan la barra y sus cabeceras: llegar no tiene que sorprender. */}
            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {DESTINOS.map((d) => {
                const texto = ui.vistas[d.id]
                const Icono = d.icono
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => irA(d.id)}
                      className="card card-hover flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-base-600 bg-base-900 text-accent">
                        <Icono size={16} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-semibold text-slate-200">
                          {texto.titulo}
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] text-slate-500">
                          {texto.resumen}
                        </span>
                      </span>
                      <ArrowRight size={15} className="shrink-0 text-slate-600" aria-hidden="true" />
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <button type="button" onClick={() => irA('observabilidad')} className="btn-primary">
                {t.abrir}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
              <span className="font-mono text-[11px] text-slate-600">{t.pie}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
