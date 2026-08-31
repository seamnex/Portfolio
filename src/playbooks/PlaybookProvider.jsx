import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useContenido } from '../i18n/LanguageProvider'
import { PLAYBOOKS, playbookPorId } from '../data/playbooks.js'
import { lineaCierre, lineasApertura, lineasDePaso, quedanPasos } from '../lib/runbook.js'

// ─────────────────────────────────────────────────────────────
//  Estado del Command Center — el runbook que se está ejecutando.
//
//  Vive en un contexto por el mismo motivo que el sandbox de caos: dos
//  lugares que no se conocen entre sí lo manejan —las tarjetas de la
//  sección y el comando `playbook` de la consola— y ninguno de los dos
//  tiene por qué recibir callbacks atravesando media aplicación.
//
//  La ejecución es PASO A PASO y nunca automática. Un runbook que se
//  corre solo es un GIF: lo que enseña un runbook es la decisión de qué
//  mirar antes de tocar nada, y esa decisión la toma quien lee, un paso
//  por vez.
//
//  Acá solo vive el estado. Las líneas las arma `lib/runbook.js`, que es
//  puro y por eso se puede barrer entero desde Node.
//
//  `registro` es la cola que consume la consola, con la misma mecánica
//  que la bitácora del caos: se acumulan líneas, la consola imprime las
//  que todavía no imprimió y se guía por el id de la última.
// ─────────────────────────────────────────────────────────────
const PlaybookContext = createContext(null)

/** Tope de líneas conservadas, como en la bitácora del sandbox. */
const REGISTRO_MAX = 120

export function PlaybookProvider({ children }) {
  const { ui } = useContenido()

  const [activo, setActivo] = useState(null)
  // Índice del último paso EJECUTADO. -1 es "abierto, sin correr nada":
  // hace falta distinguirlo de 0, que ya es el primer paso corrido.
  const [paso, setPaso] = useState(-1)
  const [registro, setRegistro] = useState([])

  const anotar = useCallback((lineas) => {
    setRegistro((prev) => [...prev, ...lineas].slice(-REGISTRO_MAX))
  }, [])

  /**
   * Abre un runbook sin ejecutar nada todavía.
   * Devuelve `false` si el id no existe, para que la consola pueda
   * contestar en vez de quedarse callada como si hubiera hecho algo.
   */
  const iniciar = useCallback(
    (id) => {
      const elegido = playbookPorId(id)
      if (!elegido) return false
      setActivo(elegido)
      setPaso(-1)
      anotar(lineasApertura(elegido, ui))
      return true
    },
    [anotar, ui],
  )

  /**
   * Ejecuta el paso siguiente.
   * @returns 'sin-playbook' | 'terminado' | 'ultimo' | 'ok'
   */
  const siguiente = useCallback(() => {
    if (!activo) return 'sin-playbook'
    if (!quedanPasos(activo, paso)) return 'terminado'

    const proximo = paso + 1
    setPaso(proximo)

    const lineas = lineasDePaso(activo, proximo, ui)
    // El cierre se anota en la misma tanda que el último paso: si fuera
    // en otra, la consola imprimiría dos bloques separados por lo que se
    // vería como una pausa que no existe.
    const ultimo = proximo === activo.pasos.length - 1
    anotar(ultimo ? [...lineas, lineaCierre(activo, 'terminado', ui)] : lineas)

    return ultimo ? 'ultimo' : 'ok'
  }, [activo, paso, anotar, ui])

  const reiniciar = useCallback(() => {
    if (!activo) return
    setPaso(-1)
    anotar([lineaCierre(activo, 'reiniciado', ui)])
  }, [activo, anotar, ui])

  const cerrar = useCallback(() => {
    if (activo) anotar([lineaCierre(activo, 'cerrado', ui)])
    setActivo(null)
    setPaso(-1)
  }, [activo, anotar, ui])

  const valor = useMemo(
    () => ({
      playbooks: PLAYBOOKS,
      activo,
      paso,
      registro,
      total: activo?.pasos.length ?? 0,
      completado: activo != null && paso === activo.pasos.length - 1,
      iniciar,
      siguiente,
      reiniciar,
      cerrar,
    }),
    [activo, paso, registro, iniciar, siguiente, reiniciar, cerrar],
  )

  return <PlaybookContext.Provider value={valor}>{children}</PlaybookContext.Provider>
}

export function usePlaybook() {
  const ctx = useContext(PlaybookContext)
  if (!ctx) throw new Error('usePlaybook() requiere que el árbol esté dentro de <PlaybookProvider>')
  return ctx
}
