import { useCallback, useEffect, useRef, useState } from 'react'
import { CornerDownLeft, Eraser, Info, TerminalSquare } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useEstado } from '../estado/EstadoProvider'
import { useCaos } from '../caos/CaosProvider'
import { usePostMortem } from '../postmortem/PostMortemProvider'
import { COMANDOS, ejecutar } from '../lib/comandos'
import { reloj } from '../lib/caos.js'
import Section from './ui/Section'

const TONO = {
  ok: 'text-ok',
  accent: 'text-accent',
  crit: 'text-crit',
  warn: 'text-warn',
  muted: 'text-slate-600',
}

function Linea({ linea }) {
  const color = TONO[linea.tone] ?? 'text-slate-400'

  switch (linea.t) {
    case 'titulo':
      return <p className="mt-1 font-semibold text-white">{linea.texto}</p>

    case 'kv':
      return (
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 border-b border-base-600/30 py-1">
          <span className="text-slate-500">{linea.k}</span>
          <span className={`text-right ${color}`}>{linea.v}</span>
        </div>
      )

    case 'link':
      return (
        <a
          href={linea.href}
          target={linea.href.startsWith('mailto:') ? undefined : '_blank'}
          rel="noreferrer noopener"
          className="block truncate whitespace-pre text-accent underline decoration-accent/30 underline-offset-2 hover:decoration-accent"
        >
          {linea.texto}
        </a>
      )

    case 'raw':
      // `whitespace-pre` es lo que hace que las tablas de kubectl y el JSON
      // conserven su alineación; sin eso el navegador colapsa los espacios y
      // la salida deja de parecer una salida.
      return <p className={`overflow-x-auto whitespace-pre ${color}`}>{linea.texto || ' '}</p>

    default:
      return <p className={`whitespace-pre-wrap ${color}`}>{linea.texto || ' '}</p>
  }
}

