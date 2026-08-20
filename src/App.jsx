import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import LabMetrics from './components/LabMetrics'
import Projects from './components/Projects'
import Timeline from './components/Timeline'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        {/* Los números primero; abajo, los labs que los produjeron */}
        <LabMetrics />
        <Projects />
        <Timeline />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
