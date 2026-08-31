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
import Telemetry from './components/Telemetry'
import Incidents from './components/Incidents'
import Projects from './components/Projects'
import ChaosPanel from './components/ChaosPanel'
import SloCalculator from './components/SloCalculator'
import Playbooks from './components/Playbooks'
import Console from './components/Console'
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
                  {/* Los números primero; después los incidentes que los produjeron,
                      y recién ahí los labs donde corren. */}
                  <LabMetrics />
                  <Telemetry />
                  <Incidents />
                  <Projects />
                  {/* El sandbox de caos, justo antes de la consola: el simulacro
                      escribe su bitácora ahí abajo y conviene que el visitante la
                      tenga a un scroll de distancia, no al principio de la página. */}
                  <ChaosPanel />
                  {/* El presupuesto va pegado al sandbox: lo que lo consume son
                      los simulacros de arriba, y con una sección en el medio la
                      relación de causa dejaría de verse. */}
                  <SloCalculator />
                  {/* Y el Command Center, pegado a la consola: cada paso del
                      runbook escribe su salida ahí abajo. */}
                  <Playbooks />
                  <Console />
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
