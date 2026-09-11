import { LanguageProvider } from './i18n/LanguageProvider'
import { VistaProvider, useVista } from './navegacion/VistaProvider'
import { AvisosProvider } from './avisos/AvisosProvider'
import { EstadoProvider } from './estado/EstadoProvider'
import { CaosProvider } from './caos/CaosProvider'
import { TelemetriaProvider } from './telemetria/TelemetriaProvider'
import { PostMortemProvider } from './postmortem/PostMortemProvider'
import { PlaybookProvider } from './playbooks/PlaybookProvider'
import Navbar from './components/Navbar'
import VistaPerfil from './components/vistas/VistaPerfil'
import VistaObservabilidad from './components/vistas/VistaObservabilidad'
import VistaLaboratorio from './components/vistas/VistaLaboratorio'
import Footer from './components/Footer'

// Un único `<main>` para las tres vistas: las que no están activas se
// ocultan, no se desmontan, y tener tres `<main>` en el documento —aunque
// dos estén escondidos— es un landmark repetido para quien navega con
// lector de pantalla.
//
// El montaje sí es perezoso: una vista no aparece en el árbol hasta que
// alguien la pide. Quien entra a leer el perfil no paga el muestreo de
// latencia del tablero ni el intérprete de la consola. Una vez montada
// se queda, que es lo que hace que un simulacro sobreviva al cambio de
// pestaña.
function Vistas() {
  const { montadas } = useVista()

  return (
    <main>
      <VistaPerfil />
      {montadas.includes('observabilidad') && <VistaObservabilidad />}
      {montadas.includes('laboratorio') && <VistaLaboratorio />}
    </main>
  )
}

export default function App() {
  return (
    // Idioma afuera: todos los demás leen textos traducidos. Después las
    // vistas, porque la barra superior y el banner del sandbox necesitan
    // saber cuál está activa. Después los avisos flotantes, porque caos
    // y el formulario de contacto los disparan. Y por último, en orden de
    // dependencia: caos
    // arma sus líneas de bitácora con `ui`, y la consola consulta estado,
    // caos y el runbook abierto. Telemetría va después de caos porque el
    // tablero avisa cuando hay un simulacro en curso, aunque sus números
    // no dependan de él.
    //
    // Los proveedores están todos acá arriba, por encima de las vistas, y
    // ese es el punto: son ellos los que hacen que un simulacro, un
    // runbook o el scrollback de la consola no se enteren de que el
    // visitante cambió de pestaña.
    <LanguageProvider>
      <VistaProvider>
        <AvisosProvider>
        <EstadoProvider>
          <CaosProvider>
            <TelemetriaProvider>
              <PostMortemProvider>
                <PlaybookProvider>
                  <Navbar />
                  <Vistas />
                  <Footer />
                </PlaybookProvider>
              </PostMortemProvider>
            </TelemetriaProvider>
          </CaosProvider>
        </EstadoProvider>
        </AvisosProvider>
      </VistaProvider>
    </LanguageProvider>
  )
}
