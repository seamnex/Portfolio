import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useContenido } from '../i18n/LanguageProvider'
import PostMortem from '../components/PostMortem'

// El modal se abre desde dos lugares que no se conocen entre sí: las tarjetas
// de la bitácora y el comando `incident <id>` de la consola. Un contexto evita
// que la consola tenga que recibir un callback atravesando media aplicación.
const PostMortemContext = createContext(null)

export function PostMortemProvider({ children }) {
  const { incidentes } = useContenido()
  const [abiertoId, setAbiertoId] = useState(null)

  const abrir = useCallback((id) => setAbiertoId(id), [])
  const cerrar = useCallback(() => setAbiertoId(null), [])

  // El índice se recalcula contra la lista del idioma activo: si alguien
  // cambia de idioma con el modal abierto, sigue viendo el mismo incidente
  // traducido y no uno distinto por haber guardado la posición.
  const indice = incidentes.findIndex((i) => i.id === abiertoId)
  const incidente = indice >= 0 ? incidentes[indice] : null

  const ir = useCallback(
    (delta) => {
      if (indice < 0) return
      const siguiente = (indice + delta + incidentes.length) % incidentes.length
      setAbiertoId(incidentes[siguiente].id)
    },
    [indice, incidentes],
  )

  const valor = useMemo(
    () => ({ abrir, cerrar, abiertoId, existe: (id) => incidentes.some((i) => i.id === id) }),
    [abrir, cerrar, abiertoId, incidentes],
  )

  return (
    <PostMortemContext.Provider value={valor}>
      {children}
      {incidente && (
        <PostMortem
          incidente={incidente}
          posicion={{ actual: indice + 1, total: incidentes.length }}
          onCerrar={cerrar}
          onAnterior={() => ir(-1)}
          onSiguiente={() => ir(1)}
        />
      )}
    </PostMortemContext.Provider>
  )
}

export function usePostMortem() {
  const ctx = useContext(PostMortemContext)
  if (!ctx) throw new Error('usePostMortem() requiere que el árbol esté dentro de <PostMortemProvider>')
  return ctx
}