export default function Console() {
  const contenido = useContenido()
  const { ui, lang, cambiar } = contenido
  const estado = useEstado()
  const caos = useCaos()
  const { abrir } = usePostMortem()

  const [entradas, setEntradas] = useState([])
  const [valor, setValor] = useState('')
  // Historial de comandos tipeados, del más viejo al más nuevo. `cursor === null`
  // significa "estoy escribiendo algo nuevo", que es distinto de estar parado en
  // la última entrada: sin esa distinción, ↓ no puede devolver el borrador.
  const [historial, setHistorial] = useState([])
  const [cursor, setCursor] = useState(null)

  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  // Autoscroll solo dentro del panel. Un `scrollIntoView` acá arrastraría la
  // página entera cada vez que alguien tipea, que es exactamente lo que no se
  // quiere de un componente embebido en medio del sitio.
  useEffect(() => {
    const caja = scrollRef.current
    if (caja) caja.scrollTop = caja.scrollHeight
  }, [entradas])

  const correr = useCallback(
    (entrada) => {
      const { lineas, accion } = ejecutar(entrada, { ui, lang, contenido, estado, caos })

      if (accion?.tipo === 'limpiar') {
        setEntradas([])
      } else {
        setEntradas((prev) => [...prev, { comando: entrada, lineas }])
      }

      switch (accion?.tipo) {
        case 'abrir-postmortem':
          abrir(accion.id)
          break
        case 'cambiar-idioma':
          cambiar(accion.lang)
          break
        case 'inyectar-caos':
          caos.inyectar(accion.escenario)
          break
        case 'restaurar-caos':
          caos.restaurar()
          break
        case 'descargar-cv': {
          // Mismo camino que el botón del hero: un <a download> temporal. El
          // navegador decide si lo baja o lo abre, y eso está bien.
          const a = document.createElement('a')
          a.href = contenido.profile.cv
          a.download = contenido.profile.cvArchivo
          document.body.appendChild(a)
          a.click()
          a.remove()
          break
        }
        default:
          break
      }
    },
    [ui, lang, contenido, estado, caos, abrir, cambiar],
  )

  // ── Bitácora del sandbox de caos ───────────────────────────
  // Las fases de un simulacro se escriben acá aunque se haya disparado desde
  // el panel de más arriba: si los logs quedaran solo en el panel, la consola
  // mostraría un `status` en rojo sin nada que explique por qué.
  //
  // Se lleva el id de la última línea impresa y no un contador: el registro
  // del proveedor tiene tope y descarta las viejas, así que su longitud no
  // crece indefinidamente y un contador terminaría dando por impresas líneas
  // que nunca llegaron a la pantalla.
  const ultimaImpresa = useRef(null)
  useEffect(() => {
    const registro = caos.registro
    if (!registro.length) {
      ultimaImpresa.current = null
      return
    }

    const desde = ultimaImpresa.current
      ? registro.findIndex((l) => l.id === ultimaImpresa.current) + 1
      : 0
    // findIndex devuelve -1 si la línea ya se descartó por el tope; el +1 lo
    // convierte en 0, que es justo lo que se quiere: imprimir todo lo que hay.
    const nuevas = registro.slice(desde)
    if (!nuevas.length) return

    ultimaImpresa.current = registro.at(-1).id
    setEntradas((prev) => [
      ...prev,
      {
        comando: null,
        lineas: nuevas.map((l) => ({ t: 'raw', texto: `[${reloj(l.ts)}] ${l.texto}`, tone: l.nivel })),
      },
    ])
  }, [caos.registro])

  const onSubmit = (e) => {
    e.preventDefault()
    const entrada = valor.trim()
    if (!entrada) return
    correr(entrada)
    setHistorial((prev) => (prev[prev.length - 1] === entrada ? prev : [...prev, entrada]))
    setCursor(null)
    setValor('')
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!historial.length) return
      const siguiente = cursor === null ? historial.length - 1 : Math.max(0, cursor - 1)
      setCursor(siguiente)
      setValor(historial[siguiente])
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (cursor === null) return
      const siguiente = cursor + 1
      if (siguiente >= historial.length) {
        setCursor(null)
        setValor('')
      } else {
        setCursor(siguiente)
        setValor(historial[siguiente])
      }
      return
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      const prefijo = valor.toLowerCase()
      if (!prefijo) return
      const candidatos = COMANDOS.filter((c) => c.startsWith(prefijo))
      if (candidatos.length === 1) {
        setValor(candidatos[0])
      } else if (candidatos.length > 1) {
        // Como en una shell de verdad: si hay ambigüedad, se listan las
        // opciones en vez de elegir una al azar.
        setEntradas((prev) => [
          ...prev,
          { comando: valor, lineas: [{ t: 'raw', texto: candidatos.map((c) => c.trim()).join('   '), tone: 'muted' }] },
        ])
      }
    }
  }

  return (
    <Section id="consola" label={ui.consola.label} titulo={ui.consola.titulo} bajada={ui.consola.bajada}>
      <div className="card overflow-hidden shadow-2xl shadow-black/40">
        {/* Barra de la ventana */}
        <div className="flex items-center gap-2 border-b border-base-600 bg-base-800/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-crit/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warn/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-ok/70" />
          <span className="ml-2 flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
            <TerminalSquare size={12} aria-hidden="true" />
            {ui.consola.titulobarra}
          </span>
          <button
            type="button"
            onClick={() => setEntradas([])}
            aria-label={ui.consola.limpiar}
            className="ml-auto rounded-md border border-base-600 p-1.5 text-slate-500 transition-colors hover:border-accent/40 hover:text-accent"
          >
            <Eraser size={12} />
          </button>
        </div>

        {/* Aviso: qué es real y qué es una reproducción */}
        <p className="flex items-start gap-2 border-b border-base-600/60 bg-warn/[0.04] px-4 py-2.5 text-[11.5px] leading-relaxed text-slate-500">
          <Info size={12} className="mt-0.5 shrink-0 text-warn/70" aria-hidden="true" />
          {ui.consola.aviso}
        </p>

        {/* Salida */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="h-[24rem] overflow-y-auto p-4 font-mono text-[12px] leading-relaxed sm:text-[12.5px]"
        >
          <p className="text-slate-600">{ui.consola.ayudaInicial}</p>

          {entradas.map((entrada, i) => (
            <div key={i} className="mt-3">
              {entrada.comando != null && (
                <p className="text-slate-500">
                  <span className="text-ok">{ui.consola.prompt}</span>{' '}
                  <span className="text-slate-300">{entrada.comando}</span>
                </p>
              )}
              <div className="mt-1">
                {entrada.lineas.map((linea, j) => (
                  <Linea key={j} linea={linea} />
                ))}
              </div>
            </div>
          ))}

          {/* Lo que se acaba de ejecutar tiene que llegarle a un lector de
              pantalla; el resto del scrollback ya se leyó cuando apareció. */}
          <span className="sr-only" aria-live="polite">
            {entradas.at(-1)?.lineas.map((l) => l.texto ?? `${l.k}: ${l.v}`).join('. ')}
          </span>
        </div>

        {/* Entrada */}
        <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-base-600 bg-base-900/50 px-4 py-3">
          <span className="shrink-0 font-mono text-[12.5px] text-ok">{ui.consola.prompt}</span>
          <input
            ref={inputRef}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label={ui.consola.focoAria}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-slate-200 outline-none placeholder:text-slate-700"
            placeholder="help"
          />
          <button
            type="submit"
            aria-label={ui.consola.ejecutar}
            className="shrink-0 rounded-md border border-base-600 p-1.5 text-slate-500 transition-colors hover:border-accent/40 hover:text-accent"
          >
            <CornerDownLeft size={13} />
          </button>
        </form>
      </div>
    </Section>
  )
}
