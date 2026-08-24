import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AUTOHEALING_MS, FASES, escenarioPorId, lineaDeFase } from '../lib/caos.js'
import { useContenido } from '../i18n/LanguageProvider'

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

  const [escenario, setEscenario] = useState(null)
  const [fase, setFase] = useState(null)
  const [terminaEn, setTerminaEn] = useState(null)
  const [registro, setRegistro] = useState([])

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

  const restaurar = useCallback(
    ({ anunciar = true } = {}) => {
      limpiarTimers()
      setEscenario((activo) => {
        if (activo && anunciar) {
          anotar({
            id: `${activo.id}:manual:${Date.now()}`,
            ts: Date.now(),
            fase: 'restaurado',
            nivel: 'ok',
            escenario: activo.id,
            texto: ui.caos.fases.restaurado(activo, ui),
          })
        }
        return null
      })
      setFase(null)
      setTerminaEn(null)
    },
    [anotar, limpiarTimers, ui],
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
      setEscenario(elegido)
      setTerminaEn(Date.now() + AUTOHEALING_MS)

      FASES.forEach((f) => {
        const disparar = () => {
          setFase(f.id)
          anotar(lineaDeFase(f, elegido, ui))
          // La última fase ES el auto-healing: el sistema vuelve solo, sin
          // que nadie toque un botón. Ese es el punto del simulacro.
          if (f.id === 'recuperado') {
            setEscenario(null)
            setTerminaEn(null)
          }
        }
        if (f.en === 0) disparar()
        else timers.current.push(setTimeout(disparar, f.en))
      })

      return true
    },
    [anotar, limpiarTimers, ui],
  )

  const limpiarRegistro = useCallback(() => setRegistro([]), [])

  const valor = useMemo(
    () => ({
      escenario,
      fase,
      terminaEn,
      registro,
      activo: escenario != null,
      inyectar,
      restaurar,
      limpiarRegistro,
      autohealingMs: AUTOHEALING_MS,
    }),
    [escenario, fase, terminaEn, registro, inyectar, restaurar, limpiarRegistro],
  )

  return <CaosContext.Provider value={valor}>{children}</CaosContext.Provider>
}

export function useCaos() {
  const ctx = useContext(CaosContext)
  if (!ctx) throw new Error('useCaos() requiere que el árbol esté dentro de <CaosProvider>')
  return ctx
}
