import { useContenido } from '../../i18n/LanguageProvider'
import Vista from '../ui/Vista'
import Hero from '../Hero'
import About from '../About'
import Skills from '../Skills'
import Timeline from '../Timeline'
import SandboxBanner from '../SandboxBanner'
import Contact from '../Contact'

// ─────────────────────────────────────────────────────────────
//  Vista 1 — Perfil & Trayectoria.
//
//  Lo que un reclutador vino a ver, y nada más: quién es, cómo trabaja,
//  qué sabe, dónde estuvo y cómo escribirle. Se recorre de una sentada.
//
//  El laboratorio entero —tablero DORA, topología, presupuesto de error,
//  simulacros, runbooks, consola, post-mortems y labs— vive en las otras
//  dos vistas. Acá aparece una sola vez, como banner: una tarjeta que
//  dice qué hay del otro lado y lleva ahí. Quien solo quiere escribir un
//  mail llega al formulario sin cruzar un sandbox.
// ─────────────────────────────────────────────────────────────
export default function VistaPerfil() {
  const { ui } = useContenido()

  return (
    <Vista id="perfil" titulo={ui.vistas.perfil.titulo}>
      <Hero />
      <About />
      <Skills />
      <Timeline />
      {/* Entre la trayectoria y el contacto a propósito: es el punto del
          recorrido donde alguien ya se convenció de algo y todavía no
          decidió qué hacer al respecto. */}
      <SandboxBanner />
      <Contact />
    </Vista>
  )
}
