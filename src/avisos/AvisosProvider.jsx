import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import Avisos from '../components/Avisos'

// ─────────────────────────────────────────────────────────────
//  Motor de notificaciones flotantes: las alertas de PagerDuty o Slack
//  que un on-call ve aparecer en la esquina cuando algo se dispara.
//
//  Lo usan el sandbox de caos —TRIGGERED al saltar la alerta,
//  ACKNOWLEDGED cuando la remediación toma el incidente, RESOLVED al
//  cerrarse— y el formulario de contacto para el resultado del envío.
//  Va por encima de todos los demás proveedores porque cualquiera puede
//  querer avisar algo y ninguno debería tener que saber quién lo dibuja.
//
//  Cada aviso lleva `estado` (triggered | acknowledged | resolved | info
//  | error) que decide color y rótulo, y `clave` opcional: dos avisos con
//  la misma clave se reemplazan en lugar de apilarse, que es lo que
//  quiere un incidente que pasa de TRIGGERED a ACKNOWLEDGED — la tarjeta
//  cambia de estado, no aparece una segunda debajo.
// ─────────────────────────────────────────────────────────────
const AvisosContext = createContext(null)

/** Cuánto vive un aviso si nadie lo cierra, por estado. */
const DURACION_MS = { triggered: 9000, acknowledged: 7000, resolved: 7000, info: 6000, error: 10000 }

/** Más de esto y la esquina se convierte en una pila ilegible. */
const MAXIMO = 4

export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([])
  const timers = useRef(new Map())

  const cerrar = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setAvisos((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const avisar = useCallback(
    ({ estado = 'info', clave, titulo, detalle, meta, severidad, duracion }) => {
      const id = `${clave ?? 'aviso'}:${Date.now()}:${Math.random().toString(36).slice(2, 7)}`
      const aviso = { id, estado, clave, titulo, detalle, meta, severidad, ts: Date.now() }

      setAvisos((prev) => {
        // Con la misma clave, el nuevo pisa al viejo en su lugar de la
        // pila. Si el viejo tenía timer, se cancela: el que manda es el
        // nuevo estado.
        const viejo = clave ? prev.find((a) => a.clave === clave) : null
        if (viejo) {
          clearTimeout(timers.current.get(viejo.id))
          timers.current.delete(viejo.id)
        }
        const resto = viejo ? prev.filter((a) => a.id !== viejo.id) : prev
        return [...resto, aviso].slice(-MAXIMO)
      })

      const vida = duracion ?? DURACION_MS[estado] ?? DURACION_MS.info
      timers.current.set(id, setTimeout(() => cerrar(id), vida))
      return id
    },
    [cerrar],
  )

  const valor = useMemo(() => ({ avisos, avisar, cerrar }), [avisos, avisar, cerrar])

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <Avisos />
    </AvisosContext.Provider>
  )
}

export function useAvisos() {
  const ctx = useContext(AvisosContext)
  if (!ctx) throw new Error('useAvisos() requiere que el árbol esté dentro de <AvisosProvider>')
  return ctx
}
