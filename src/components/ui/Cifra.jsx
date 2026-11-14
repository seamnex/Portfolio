import { useRef } from 'react'

/**
 * Un valor medido que anima su cambio.
 *
 * La primera vez se muestra sin más: lo que se anima es la llegada de un
 * dato nuevo sobre uno que ya estaba, no la carga de la página. Cambiar
 * la `key` remonta el span y vuelve a correr la animación, sin estado
 * ni efectos.
 */
export default function Cifra({ children, className = '' }) {
  const previo = useRef(undefined)
  const vuelta = useRef(0)
  if (previo.current !== undefined && previo.current !== children) vuelta.current += 1
  previo.current = children

  return (
    <span key={vuelta.current} className={`${vuelta.current ? 'cifra-nueva ' : ''}${className}`}>
      {children}
    </span>
  )
}
