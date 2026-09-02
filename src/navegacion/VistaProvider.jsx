import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

// ─────────────────────────────────────────────────────────────
//  Navegación por vistas.
//
//  El sitio dejó de ser una sola página larga: son tres vistas y una
//  barra que elige cuál se mira. La regla que las gobierna es una sola y
//  vale la pena decirla acá arriba, porque es la que hace que esto sea
//  navegación y no un router:
//
//    cambiar de vista OCULTA, nunca desmonta.
//
//  Un simulacro de caos con su cuenta regresiva, un runbook parado en el
//  paso 3 y el scrollback de la consola son estado local de sus
//  componentes. Desmontar la vista los borraría, y "cambié de pestaña y
//  perdí el simulacro" es exactamente el bug que esta arquitectura tiene
//  prohibido tener. Por eso las vistas visitadas se quedan en el árbol
//  con `hidden` y solo la activa se ve.
//
//  Lo que sí es perezoso es el primer montaje: una vista no existe hasta
//  que alguien la pide. Quien entra a leer el perfil no paga el muestreo
//  de latencia del tablero ni el intérprete de la consola. Una vez
//  montada, ya no se va.
//
//  El hash sigue siendo la dirección de todo. Un `<a href="#consola">`
//  escrito en cualquier parte del sitio sigue funcionando: el navegador
//  cambia el hash, esto traduce el ancla a su vista, la monta, la muestra
//  y recién entonces completa el salto — un elemento oculto no se puede
//  desplazar a la vista, así que el orden importa.
// ─────────────────────────────────────────────────────────────

export const VISTAS = ['perfil', 'observabilidad', 'laboratorio']

/**
 * Las anclas que vive cada vista. Es el mapa que traduce un enlace
 * (#slo, #consola, #contacto) a la vista que hay que abrir antes de
 * intentar el salto.
 *
 * Mantenerlo al día es obligatorio: un ancla que no figure acá se
 * comporta como un enlace muerto, porque su bloque está detrás de un
 * `hidden` y el navegador no tiene forma de llegar solo.
 */
const ANCLAS = {
  perfil: ['inicio', 'sobre-mi', 'skills', 'trayectoria', 'sandbox', 'contacto'],
  observabilidad: ['estado', 'telemetria', 'topologia', 'slo', 'metricas'],
  laboratorio: ['caos', 'playbooks', 'consola', 'postmortems', 'labs'],
}

/** La vista que contiene un ancla, o la vista misma si el ancla es su id. */
export function vistaDe(ancla) {
  if (!ancla) return null
  if (VISTAS.includes(ancla)) return ancla
  return VISTAS.find((v) => ANCLAS[v].includes(ancla)) ?? null
}

function anclaDelHash() {
  if (typeof window === 'undefined') return ''
  try {
    return decodeURIComponent(window.location.hash.slice(1))
  } catch {
    // Un hash con un %-escape inválido no es motivo para no renderizar.
    return ''
  }
}

/**
 * Vista inicial, resuelta de forma síncrona en el primer render y no en
 * un efecto: si arrancara siempre en el perfil, quien abre un enlace a
 * #consola vería la portada entera pintarse y saltar a otra vista.
 */
function vistaInicial() {
  return vistaDe(anclaDelHash()) ?? VISTAS[0]
}

const VistaContext = createContext(null)

