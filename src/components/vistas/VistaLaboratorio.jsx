import { useContenido } from '../../i18n/LanguageProvider'
import Vista, { EncabezadoVista } from '../ui/Vista'
import ChaosPanel from '../ChaosPanel'
import Playbooks from '../Playbooks'
import Console from '../Console'
import Incidents from '../Incidents'
import Projects from '../Projects'

// ─────────────────────────────────────────────────────────────
//  Vista 3 — Chaos & Incident Lab.
//
//  El ciclo completo de un incidente, en el orden en que ocurre:
//
//    · el sandbox de caos inyecta el fallo;
//    · el Command Center abre el runbook que corresponde y lo lleva paso
//      a paso;
//    · la consola es la salida compartida de los dos —cada fase de un
//      simulacro y cada paso de un runbook se escriben ahí—, por eso va
//      debajo de ambos y no adentro de ninguno;
//    · los post-mortems son lo que quedó escrito de los incidentes que
//      pasaron de verdad, y los labs, el código donde pasaron.
//
//  Nada de esto se cancela al cambiar de vista: el simulacro sigue su
//  cuenta regresiva y el runbook se queda en el paso donde estaba.
// ─────────────────────────────────────────────────────────────
export default function VistaLaboratorio() {
  const { ui } = useContenido()
  const t = ui.vistas.laboratorio

  return (
    <Vista id="laboratorio" titulo={t.titulo}>
      <EncabezadoVista label={t.label} titulo={t.titulo} bajada={t.bajada} />

      <div className="container-x space-y-16 pb-24 pt-14">
        <ChaosPanel />
        <Playbooks />
        <Console />
        <Incidents />
        <Projects />
      </div>
    </Vista>
  )
}
