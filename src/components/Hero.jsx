import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, Download, FlaskConical, Languages, Linkedin, MapPin, Github, Play } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useVista } from '../navegacion/VistaProvider'
import { useEstado } from '../estado/EstadoProvider'
import { useCaos } from '../caos/CaosProvider'
import { useAvisos } from '../avisos/AvisosProvider'
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
 * El hallazgo dibujado: la corrida 1 del observability-lab en una línea.
 *
 * Dicho solo con palabras, "75 s para resolver la caída" se lee como
 * lentitud. Dibujado, se ve lo que pasó: la falla quedó cortada a los
 * 30 s y el resto fue mi instrumento confirmándolo. Las proporciones son
 * los marcadores crudos de la bitácora, sin redondear ni estirar.
 */
function LineaIncidente() {
  const { hero, lang } = useContenido()
  const l = hero.panel.linea
  const { mttd, corte, mttr } = MEDIDAS
  const pct = (v) => `${(v / mttr) * 100}%`
  const s = (v) => num(v, lang)
  const medicion = Math.round(MEDIDAS.ventanaInstrumento[0])

  const tramos = [
    { id: 'detectar', ancho: pct(mttd), barra: 'bg-warn', punto: 'bg-warn', rango: `0–${s(mttd)} s`, texto: l.detectar },
    { id: 'cortar', ancho: pct(corte - mttd), barra: 'bg-ok', punto: 'bg-ok', rango: `${s(mttd)}–${s(corte)} s`, texto: l.cortar },
    { id: 'medir', ancho: pct(mttr - corte), barra: 'rayado text-accent', punto: 'rayado text-accent', rango: `${s(corte)}–${s(mttr)} s`, texto: l.medir },
  ]

  return (
    <figure className="mt-5">
      <figcaption className="sr-only">{l.aria(s(mttd), s(corte), s(mttr))}</figcaption>
      <div aria-hidden="true">
        {/* La llave sobre el tramo que es el hallazgo: los mismos 45 s del titular. */}
        <div className="relative h-6" style={{ marginLeft: pct(corte) }}>
          <span className="absolute inset-x-0 top-0 text-center font-mono text-xs font-semibold leading-none text-accent">
            {medicion} s
          </span>
          <span className="absolute inset-x-0 bottom-1 h-1.5 rounded-t-[2px] border-x border-t border-accent/60" />
        </div>
        {/* Sin `gap`: con hueco entre tramos el flex los encoge y el tramo
            rayado ya no empieza donde marca la llave. El separador es un
            borde interno, que no corre las proporciones. */}
        <div className="flex h-3 animate-trazo overflow-hidden rounded-[3px]">
          {tramos.map((t, i) => (
            <span
              key={t.id}
              className={`h-full shrink-0 ${t.barra} ${i > 0 ? 'border-l-[3px] border-base-800' : ''}`}
              style={{ width: t.ancho }}
            />
          ))}
        </div>
        <div className="relative mt-1.5 h-4 font-mono text-xs tabular-nums text-slate-500">
          <span className="absolute left-0">0 s</span>
          <span className="absolute -translate-x-1/2" style={{ left: pct(corte) }}>{s(corte)} s</span>
          <span className="absolute right-0">{s(mttr)} s</span>
        </div>
        <ul className="mt-3 grid gap-1.5 text-[13px] leading-snug">
          {tramos.map((t) => (
            <li key={t.id} className={`flex items-baseline gap-2.5 ${t.id === 'medir' ? 'text-slate-100' : 'text-slate-400'}`}>
              <span className={`h-2 w-2 shrink-0 translate-y-[-1px] rounded-[2px] ${t.punto}`} />
              <span className="w-[5.5rem] shrink-0 font-mono text-xs tabular-nums text-slate-500">{t.rango}</span>
              <span>{t.texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

/** Una fila de acceso del panel: icono, título, una línea y la flecha. */
function Acceso({ Icono, titulo, texto, onClick, disabled = false, vivo = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group flex w-full items-center gap-3.5 rounded-lg border px-4 py-3 text-left transition-colors duration-200 disabled:cursor-default ${
        vivo
          ? 'border-warn/40 bg-warn/[0.05]'
          : 'border-base-600 bg-base-800/50 hover:border-accent/50 hover:bg-base-700/70'
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-base-900 ${
          vivo ? 'border-warn/40 text-warn' : 'border-accent/30 text-accent'
        }`}
      >
        <Icono size={16} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-white">{titulo}</span>
        <span className="block text-[13px] leading-snug text-slate-400" aria-live={vivo ? 'polite' : undefined}>
          {texto}
        </span>
      </span>
      {!vivo && (
        <ArrowRight
          size={16}
          className="shrink-0 text-slate-500 transition-[transform,color] duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
          aria-hidden="true"
        />
      )}
    </button>
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
/**
 * El simulacro contado dentro del panel, con el mismo dibujo que la línea
 * del lab: ámbar hasta que salta la alerta, verde mientras actúa el
 * runbook, rayado mientras se verifica. La barra avanza en tiempo real y,
 * al terminar, queda el resultado escrito. El alto es fijo en los tres
 * estados (reposo, en curso, terminado) para que la portada no salte.
 */
function Simulacro({ onInyectar }) {
  const { hero } = useContenido()
  const { irA } = useVista()
  const { activo, fase, terminaEn, autohealingMs, simulacros } = useCaos()
  const t = hero.panel.simulacro

  const ultimo = simulacros.at(-1)
  const terminado = !activo && ultimo?.fin != null
  const segundos = terminado ? Math.round((ultimo.fin - ultimo.inicio) / 1000) : null

  const mensaje = activo
    ? (t.fases[fase] ?? t.fases.inyeccion)
    : terminado
      ? ultimo.cerradoPor === 'auto-healing'
        ? t.recuperado(segundos)
        : t.restaurado
      : t.reposo

  return (
    <div className={`rounded-lg border transition-colors duration-300 ${activo ? 'border-warn/40 bg-warn/[0.04]' : 'border-base-600 bg-base-800/50'}`}>
      <button
        type="button"
        onClick={onInyectar}
        disabled={activo}
        className="group flex w-full items-center gap-3.5 px-4 pt-3 text-left disabled:cursor-default"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-base-900 transition-colors ${
            activo ? 'border-warn/40 text-warn' : 'border-accent/30 text-accent'
          }`}
        >
          <FlaskConical size={16} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold text-white">{t.titulo}</span>
        {/* Un "play" y no una flecha: esto ejecuta algo acá, no lleva a otra vista. */}
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            activo ? 'border-base-600 text-slate-600' : 'border-accent/40 text-accent group-hover:bg-accent group-hover:text-base-900'
          }`}
        >
          <Play size={13} aria-hidden="true" />
        </span>
      </button>

      <div className="px-4 pb-3 pt-3">
        <div
          role="img"
          aria-label={t.tramos}
          className="h-2 overflow-hidden rounded-[2px] bg-base-600/50"
        >
          {(activo || terminado) && (
            <div
              // La clave reinicia el avance en cada simulacro nuevo.
              key={activo ? terminaEn : 'fin'}
              className={`flex h-full ${activo ? 'animate-avance' : ''} ${terminado && ultimo.cerradoPor !== 'auto-healing' ? 'opacity-40' : ''}`}
              style={activo ? { animationDuration: `${autohealingMs}ms` } : undefined}
            >
              <span className="h-full w-[15%] shrink-0 bg-warn" />
              <span className="h-full w-[60%] shrink-0 border-l-2 border-base-800 bg-ok" />
              <span className="rayado h-full flex-1 border-l-2 border-base-800 text-accent" />
            </div>
          )}
        </div>
        <p className="mt-2 flex min-h-[2.5rem] flex-wrap items-center gap-x-2 text-[13px] leading-snug text-slate-400" aria-live="polite">
          <span className={terminado ? 'text-slate-200' : ''}>{mensaje}</span>
          {terminado && (
            <a
              href="#caos"
              onClick={(e) => {
                e.preventDefault()
                irA('laboratorio', 'caos')
              }}
              className="inline-flex items-center gap-1 font-medium text-accent transition-colors hover:text-white"
            >
              {t.verQuePaso} <ArrowRight size={13} aria-hidden="true" />
            </a>
          )}
        </p>
      </div>
    </div>
  )
}

/**
 * La columna derecha de la portada, en dos partes que no se mezclan:
 * arriba, un caso medido en el lab (con su bitácora); abajo, este sitio
 * ahora mismo: su estado real y un simulacro que corre acá adentro.
 */
function PanelVivo() {
  const { hero, lang, labMetrics } = useContenido()
  const { irA } = useVista()
  const { estado, texto: textoEstado } = useEstadoPanel()
  const { inyectar } = useCaos()
  const { setCaosEnPanel } = useAvisos()
  const p = hero.panel

  const bitacora = labMetrics.items.find((m) => m.id === 'mttd')?.repo

  // Con la parte en vivo a la vista, el simulacro se cuenta acá y el aviso
  // flotante se calla (ver AvisosProvider). Fuera de vista, vuelve.
  const enVivo = useRef(null)
  useEffect(() => {
    const nodo = enVivo.current
    if (!nodo || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(([e]) => setCaosEnPanel(e.isIntersecting), { threshold: 0.6 })
    obs.observe(nodo)
    return () => {
      obs.disconnect()
      setCaosEnPanel(false)
    }
  }, [setCaosEnPanel])

  return (
    <div id="panel-vivo" className="card scroll-mt-24 p-6 shadow-2xl shadow-black/50">
      {/* Filo de luz en el borde superior: el panel es la pieza de la
          portada y es la única tarjeta que lo lleva. */}
      <span
        className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        aria-hidden="true"
      />
      {/* ── Un caso del lab ─────────────────────────────────── */}
      <p className="text-[13px] text-slate-400">{p.hallazgoEtiqueta}</p>
      <p className="mt-2 text-balance text-2xl font-bold leading-[1.15] tracking-tight text-white sm:text-[2rem]">
        {p.hallazgo}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{p.mttdTexto}</p>
      <LineaIncidente />
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
            className="inline-flex items-center gap-1.5 py-1.5 text-[13px] font-medium text-accent transition-colors hover:text-white"
          >
            {p.bitacora} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </div>

      {/* ── Este sitio, ahora ───────────────────────────────── */}
      <div id="en-vivo" ref={enVivo} className="mt-5 scroll-mt-24 border-t border-base-600 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <p className="whitespace-nowrap text-sm font-semibold text-white">{p.titulo}</p>
          <p className="flex items-center gap-2 text-[13px] text-slate-400" aria-live="polite">
            {estado in CON_DATO && <span className={`h-2 w-2 shrink-0 rounded-full ${PUNTO[estado]}`} aria-hidden="true" />}
            {textoEstado}
          </p>
        </div>

        <div className="mt-4 grid gap-2.5">
          <Simulacro
            onInyectar={() => {
              inyectar('latency')
              // En el teléfono esta parte puede haber quedado a medias fuera
              // de vista: se la trae para que el simulacro se vea entero.
              if (window.matchMedia('(max-width: 1023px)').matches) {
                document.getElementById('en-vivo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
          />
          <Acceso Icono={Activity} titulo={p.tablero.titulo} texto={p.tablero.texto} onClick={() => irA('observabilidad')} />
          <a
            href="#caos"
            onClick={(e) => {
              e.preventDefault()
              irA('laboratorio')
            }}
            className="inline-flex min-h-[40px] items-center gap-1.5 self-start text-[13px] font-medium text-slate-400 transition-colors hover:text-white"
          >
            {p.simulacro.masSimulacros} <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
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
          <div className="entrada">
            <StatusBadge texto={profile.disponibilidad} tone="ok" />

            {/* El nombre es el h1: quien llega desde un link de LinkedIn o
                el mail de un reclutador tiene que saber de quién es esto en
                el primer segundo. El eslogan va debajo, como tesis. */}
            <h1 className="mt-7 text-5xl font-extrabold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl">
              {profile.alias}
            </h1>

            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-slate-400">
              <span>{profile.rol}</span>
              <ArrowRight size={14} className="text-slate-500" aria-hidden="true" />
              <span className="sr-only">{hero.transicion}</span>
              <span className="font-semibold text-slate-100">{profile.target}</span>
            </p>

            {/* Lo que antes era una grilla de cuatro tarjetas: una línea.
                Son credenciales, no la prueba; la prueba está a la derecha. */}
            <p className="mt-3 text-sm text-slate-400">{metrics.map((m) => m.corto).join(" · ")}</p>

            <TiraVivo />

            {/* El eslogan va como entrada del párrafo, no como un segundo
                titular: con el mismo cuerpo que el hallazgo del panel, el ojo
                rebotaba entre los dos. */}
            <p className="mt-7 text-balance text-lg font-semibold leading-snug text-white">
              {hero.headline[0]} {hero.headline[1]}
            </p>

            {/* En el teléfono arranca en dos líneas para que la tira y los
                botones entren en la primera pantalla; desde `lg` va entero. */}
            <p
              id="hero-subtitulo"
              className={`mt-2 max-w-xl text-base leading-relaxed text-slate-400 lg:line-clamp-none ${
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
          <div className="animate-fade-up [animation-delay:180ms]">
            <PanelVivo />
          </div>
        </div>
      </div>
    </section>
  )
}
