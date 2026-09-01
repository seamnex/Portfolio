import { LanguageProvider } from './i18n/LanguageProvider'
import { EstadoProvider } from './estado/EstadoProvider'
import { CaosProvider } from './caos/CaosProvider'
import { TelemetriaProvider } from './telemetria/TelemetriaProvider'
import { PostMortemProvider } from './postmortem/PostMortemProvider'
import { PlaybookProvider } from './playbooks/PlaybookProvider'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SystemStatus from './components/SystemStatus'
import About from './components/About'
import Skills from './components/Skills'
import Timeline from './components/Timeline'
import ObservabilityHub from './components/ObservabilityHub'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    // Idioma afuera: todos los demás leen textos traducidos. Después, en
    // orden de dependencia: caos arma sus líneas de bitácora con `ui`, y la
    // consola —que vive dentro de post-mortems y del Command Center—
    // consulta estado, caos y el runbook abierto. Telemetría va después de
    // caos porque el tablero avisa cuando hay un simulacro en curso, aunque
    // sus números no dependan de él.
    //
    // Los proveedores siguen acá arriba aunque casi todo lo que consumen
    // viva ahora dentro del hub: son los que hacen que un simulacro o un
    // runbook sobrevivan a cerrar el sandbox.
    //
    // Sus consultas de arranque no cambian —estado y telemetría piden una
    // vez al montar, y el panel de estado de la portada necesita la
    // primera igual—. Lo que ahorra el hub cerrado es el bucle: el
    // muestreo de latencia, que dispara una petición cada cuatro segundos,
    // no arranca hasta que su panel existe y está a la vista.
    <LanguageProvider>
      <EstadoProvider>
        <CaosProvider>
          <TelemetriaProvider>
            <PostMortemProvider>
              <PlaybookProvider>
                <Navbar />
                {/* ── Portada ──────────────────────────────────────
                    Cinco bloques y el pie: quién es, cómo trabaja, qué
                    sabe, dónde estuvo, la puerta al laboratorio y cómo
                    contactarlo. Todo lo demás —nueve paneles de
                    observabilidad, la consola, los post-mortems y los
                    labs— está adentro del hub, cerrado hasta que alguien
                    lo abre. Quien solo quiere escribir un mail llega al
                    formulario sin cruzar un sandbox. */}
                <main>
                  <Hero />
                  {/* El panel de estado va pegado al hero: cerrado ocupa una
                      fila y es la prueba en vivo de lo que el hero afirma.
                      Es la única pieza de laboratorio que se queda en la
                      portada, y se queda porque sin ella el hero es una
                      promesa sin respaldo a la vista. */}
                  <SystemStatus />
                  <About />
                  <Skills />
                  <Timeline />
                  <ObservabilityHub />
                  <Contact />
                </main>
                <Footer />
              </PlaybookProvider>
            </PostMortemProvider>
          </TelemetriaProvider>
        </CaosProvider>
      </EstadoProvider>
    </LanguageProvider>
  )
}
