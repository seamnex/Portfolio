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
import LabMetrics from './components/LabMetrics'
import ObservabilityHub from './components/ObservabilityHub'
import Console from './components/Console'
import Incidents from './components/Incidents'
import Projects from './components/Projects'
import Timeline from './components/Timeline'
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
    <LanguageProvider>
      <EstadoProvider>
        <CaosProvider>
          <TelemetriaProvider>
            <PostMortemProvider>
              <PlaybookProvider>
                <Navbar />
                <main>
                  <Hero />
                  {/* El panel de estado va pegado al hero: es la prueba en vivo de
                      lo que el hero afirma, y enterrado más abajo no la vería nadie. */}
                  <SystemStatus />
                  <About />
                  <Skills />
                  {/* Los números medidos en los labs primero: son la entrada al
                      hub, que es donde esos mismos números se pueden mirar,
                      romper a propósito y presupuestar. */}
                  <LabMetrics />
                  {/* Tablero DORA, topología, sandbox de caos, Command Center y
                      presupuesto de error: cinco secciones apiladas que ahora son
                      tres pestañas de una sola. */}
                  <ObservabilityHub />
                  {/* La consola, inmediatamente después: cada simulacro del
                      sandbox y cada paso de runbook escriben su salida acá, y con
                      una sección en el medio el botón parecería no hacer nada. */}
                  <Console />
                  <Incidents />
                  <Projects />
                  <Timeline />
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
