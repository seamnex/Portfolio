import { useContenido } from '../../i18n/LanguageProvider'
import Vista from '../ui/Vista'
import Hero from '../Hero'
import About from '../About'
import Evidencia from '../Evidencia'
import Skills from '../Skills'
import Timeline from '../Timeline'
import Contact from '../Contact'

// ─────────────────────────────────────────────────────────────
//  Vista 1 — Perfil & Trayectoria.
//
//  Lo que un reclutador vino a ver, y nada más: quién es, cómo trabaja,
//  qué sabe, dónde estuvo y cómo escribirle. Se recorre de una sentada.
//
//  El laboratorio entero —tablero DORA, topología, presupuesto de error,
//  simulacros, runbooks, consola, post-mortems y labs— vive en las otras
//  dos vistas. Acá la puerta es el panel de la portada, con sus dos
//  accesos: el banner del sandbox que había antes de Contacto repetía
//  esas mismas dos tarjetas y alargaba la vista sin decir nada nuevo.
// ─────────────────────────────────────────────────────────────
export default function VistaPerfil() {
  const { ui } = useContenido()

  return (
    <Vista id="perfil" titulo={ui.vistas.perfil.titulo}>
      <Hero />
      <About />
      {/* La evidencia antes del stack: un reclutador que se va después
          de "Sobre mí" igual se lleva tres repos con resultados. */}
      <Evidencia />
      <Skills />
      <Timeline />
      <Contact />
    </Vista>
  )
}
