import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { MUESTRAS_MAX, MUESTREO_MS, REPO_DESPLIEGUE, VENTANA_DIAS } from '../data/dora.js'
import { historialActions, muestraLatencia } from '../lib/estado.js'
import { calcularDora, percentil } from '../lib/dora.js'

// ─────────────────────────────────────────────────────────────
//  Telemetría del tablero DORA.
//
//  Dos fuentes, las dos reales:
//
//   · el historial de GitHub Actions en main, del que salen frecuencia de
//     despliegue, lead time y change failure rate;
//   · una serie de peticiones cronometradas desde este navegador al origen
//     que sirve la página, de la que sale el p95 de latencia del cliente.
//
//  El muestreo de latencia arranca SOLO cuando el panel está a la vista.
//  Un timer que dispara una petición cada cuatro segundos durante toda la
//  visita, para alimentar un gráfico que nadie está mirando, es tráfico
//  que se le cobra al visitante a cambio de nada.
// ─────────────────────────────────────────────────────────────
const TelemetriaContext = createContext(null)

export function TelemetriaProvider({ children, recurso = '/favicon.svg' }) {
  const [historial, setHistorial] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [muestras, setMuestras] = useState([])
  const [midiendo, setMidiendo] = useState(false)

  const enVuelo = useRef(false)

  const refrescar = useCallback(async ({ usarCache = true } = {}) => {
    if (enVuelo.current) return
    enVuelo.current = true
    setCargando(true)
    try {
      setHistorial(await historialActions(REPO_DESPLIEGUE, { usarCache }))
    } finally {
      enVuelo.current = false
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    refrescar()
  }, [refrescar])

  // ── Muestreo de latencia ───────────────────────────────────
  // Se detiene también cuando la pestaña pasa a segundo plano: en una
  // pestaña oculta los timers se estrangulan y las muestras que igual
  // salen llegan deformadas por el propio throttling del navegador, que
  // es peor que no medir.
  useEffect(() => {
    if (!midiendo) return undefined

    let vivo = true
    const tomar = async () => {
      if (document.visibilityState !== 'visible') return
      const ms = await muestraLatencia(recurso)
      if (!vivo || ms == null) return
      setMuestras((prev) => [...prev, Math.round(ms * 10) / 10].slice(-MUESTRAS_MAX))
    }

    tomar()
    const t = setInterval(tomar, MUESTREO_MS)
    return () => {
      vivo = false
      clearInterval(t)
    }
  }, [midiendo, recurso])

  const valor = useMemo(() => {
    const corridas = historial?.estado === 'ok' ? historial.corridas : null
    const dora = corridas ? calcularDora(corridas, { dias: VENTANA_DIAS }) : null

    return {
      dora,
      // El motivo por el que no hay datos importa: no es lo mismo "GitHub
      // te cortó por límite de consultas" que "el pipeline no existe".
      motivo: historial?.estado === 'ok' ? null : (historial?.motivo ?? null),
      cargando,
      repo: REPO_DESPLIEGUE,
      ventanaDias: VENTANA_DIAS,
      refrescar,
      latencia: {
        muestras,
        n: muestras.length,
        ultima: muestras.at(-1) ?? null,
        p50: percentil(muestras, 0.5),
        p95: percentil(muestras, 0.95),
        midiendo,
      },
      /** Lo llama el panel desde un IntersectionObserver. */
      activarMuestreo: setMidiendo,
    }
  }, [historial, cargando, muestras, midiendo, refrescar])

  return <TelemetriaContext.Provider value={valor}>{children}</TelemetriaContext.Provider>
}

export function useTelemetria() {
  const ctx = useContext(TelemetriaContext)
  if (!ctx) throw new Error('useTelemetria() requiere que el árbol esté dentro de <TelemetriaProvider>')
  return ctx
}
