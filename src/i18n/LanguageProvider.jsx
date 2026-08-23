import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as es from '../data/content.js'
import * as en from '../data/content.en.js'

// Los dos diccionarios exportan exactamente los mismos nombres, así que el
// namespace import alcanza como "objeto de contenido" y no hace falta un
// mapeo intermedio que haya que actualizar cada vez que se suma una clave.
const IDIOMAS = { es, en }
export const IDIOMAS_DISPONIBLES = ['es', 'en']

const CLAVE = 'portfolio:idioma'

const LanguageContext = createContext(null)

/**
 * Idioma inicial, en orden de prioridad:
 *   1. Lo que el visitante eligió antes (localStorage).
 *   2. El idioma del navegador.
 *   3. Español.
 *
 * Se resuelve de forma síncrona en el primer render y no en un efecto: si
 * arrancara siempre en español, un visitante angloparlante vería un
 * parpadeo del sitio entero cambiando de idioma bajo sus ojos.
 */
function idiomaInicial() {
  if (typeof window === 'undefined') return 'es'

  try {
    const guardado = window.localStorage.getItem(CLAVE)
    if (IDIOMAS_DISPONIBLES.includes(guardado)) return guardado
  } catch {
    // Modo privado o cookies bloqueadas: no es motivo para romper el sitio.
  }

  const navegador = window.navigator?.language ?? 'es'
  return navegador.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(idiomaInicial)

  // El <html lang> y los metadatos no los maneja React: viven en index.html.
  // Si no se actualizan acá, un lector de pantalla lee el sitio en inglés con
  // fonética española y Google indexa un idioma que no es el que se ve.
  useEffect(() => {
    const contenido = IDIOMAS[lang]
    document.documentElement.lang = lang
    document.title = contenido.ui.meta.title

    const descripcion = document.querySelector('meta[name="description"]')
    if (descripcion) descripcion.setAttribute('content', contenido.ui.meta.description)

    try {
      window.localStorage.setItem(CLAVE, lang)
    } catch {
      // Ídem: preferencia no persistida, sitio funcionando.
    }
  }, [lang])

  const cambiar = useCallback((siguiente) => {
    setLang((actual) =>
      IDIOMAS_DISPONIBLES.includes(siguiente)
        ? siguiente
        : // Sin argumento válido, alterna. Es lo que quiere el toggle del header.
          actual === 'es'
          ? 'en'
          : 'es',
    )
  }, [])

  const valor = useMemo(() => ({ lang, cambiar, ...IDIOMAS[lang] }), [lang, cambiar])

  return <LanguageContext.Provider value={valor}>{children}</LanguageContext.Provider>
}

/**
 * Devuelve el contenido del idioma activo más `lang` y `cambiar`.
 * Uso: `const { hero, ui, lang } = useContenido()`
 */
export function useContenido() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useContenido() requiere que el árbol esté dentro de <LanguageProvider>')
  return ctx
}
