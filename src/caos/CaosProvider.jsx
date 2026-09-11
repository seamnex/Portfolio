import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AUTOHEALING_MS, FASES, escenarioPorId, lineaDeFase } from '../lib/caos.js'
import { useContenido } from '../i18n/LanguageProvider'
import { useAvisos } from '../avisos/AvisosProvider'

// Qué aviso flotante dispara cada fase, en el vocabulario de una
// herramienta de on-call. La inyección no avisa: la alerta salta en la
// detección, y ese segundo y medio de silencio es el MTTD que el simulacro
// quiere mostrar. El diagnóstico "toma" el incidente (ACKNOWLEDGED), la
// remediación actualiza esa misma tarjeta, y la recuperación la resuelve.
const AVISO_POR_FASE = {
  deteccion: { estado: 'triggered', texto: 'triggered' },
  diagnostico: { estado: 'acknowledged', texto: 'acknowledged' },
  remediacion: { estado: 'acknowledged', texto: 'remediando' },
  recuperado: { estado: 'resolved', texto: 'resolved' },
}

// ─────────────────────────────────────────────────────────────
//  Estado del sandbox de chaos engineering.
//
//  Vive aparte de EstadoProvider a propósito. Ese proveedor solo tiene
//  hechos verificados contra la red; si le metiéramos adentro un
//  escenario inventado, el día que alguien lea ese archivo ya no va a
//  poder distinguir de un vistazo qué se midió y qué se simuló. Acá el
//  simulacro está declarado desde el nombre del directorio.
//
//  Quien quiera el estado "como se ve en pantalla" —panel y consola—
//  compone los dos: `useEstado()` para lo real, `useCaos()` para el
//  simulacro encima.
// ─────────────────────────────────────────────────────────────
const CaosContext = createContext(null)

/** Cuántas líneas de bitácora se conservan antes de descartar las viejas. */
const REGISTRO_MAX = 60

