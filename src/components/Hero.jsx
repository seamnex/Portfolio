import { useState } from 'react'
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, Download, FlaskConical, Languages, Linkedin, MapPin, Github } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useVista } from '../navegacion/VistaProvider'
import { useEstado } from '../estado/EstadoProvider'
import { useCaos } from '../caos/CaosProvider'
import { MEDIDAS, num } from '../data/medidas.js'
import StatusBadge from './ui/StatusBadge'
import CopyButton from './ui/CopyButton'
import Sigla from './ui/Sigla'

// Color del punto de estado según el agregado del panel. Solo existe para
// los estados con dato: lo que no se pudo verificar no lleva punto, y
// nunca un verde por defecto.
const PUNTO = {
  ok: 'bg-ok',
  respaldo: 'bg-ok',
  degradado: 'bg-warn',
  caido: 'bg-crit',
}

// Estados con un dato verificado detrás. Fuera de estos (cargando o sin
// verificar) el punto no se dibuja: gris en la portada se lee como "algo
// anda mal" y no dice nada.
const CON_DATO = { ok: 1, respaldo: 1, degradado: 1, caido: 1 }

/** El estado agregado del panel, con el simulacro por encima del real. */
function useEstadoPanel() {
  const { hero, ui } = useContenido()
  const { agregado } = useEstado()
  const { activo: simulacro } = useCaos()
  return {
    estado: simulacro ? 'degradado' : agregado,
    texto: simulacro ? hero.panel.simulacroActivo : ui.estado.banner[agregado],
  }
}

/**
 * Anticipo del panel para el teléfono. Abajo de `lg` el panel queda debajo
 * del pliegue, y es justo el diferencial: esta tira lo trae a la primera
 * pantalla con el hallazgo, y lleva hasta él.
 */
