import { useContenido } from '../../i18n/LanguageProvider'
import Vista, { EncabezadoVista } from '../ui/Vista'
import SystemStatus from '../SystemStatus'
import Telemetry from '../Telemetry'
import Topology from '../Topology'
import SloCalculator from '../SloCalculator'
import LabMetrics from '../LabMetrics'

// ─────────────────────────────────────────────────────────────
//  Vista 2 — Observabilidad & Telemetría.
//
//  Todo lo que mide, en orden de "qué está pasando ahora" a "qué salió
//  de haberlo medido":
//
//    · el panel de estado en vivo, que es la comprobación de que lo de
//      abajo no es una maqueta;
//    · el tablero DORA con sus anotaciones y el p95 de latencia, que
//      salen de la misma ventana de datos;
//    · la topología, que dice sobre qué corre todo eso;
//    · el presupuesto de error, que convierte un SLO en minutos que se
//      pueden gastar;
//    · las métricas de los labs, que son las que se midieron a mano y
//      tienen bitácora publicada.
//
//  Lo que rompe estos números a propósito está en la otra vista, y no
//  por prolijidad: un simulacro corriendo allá se ve acá igual —el panel
//  de estado se pinta de rojo y el tablero avisa que sus números no lo
//  acusan—, porque las vistas visitadas siguen montadas.
// ─────────────────────────────────────────────────────────────
export default function VistaObservabilidad() {
  const { ui } = useContenido()
  const t = ui.vistas.observabilidad

  return (
    <Vista id="observabilidad" titulo={t.titulo}>
      <EncabezadoVista label={t.label} titulo={t.titulo} bajada={t.bajada} />

      {/* El panel de estado trae su propio `container-x`: va pegado a la
          cabecera y ancho completo, como el banner que es. */}
      <div className="pt-10">
        <SystemStatus />
      </div>

      <div className="container-x space-y-16 pb-24 pt-8">
        <Telemetry />
        <Topology />
        <SloCalculator />
        <LabMetrics />
      </div>
    </Vista>
  )
}
