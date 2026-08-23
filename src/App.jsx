import { LanguageProvider } from './i18n/LanguageProvider'
import { EstadoProvider } from './estado/EstadoProvider'
import { PostMortemProvider } from './postmortem/PostMortemProvider'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import SystemStatus from './components/SystemStatus'
import About from './components/About'
import Skills from './components/Skills'
import LabMetrics from './components/LabMetrics'
import Incidents from './components/Incidents'
import Projects from './components/Projects'
import Console from './components/Console'
import Timeline from './components/Timeline'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    // Idioma afuera: los otros dos leen textos traducidos. Estado antes que
    // post-mortems porque la consola —que vive dentro del segundo— consulta
    // el primero.
    <LanguageProvider>
      <EstadoProvider>
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
            <Incidents />
            <Projects />
            <Console />
            <Timeline />
            <Contact />
          </main>
          <Footer />
        </PostMortemProvider>
      </EstadoProvider>
    </LanguageProvider>
  )
}