export function CaosProvider({ children }) {
  const { ui } = useContenido()
  const { avisar } = useAvisos()

  // Un aviso por escenario, con clave fija: la tarjeta pasa de TRIGGERED
  // a ACKNOWLEDGED a RESOLVED en el mismo lugar, como en PagerDuty.
  const avisarFase = useCallback(
    (escenarioActivo, { estado, texto }) => {
      const { titulo, detalle } = ui.avisos.caos[texto](escenarioActivo)
      avisar({
        estado,
        clave: `caos:${escenarioActivo.id}`,
        severidad: escenarioActivo.severidad,
        titulo,
        detalle,
        meta: ui.avisos.caos.meta(escenarioActivo),
      })
    },
    [avisar, ui],
  )

  const [escenario, setEscenario] = useState(null)
  const [fase, setFase] = useState(null)
  const [terminaEn, setTerminaEn] = useState(null)
  const [registro, setRegistro] = useState([])
  // Contabilidad de simulacros de la sesión: cuándo empezó cada uno,
  // cuándo se cerró y cómo. Es lo que consume el error budget del
  // calculador de SLO, y son segundos de reloj de verdad —lo simulado es
  // el incidente, no la duración—, así que se guardan sin redondear.
  const [simulacros, setSimulacros] = useState([])

  // Los timeouts de las fases se guardan para poder cancelarlos: si alguien
  // restaura a mano en el segundo 3, las fases 4 y 5 no tienen que dispararse
  // igual y contar una recuperación que nadie esperó.
  const timers = useRef([])
  const limpiarTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  // Al desmontar (o en un hot reload) no puede quedar un timeout vivo
  // llamando a setState sobre un componente que ya no existe.
  useEffect(() => limpiarTimers, [limpiarTimers])

  const anotar = useCallback((linea) => {
    setRegistro((prev) => [...prev, linea].slice(-REGISTRO_MAX))
  }, [])

  /**
   * Cierra el simulacro que esté abierto, si hay alguno.
   *
   * Se guarda el motivo del cierre porque los tres no son lo mismo: el
   * auto-healing cerró el ciclo solo, la restauración manual lo cortó
   * antes, y la reinyección lo pisó con otro escenario.
   */
  const cerrarSimulacro = useCallback((cerradoPor) => {
    setSimulacros((prev) => {
      const abierto = prev.findIndex((s) => s.fin == null)
      if (abierto < 0) return prev
      const copia = [...prev]
      copia[abierto] = { ...copia[abierto], fin: Date.now(), cerradoPor }
      return copia
    })
  }, [])

  // El escenario activo también en un ref: `restaurar` necesita saber cuál
  // era para anotarlo y avisar, y hacerlo dentro del updater de
  // `setEscenario` sería disparar el estado de otro proveedor (los
  // avisos) en mitad de un render. El ref se actualiza en el mismo lugar
  // que el estado, así que nunca van desfasados.
  const escenarioRef = useRef(null)
  const fijarEscenario = useCallback((valor) => {
    escenarioRef.current = valor
    setEscenario(valor)
  }, [])

  const restaurar = useCallback(
    ({ anunciar = true } = {}) => {
      limpiarTimers()
      cerrarSimulacro('manual')
      const activo = escenarioRef.current
      fijarEscenario(null)
      setFase(null)
      setTerminaEn(null)
      if (activo && anunciar) {
        anotar({
          id: `${activo.id}:manual:${Date.now()}`,
          ts: Date.now(),
          fase: 'restaurado',
          nivel: 'ok',
          escenario: activo.id,
          texto: ui.caos.fases.restaurado(activo, ui),
        })
        avisarFase(activo, { estado: 'resolved', texto: 'restaurado' })
      }
    },
    [anotar, avisarFase, cerrarSimulacro, fijarEscenario, limpiarTimers, ui],
  )

  /**
   * Inyecta un fallo. Devuelve `false` si el id no existe, para que la
   * consola pueda contestar "no existe ese escenario" en vez de quedarse
   * callada como si hubiera hecho algo.
   */
  const inyectar = useCallback(
    (id) => {
      const elegido = escenarioPorId(id)
      if (!elegido) return false

      // Reinyectar sobre un simulacro en curso reinicia el ciclo entero:
      // dos escenarios superpuestos darían un panel imposible de leer.
      limpiarTimers()
      cerrarSimulacro('reinyeccion')
      const previo = escenarioRef.current
      if (previo && previo.id !== elegido.id) avisarFase(previo, { estado: 'resolved', texto: 'reinyectado' })
      const inicio = Date.now()
      fijarEscenario(elegido)
      setTerminaEn(inicio + AUTOHEALING_MS)
      setSimulacros((prev) => [
        ...prev,
        { id: `${elegido.id}:${inicio}`, escenario: elegido.id, impacto: elegido.impacto, inicio, fin: null },
      ])

      FASES.forEach((f) => {
        const disparar = () => {
          setFase(f.id)
          anotar(lineaDeFase(f, elegido, ui))
          if (AVISO_POR_FASE[f.id]) avisarFase(elegido, AVISO_POR_FASE[f.id])
          // La última fase ES el auto-healing: el sistema vuelve solo, sin
          // que nadie toque un botón. Ese es el punto del simulacro.
          if (f.id === 'recuperado') {
            cerrarSimulacro('auto-healing')
            fijarEscenario(null)
            setTerminaEn(null)
          }
        }
        if (f.en === 0) disparar()
        else timers.current.push(setTimeout(disparar, f.en))
      })

      return true
    },
    [anotar, avisarFase, cerrarSimulacro, fijarEscenario, limpiarTimers, ui],
  )

  const limpiarRegistro = useCallback(() => setRegistro([]), [])

  const valor = useMemo(
    () => ({
      escenario,
      fase,
      terminaEn,
      registro,
      simulacros,
      activo: escenario != null,
      inyectar,
      restaurar,
      limpiarRegistro,
      autohealingMs: AUTOHEALING_MS,
    }),
    [escenario, fase, terminaEn, registro, simulacros, inyectar, restaurar, limpiarRegistro],
  )

  return <CaosContext.Provider value={valor}>{children}</CaosContext.Provider>
}

export function useCaos() {
  const ctx = useContext(CaosContext)
  if (!ctx) throw new Error('useCaos() requiere que el árbol esté dentro de <CaosProvider>')
  return ctx
}
