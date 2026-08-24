import { LanguageProvider } from './i18n/LanguageProvider'
import { EstadoProvider } from './estado/EstadoProvider'
import { CaosProvider } from './caos/CaosProvider'
import { TelemetriaProvider } from './telemetria/TelemetriaProvider'
import { PostMortemProvider } from './postmortem/PostMortemProvider'
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
import Console from './components/Console'
import Timeline from './components/Timeline'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    // Idioma afuera: todos los demás leen textos traducidos. Después, en
    // orden de dependencia: caos arma sus líneas de bitácora con `ui`, y la
    // consola —que vive dentro de post-mortems— consulta estado y caos.
    // Telemetría va después de caos porque el tablero avisa cuando hay un
    // simulacro en curso, aunque sus números no dependan de él.
    <LanguageProvider>
      <EstadoProvider>
        <CaosProvider>
          <TelemetriaProvider>
            <PostMortemProvider>
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
                <Console />
                <Timeline />
                <Contact />
              </main>
              <Footer />
            </PostMortemProvider>
          </TelemetriaProvider>
        </CaosProvider>
      </EstadoProvider>
    </LanguageProvider>
  )
}
