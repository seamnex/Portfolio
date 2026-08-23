import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { pipelines, servicios } from '../data/servicios.js'
import { agregar, chequearActions, chequearOrigen, TTL_MS } from '../lib/estado.js'

// Un solo proveedor para los tres consumidores del estado: el panel, los
// badges de CI de las tarjetas y el comando `status` de la consola. Si cada
// uno consultara por su cuenta, un repo vigilado por dos de ellos gastaría
// dos de las 60 consultas por hora que da la API pública de GitHub.
const EstadoContext = createContext(null)

/** Repos únicos a consultar: los del panel más los que muestran badge. */
const REPOS = [
  ...new Set([
    ...servicios.filter((s) => s.tipo === 'actions').map((s) => s.repo),
    ...Object.values(pipelines).map((p) => p.repo),
  ]),
]

const servicioOrigen = servicios.find((s) => s.tipo === 'origen')

export function EstadoProvider({ children }) {
  const [porRepo, setPorRepo] = useState({})
  const [origen, setOrigen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [verificadoEn, setVerificadoEn] = useState(null)

  // Evita que dos disparos simultáneos (montaje + volver a la pestaña) manden
  // el doble de peticiones por nada.
  const enVuelo = useRef(false)

  const refrescar = useCallback(async ({ usarCache = true } = {}) => {
    if (enVuelo.current) return
    enVuelo.current = true
    setCargando(true)
    try {
      const [resOrigen, ...resRepos] = await Promise.all([
        servicioOrigen ? chequearOrigen(servicioOrigen.recurso) : Promise.resolve(null),
        ...REPOS.map((repo) => chequearActions(repo, { usarCache })),
      ])
      setOrigen(resOrigen)
      setPorRepo(Object.fromEntries(REPOS.map((repo, i) => [repo, resRepos[i]])))
      setVerificadoEn(Date.now())
    } finally {
      enVuelo.current = false
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    refrescar()
  }, [refrescar])

  // Al volver a la pestaña después de un rato, el dato en pantalla ya está
  // viejo. Refrescar siempre sería gastar rate limit por nada; refrescar solo
  // pasado el TTL mantiene el panel honesto sin castigar al visitante.
  useEffect(() => {
    const alVolver = () => {
      if (document.visibilityState !== 'visible') return
      if (verificadoEn && Date.now() - verificadoEn < TTL_MS) return
      refrescar()
    }
    document.addEventListener('visibilitychange', alVolver)
    return () => document.removeEventListener('visibilitychange', alVolver)
  }, [refrescar, verificadoEn])

  const valor = useMemo(() => {
    // Se rearma la lista con la forma que espera el panel: cada servicio
    // declarado, con su resultado o 'consultando' si todavía no llegó.
    const resultados = Object.fromEntries(
      servicios.map((s) => {
        const dato =
          s.tipo === 'origen' ? origen : porRepo[s.repo]
        return [s.id, { estado: 'consultando', ...(dato ?? {}), id: s.id, etiqueta: s.etiqueta, tipo: s.tipo }]
      }),
    )

    return {
      servicios,
      resultados,
      porRepo,
      agregado: cargando && !verificadoEn ? 'cargando' : agregar(resultados),
      cargando,
      verificadoEn,
      refrescar,
      /** Estado de CI para una tarjeta de proyecto, por URL de repo. */
      pipelineDe: (urlRepo) => {
        const pipeline = pipelines[urlRepo]
        if (!pipeline) return null
        return porRepo[pipeline.repo] ?? { estado: 'consultando', repo: pipeline.repo }
      },
    }
  }, [origen, porRepo, cargando, verificadoEn, refrescar])

  return <EstadoContext.Provider value={valor}>{children}</EstadoContext.Provider>
}

export function useEstado() {
  const ctx = useContext(EstadoContext)
  if (!ctx) throw new Error('useEstado() requiere que el árbol esté dentro de <EstadoProvider>')
  return ctx
}