export function VistaProvider({ children }) {
  const [vista, setVista] = useState(vistaInicial)
  const [montadas, setMontadas] = useState(() => [vistaInicial()])

  // El listener del hash se registra una sola vez, así que no puede leer
  // `vista` de la clausura: se quedaría con la del primer render.
  const vistaRef = useRef(vista)
  // Ancla pendiente de un salto: se resuelve recién cuando React repintó
  // con la vista destino ya visible, no antes.
  const pendiente = useRef(anclaDelHash() || null)
  // Con qué vista corrió el efecto la última vez. No alcanza un booleano
  // de "primer render": en desarrollo, StrictMode monta, desmonta y
  // vuelve a montar, y un efecto que solo se saltea la primera pasada
  // mandaría el scroll arriba en la segunda.
  const vistaPrevia = useRef(vista)

  // Mostrar una vista, sin tocar el historial. Es el camino que usa el
  // listener del hash: cuando el cambio VIENE del historial —alguien tocó
  // atrás—, empujar una entrada nueva dejaría el botón peleándose consigo
  // mismo.
  const aplicar = useCallback((objetivo, ancla) => {
    if (objetivo === vistaRef.current) {
      // Misma vista: no hay repintado que esperar y el bloque ya está a la
      // vista, así que el salto se hace acá mismo.
      if (ancla) document.getElementById(ancla)?.scrollIntoView({ block: 'start' })
      else window.scrollTo({ top: 0 })
      return
    }

    pendiente.current = ancla
    setMontadas((previas) => (previas.includes(objetivo) ? previas : [...previas, objetivo]))
    setVista(objetivo)
  }, [])

  // Ir a una vista por decisión de alguien: una pestaña, el banner del
  // sandbox, el botón de contacto. Acá sí se empuja el hash, para que el
  // botón de atrás deshaga el cambio de pestaña —que es lo que espera
  // cualquiera que llegó desde un enlace— y para que la URL de la barra
  // siga siendo compartible. `pushState` no dispara `hashchange`, así que
  // esto no se realimenta con el listener de abajo.
  const irA = useCallback(
    (destino, ancla = null) => {
      const objetivo = destino ?? vistaDe(ancla) ?? VISTAS[0]
      const hash = `#${ancla ?? objetivo}`
      if (window.location.hash !== hash) window.history.pushState(null, '', hash)
      aplicar(objetivo, ancla)
    },
    [aplicar],
  )

  // Un solo efecto para las dos cosas que dependen del repintado: dejar
  // `vistaRef` al día y completar el salto que quedó pendiente.
  useEffect(() => {
    vistaRef.current = vista
    const cambioDeVista = vistaPrevia.current !== vista
    vistaPrevia.current = vista

    const ancla = pendiente.current
    pendiente.current = null

    if (ancla) {
      const nodo = document.getElementById(ancla)
      if (nodo) {
        nodo.scrollIntoView({ block: 'start' })
        return
      }
    }

    // Cambiar de vista arranca arriba: son páginas distintas y heredar el
    // scroll de la anterior deja al visitante en la mitad de un panel que
    // no pidió. En el primer render no, porque ahí el navegador puede
    // estar restaurando la posición de una recarga.
    if (cambioDeVista) window.scrollTo({ top: 0 })
  }, [vista])

  // ── Enlaces del sitio ──────────────────────────────────────
  // Cualquier <a href="#algo"> sigue funcionando sin saber que existen
  // las vistas: el navegador intentó el salto y no pudo porque el bloque
  // estaba oculto; acá se abre lo que haga falta y el efecto de arriba
  // completa el desplazamiento.
  useEffect(() => {
    const alHash = () => {
      const ancla = anclaDelHash()

      // Sin hash es el estado con el que arranca el sitio, y se llega ahí
      // yendo para atrás desde el primer cambio de pestaña: hay que
      // devolver la portada, o el botón de atrás no haría nada visible.
      if (!ancla) {
        aplicar(VISTAS[0], null)
        return
      }

      const destino = vistaDe(ancla)
      if (!destino) return
      aplicar(destino, VISTAS.includes(ancla) ? null : ancla)
    }

    window.addEventListener('hashchange', alHash)
    return () => window.removeEventListener('hashchange', alHash)
  }, [aplicar])

  const valor = useMemo(
    () => ({ vista, vistas: VISTAS, montadas, irA }),
    [vista, montadas, irA],
  )

  return <VistaContext.Provider value={valor}>{children}</VistaContext.Provider>
}

/**
 * Devuelve la vista activa, las montadas y `irA(vista, ancla?)`.
 * Uso: `const { vista, irA } = useVista()`
 */
export function useVista() {
  const ctx = useContext(VistaContext)
  if (!ctx) throw new Error('useVista() requiere que el árbol esté dentro de <VistaProvider>')
  return ctx
}