function TiraVivo() {
  const { hero } = useContenido()
  const { estado } = useEstadoPanel()
  const conDato = estado in CON_DATO

  return (
    <a
      href="#panel-vivo"
      onClick={(e) => {
        e.preventDefault()
        document.getElementById('panel-vivo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
      className="mt-5 flex min-h-[44px] items-center gap-3 rounded-lg border border-base-600 bg-base-800/50 px-4 py-2.5 text-[13px] text-slate-400 transition-colors hover:border-accent/50 lg:hidden"
    >
      {conDato && <span className={`h-2 w-2 shrink-0 rounded-full ${PUNTO[estado]}`} aria-hidden="true" />}
      <span className="flex-1 text-slate-200">
        {hero.panel.tira}
        <span className="sr-only"> · {hero.panel.tiraAria}</span>
      </span>
      <ArrowDown size={15} className="shrink-0 text-accent" aria-hidden="true" />
    </a>
  )
}

/**
 * La columna derecha de la portada: el sitio mostrándose a sí mismo.
 *
 * Antes era una terminal decorativa con un comando inventado y una grilla
 * de métricas de plantilla. Ahora es la prueba: el estado real del sitio
 * consultado desde el navegador de quien mira, el MTTD medido en el lab
 * con su bitácora, y las dos puertas a lo que un PDF no puede mostrar.
 */
function PanelVivo() {
  const { hero, lang, labMetrics } = useContenido()
  const { irA } = useVista()
  const { estado, texto: textoEstado } = useEstadoPanel()
  const p = hero.panel

  const bitacora = labMetrics.items.find((m) => m.id === 'mttd')?.repo

  return (
    <div id="panel-vivo" className="card scroll-mt-24 p-6 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-white">{p.titulo}</p>
        <p className="flex items-center gap-2 text-[13px] text-slate-400" aria-live="polite">
          {estado in CON_DATO && <span className={`h-2 w-2 shrink-0 rounded-full ${PUNTO[estado]}`} aria-hidden="true" />}
          {textoEstado}
        </p>
      </div>

      <div className="mt-5 border-t border-base-600 pt-5">
        {/* El hallazgo es el titular; el MTTD queda abajo como dato. */}
        <p className="text-[13px] text-slate-400">{p.hallazgoEtiqueta}</p>
        <p className="mt-2 text-balance text-2xl font-bold leading-tight tracking-tight text-white sm:text-[1.7rem]">
          {p.hallazgo}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-400">{p.mttdTexto}</p>
        <p className="mt-4 flex flex-wrap items-baseline gap-x-2 text-[13px] text-slate-400">
          <Sigla id="mttd">MTTD</Sigla>
          <span className="text-xl font-semibold tabular-nums text-white">{num(MEDIDAS.mttd, lang)} s</span>
          <span>{p.mttdEtiqueta}</span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5">
          <a
            href="#hallazgo"
            onClick={(e) => {
              e.preventDefault()
              irA(null, 'hallazgo')
            }}
            className="inline-flex items-center gap-1.5 py-1.5 text-[13px] font-medium text-accent transition-colors hover:text-white"
          >
            {p.diagnostico} <ArrowRight size={14} aria-hidden="true" />
          </a>
          {bitacora && (
            <a
              href={bitacora}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 py-1.5 text-[13px] font-medium text-slate-400 transition-colors hover:text-white"
            >
              {p.bitacora} <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-2.5 border-t border-base-600 pt-5">
        {[
          { id: 'laboratorio', Icono: FlaskConical, ...p.simulacro },
          { id: 'observabilidad', Icono: Activity, ...p.tablero },
        ].map(({ id, Icono, titulo, texto }) => (
          <button
            key={id}
            type="button"
            onClick={() => irA(id)}
            className="group flex w-full items-center gap-3.5 rounded-lg border border-base-600 bg-base-800/50 px-4 py-3 text-left transition-colors duration-200 hover:border-accent/50 hover:bg-base-700/70"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-accent/30 bg-base-900 text-accent">
              <Icono size={16} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-semibold text-white">{titulo}</span>
              <span className="block text-[13px] leading-snug text-slate-400">{texto}</span>
            </span>
            <ArrowRight
              size={16}
              className="shrink-0 text-slate-500 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  const { hero, metrics, profile, ui } = useContenido()
  const [subtituloEntero, setSubtituloEntero] = useState(false)

  return (
    <section id="inicio" className="relative z-10 overflow-hidden pb-10 pt-28 sm:pb-14 sm:pt-36">
      <div className="container-x">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          {/* Columna izquierda — mensaje */}
          <div className="animate-fade-up">
            <StatusBadge texto={profile.disponibilidad} tone="ok" />

            {/* El nombre es el h1: quien llega desde un link de LinkedIn o
                el mail de un reclutador tiene que saber de quién es esto en
                el primer segundo. El eslogan va debajo, como tesis. */}
            <h1 className="mt-7 text-5xl font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl">
              {profile.alias}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-sm text-slate-400">
              <span>{profile.rol}</span>
              <ArrowRight size={14} className="text-slate-500" aria-hidden="true" />
              <span className="sr-only">{hero.transicion}</span>
              <span className="text-accent">{profile.target}</span>
            </p>

            {/* Lo que antes era una grilla de cuatro tarjetas: una línea.
                Son credenciales, no la prueba; la prueba está a la derecha. */}
            <p className="mt-3 text-[14px] text-slate-400">{metrics.map((m) => m.corto).join(" · ")}</p>

            <TiraVivo />

            <p className="mt-6 text-balance text-2xl font-semibold leading-snug tracking-tight text-slate-200 sm:text-[1.7rem]">
              {hero.headline[0]} <span className="text-accent">{hero.headline[1]}</span>
            </p>

            {/* En el teléfono arranca en dos líneas para que la tira y los
                botones entren en la primera pantalla; desde `lg` va entero. */}
            <p
              id="hero-subtitulo"
              className={`mt-4 max-w-xl text-base leading-relaxed text-slate-400 lg:line-clamp-none ${
                subtituloEntero ? '' : 'line-clamp-2'
              }`}
            >
              {hero.subtitle}
            </p>
            {!subtituloEntero && (
              <button
                type="button"
                aria-expanded="false"
                aria-controls="hero-subtitulo"
                onClick={() => setSubtituloEntero(true)}
                className="mt-1 py-1.5 text-[13px] font-medium text-accent transition-colors hover:text-white lg:hidden"
              >
                {hero.seguirLeyendo}
              </button>
            )}

            {/* El par principal es CV y contacto: es lo que viene a hacer
                un reclutador. Al laboratorio se llega desde el panel. */}
            <div className="mt-8 flex flex-wrap gap-3">
              {/* `download` con nombre explícito: el archivo servido se llama
                  cv-…-sre.pdf, pero en la carpeta de descargas de un reclutador
                  conviene que se llame por la persona y el rol. */}
              <a href={profile.cv} download={profile.cvArchivo} className="btn-primary">
                <Download size={16} /> {ui.acciones.descargarCV}
              </a>
              <a href="#contacto" className="btn-outline">
                {ui.acciones.contactar} <ArrowRight size={16} />
              </a>
            </div>

            {/* LinkedIn y GitHub solo abajo de `lg`: desde ahí ya están en la barra. */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {profile.ubicacion}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages size={13} /> {profile.idiomas}
              </span>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 py-1.5 transition-colors hover:text-accent lg:hidden"
              >
                <Linkedin size={13} /> LinkedIn
              </a>
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 py-1.5 transition-colors hover:text-accent lg:hidden"
                >
                  <Github size={13} /> GitHub
                </a>
              )}
              <CopyButton value={profile.email} label={profile.email} />
            </div>
          </div>

          {/* Columna derecha — el sitio en vivo */}
          <div className="animate-fade-up [animation-delay:120ms]">
            <PanelVivo />
          </div>
        </div>
      </div>
    </section>
  )
}
