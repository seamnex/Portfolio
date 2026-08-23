// ─────────────────────────────────────────────────────────────
//  Bitácora de incidentes (ES) — post-mortems de laboratorio.
//
//  HONESTIDAD, que acá importa más que en ninguna otra sección:
//  estas fallas fueron INYECTADAS a propósito en mis labs. No son
//  incidentes de producción de un empleador, y la sección lo dice
//  arriba de todo. Lo que se evalúa no es el evento sino el método:
//  cómo se detecta, cómo se prueba una hipótesis y qué se corrige.
//
//  Cada dato numérico sale de `medidas.js`, que a su vez sale de una
//  corrida con bitácora publicada en el repo del lab. Las líneas de
//  timeline son SOLO los instantes que están medidos: no hay pasos
//  intermedios inventados para que el relato quede más prolijo.
// ─────────────────────────────────────────────────────────────
import { MEDIDAS as M, num } from './medidas.js'

const n = (v) => num(v, 'es')

export const incidentesMeta = {
  label: 'Bitácora de incidentes',
  titulo: 'Post-mortems: el formato que uso cuando el evento es real',
  bajada:
    'Cuatro fallas inyectadas a propósito en los labs, documentadas con la misma estructura que un post-mortem de producción: línea de tiempo, causa raíz, impacto y acciones correctivas con su costo. El valor no está en el incidente —lo provoqué yo— sino en el método y en lo que cada uno dejó medido.',
  aviso:
    'Fallas inyectadas en entorno de laboratorio, no incidentes de producción de un empleador. Cada número enlaza a la bitácora del repo donde se midió.',
  cta: 'Abrir post-mortem',
  pista: 'Dentro del reporte: ← → cambian de incidente · Esc cierra',
}

export const incidentes = [
  {
    id: 'inc-5xx',
    codigo: 'INC-2026-01',
    titulo: 'Pico de HTTP 5xx y remediación automática',
    resumen:
      'Degradación inyectada al 5xx, detectada por regla de umbral y cortada por un runbook automático. El hallazgo no fue el incidente: fue descubrir que 45 de los 75 s de MTTR los ponía el instrumento de medición.',
    severidad: 'P1',
    tono: 'crit',
    servicio: 'api-demo · stack Elasticsearch + Kibana',
    lab: 'observability-lab',
    fecha: 'Agosto 2026',
    estado: 'Cerrado',
    duracion: `${n(M.mttr)} s`,
    impactoUsuario: 'Simulado: tasa de error elevada durante la ventana del experimento',
    deteccion: `Regla de umbral: > ${M.umbralPorcentaje} % de 5xx sobre ventana deslizante de ${M.ventanaSegundos} s`,
    metricas: [
      { k: 'MTTD', v: `${n(M.mttd)} s`, tone: 'crit' },
      { k: 'MTTR', v: `${n(M.mttr)} s`, tone: 'warn' },
      { k: 'Latencia del instrumento', v: `${n(M.ventanaInstrumento[0])} s`, tone: 'muted' },
    ],
    timeline: [
      {
        t: 'T+0 s',
        texto:
          'El generador inyecta la degradación y escribe un marcador en Elasticsearch. Ese marcador —no un cronómetro— es el origen de tiempo de todo lo que sigue.',
        tone: 'crit',
      },
      {
        t: `T+${n(M.mttd)} s`,
        texto: `La regla de umbral supera el ${M.umbralPorcentaje} % de 5xx en la ventana de ${M.ventanaSegundos} s y dispara la alerta. Esto es el MTTD medido.`,
        tone: 'warn',
      },
      {
        t: `T+${n(M.mttr)} s`,
        texto:
          'El runbook automático corta la falla de verdad —no la simula— y la tasa de error vuelve al piso. Cierre del ciclo: MTTR total.',
        tone: 'ok',
      },
    ],
    causaRaiz: [
      'Causa del evento: degradación inducida a propósito por el generador de carga. No hay misterio ahí, y el post-mortem no pretende que lo haya.',
      `Causa del MTTD: la ventana deslizante de ${M.ventanaSegundos} s necesita acumular muestras antes de que el porcentaje cruce el umbral. La alerta no puede ser más rápida que la ventana que la alimenta.`,
      `Hallazgo no buscado: ${n(M.ventanaInstrumento[0])} s y ${n(M.ventanaInstrumento[1])} s de latencia en dos corridas cuyos MTTD diferían a más del doble. Esa constancia prueba que ese tramo es del instrumento, no del sistema.`,
    ],
    impacto:
      `Sobre el usuario, ninguno: es un lab. Sobre la medición, mucho — más de la mitad del MTTR reportado no era el incidente. Si ese mismo instrumento midiera producción, el número que llega al negocio vendría inflado en ~${n(M.ventanaInstrumento[0])} s por evento y nadie lo notaría.`,
    acciones: [
      {
        texto: `Regla alternativa con una sola evaluación sobre el umbral: baja el MTTD a ${n(M.mttdSensible)} s.`,
        estado: 'Verificado',
      },
      {
        texto:
          'Documentar el costo de esa regla: dispara con cualquier pico transitorio. Queda como opción consciente, no como default.',
        estado: 'Hecho',
      },
      {
        texto:
          'Piso mínimo de muestras en la regla: sin él, dos peticiones fallidas sobre tres dan 66 % de error y alertan por nada.',
        estado: 'Hecho',
      },
      {
        texto:
          'Reportar el MTTR separando incidente e instrumento. Un solo número junta dos cosas que se arreglan distinto.',
        estado: 'Hecho',
      },
    ],
    leccion:
      'Antes de perseguir el MTTR del sistema conviene medir el de la herramienta que lo mide. Parte de lo que se reporta como tiempo de resolución es latencia de la propia observabilidad.',
    repo: 'https://github.com/seamnex/observability-lab#bitácora-de-corridas',
  },

  {
    id: 'inc-rolling',
    codigo: 'INC-2026-02',
    titulo: 'Peticiones perdidas durante un rolling update',
    resumen:
      'Un deploy aparentemente limpio perdía 8 de cada 425 peticiones. No eran 5xx: eran código 000 —conexión rechazada—, invisibles para cualquier monitor que solo mire status codes.',
    severidad: 'P2',
    tono: 'warn',
    servicio: 'Deployment nginx · Service ClusterIP',
    lab: 'k8s-lab',
    fecha: 'Agosto 2026',
    estado: 'Cerrado · corregido y verificado',
    duracion: 'Ventana del rollout',
    impactoUsuario: `${M.rollingFallosSinHook} de ${M.rollingTotalSinHook} peticiones sin respuesta (${n(M.rollingPorcentajeSinHook)} %)`,
    deteccion: 'Sonda externa contra el Service durante el rollout, contando códigos de respuesta',
    metricas: [
      { k: 'Antes del fix', v: `${M.rollingFallosSinHook} / ${M.rollingTotalSinHook}`, tone: 'crit' },
      { k: 'Después del fix', v: `${M.rollingFallosConHook} / ${M.rollingTotalConHook}`, tone: 'ok' },
      { k: 'Costo del fix', v: `+${n(M.rolloutCostoSegundos)} s de rollout`, tone: 'muted' },
    ],
    timeline: [
      {
        t: 'Rollout',
        texto:
          'Arranca el rolling update. Kubernetes reporta el deploy como exitoso: ningún pod quedó en CrashLoop y el estado final es el esperado.',
        tone: 'muted',
      },
      {
        t: 'Durante',
        texto: `La sonda registra ${M.rollingFallosSinHook} fallos en ${M.rollingTotalSinHook} peticiones (${n(M.rollingPorcentajeSinHook)} %). El detalle que importa: código 000, no 5xx. El servidor no respondió mal — no respondió.`,
        tone: 'crit',
      },
      {
        t: 'Diagnóstico',
        texto:
          'kube-proxy seguía ruteando a un pod cuyo nginx ya había cerrado el listener. La baja del endpoint en el Service y el SIGTERM al contenedor son asincrónicos: nada garantiza el orden.',
        tone: 'warn',
      },
      {
        t: 'Fix',
        texto: `preStop hook de ${M.preStopSegundos} s: el contenedor espera antes de terminar, y para cuando cierra, la baja del endpoint ya se propagó.`,
        tone: 'accent',
      },
      {
        t: 'Verificación',
        texto: `A/B en el mismo cluster y la misma sesión, alternando solo el hook: ${M.rollingFallosConHook} fallos en ${M.rollingTotalConHook} peticiones.`,
        tone: 'ok',
      },
    ],
    causaRaiz: [
      'Carrera entre dos eventos concurrentes: la baja del pod del Service (que propaga kube-proxy) y el cierre del proceso dentro del contenedor. Kubernetes los dispara juntos y no ordena.',
      'Mientras la propagación va en camino, kube-proxy manda tráfico a un listener que ya no existe: connection refused, que el cliente ve como código 000.',
      'Por qué pasó desapercibido tanto tiempo: un dashboard de tasa de 5xx da verde perfecto durante todo el evento. El fallo no llega a generar una respuesta HTTP.',
    ],
    impacto:
      `${n(M.rollingPorcentajeSinHook)} % del tráfico durante cada ventana de deploy. En un lab es una anécdota; en un sistema que despliega varias veces por día, es una tasa de error recurrente que ningún tablero muestra y que se atribuye a "algo de red".`,
    acciones: [
      { texto: `preStop hook de ${M.preStopSegundos} s en el Deployment.`, estado: 'Hecho' },
      {
        texto: `Aceptar el costo explícitamente: el rollout tarda ~${n(M.rolloutCostoSegundos)} s más. Barato al lado de ${n(M.rollingPorcentajeSinHook)} % de peticiones perdidas.`,
        estado: 'Hecho',
      },
      {
        texto: 'Validar la hipótesis como A/B antes de darla por buena, no por el "después del cambio dejó de pasar".',
        estado: 'Verificado',
      },
      {
        texto: 'Contar códigos de conexión además de status HTTP en la sonda: el 000 es una clase de falla propia.',
        estado: 'Hecho',
      },
    ],
    leccion:
      'Un deploy que Kubernetes reporta como exitoso puede estar perdiendo tráfico. Y si el monitoreo solo mira status codes, la falla no existe para nadie hasta que un usuario la reporta.',
    repo: 'https://github.com/seamnex/k8s-lab#el-fix-cerrar-la-ventana-del-experimento-2',
  },

  {
    id: 'inc-autoheal',
    codigo: 'INC-2026-03',
    titulo: 'Pod eliminado en caliente: auto-healing bajo tráfico',
    resumen:
      'Matar un pod mientras el Service recibe tráfico sostenido. Recuperación a 3/3 Ready en 7,2 s y ninguna petición perdida: el balanceo lo sacó de rotación antes de que la sonda lo notara.',
    severidad: 'P3',
    tono: 'ok',
    servicio: `Deployment de ${M.replicas} réplicas · Kubernetes ${M.kubernetes}`,
    lab: 'k8s-lab',
    fecha: 'Agosto 2026',
    estado: 'Cerrado · sin impacto',
    duracion: `${n(M.autohealing)} s`,
    impactoUsuario: `Ninguno — ${M.autohealingOk} de ${M.autohealingTotal} peticiones respondieron 200`,
    deteccion: `Sonda interna al Service a ~${M.sondaReqPorSegundo} req/s durante todo el experimento`,
    metricas: [
      { k: 'Vuelta a 3/3 Ready', v: `${n(M.autohealing)} s`, tone: 'ok' },
      { k: 'Peticiones OK', v: `${M.autohealingOk} / ${M.autohealingTotal}`, tone: 'ok' },
      { k: 'Impacto al usuario', v: 'Cero', tone: 'ok' },
    ],
    timeline: [
      {
        t: 'T+0 s',
        texto: `Se elimina un pod a mano con tráfico en curso (~${M.sondaReqPorSegundo} req/s contra el Service).`,
        tone: 'warn',
      },
      {
        t: 'Inmediato',
        texto:
          'El endpoint sale del Service. La sonda no registra ni una petición fallida: el balanceo dejó de mandarle tráfico antes de que hiciera falta un reintento.',
        tone: 'ok',
      },
      {
        t: `T+${n(M.autohealing)} s`,
        texto: `El ReplicaSet levanta el reemplazo y el Deployment vuelve a ${M.replicas}/${M.replicas} Ready.`,
        tone: 'ok',
      },
    ],
    causaRaiz: [
      'Falla inyectada: eliminación deliberada de un pod. El objetivo era medir la recuperación, no descubrir una causa.',
      'Lo que el experimento sí explica es el porqué del cero: la baja del endpoint es inmediata cuando el pod se elimina de forma ordenada, así que el tráfico se redirige antes de que alguien reciba un error.',
      `Contraste que da sentido al INC-2026-02: el mismo mecanismo, cuando compite con el cierre del proceso durante un rollout, sí pierde peticiones. El caso feliz y el caso roto se diferencian en el orden, no en el diseño.`,
    ],
    impacto:
      'Ninguno. Vale documentarlo igual: un experimento con resultado limpio establece la línea de base contra la cual se mide el que sale mal.',
    acciones: [
      { texto: 'Registrar el número como línea de base de recuperación del cluster.', estado: 'Hecho' },
      {
        texto: 'Repetir el escenario durante un rollout, donde la terminación no es ordenada. Derivó en el INC-2026-02.',
        estado: 'Hecho',
      },
    ],
    leccion:
      'El auto-healing no es lo mismo que la continuidad del servicio. Acá coincidieron; en el rolling update no. Medir uno no dice nada del otro.',
    repo: 'https://github.com/seamnex/k8s-lab#bitácora-de-experimentos',
  },

  {
    id: 'inc-pdb',
    codigo: 'INC-2026-04',
    titulo: 'Desalojo bloqueado por PodDisruptionBudget (HTTP 429)',
    resumen:
      'Segundo desalojo consecutivo contra la Eviction API: 429. No es una falla — es el control funcionando. Se documenta porque un 429 sin contexto se interpreta como error y se "arregla" borrando el PDB.',
    severidad: 'P4',
    tono: 'accent',
    servicio: `Deployment de ${M.replicas} réplicas · PodDisruptionBudget`,
    lab: 'k8s-lab',
    fecha: 'Agosto 2026',
    estado: 'Cerrado · comportamiento esperado',
    duracion: 'Inmediato',
    impactoUsuario: 'Ninguno — el PDB evitó justamente que lo hubiera',
    deteccion: 'Llamada directa a la Eviction API, revisando el código de respuesta',
    metricas: [
      { k: 'Primer desalojo', v: 'Aceptado', tone: 'ok' },
      { k: 'Segundo desalojo', v: 'HTTP 429', tone: 'accent' },
      { k: 'Réplicas afectadas', v: `1 de ${M.replicas}`, tone: 'muted' },
    ],
    timeline: [
      {
        t: 'Desalojo 1',
        texto: 'La Eviction API acepta el desalojo: queda capacidad suficiente para cumplir el presupuesto de disrupción.',
        tone: 'ok',
      },
      {
        t: 'Desalojo 2',
        texto:
          'La API responde 429 Too Many Requests. Con el pod anterior aún fuera, conceder este dejaría el servicio por debajo del mínimo declarado.',
        tone: 'accent',
      },
      {
        t: 'Lectura',
        texto:
          'El 429 no es un rechazo permanente: es "ahora no". Un drenaje de nodo reintenta hasta que el presupuesto lo permita, y así el mantenimiento se serializa solo.',
        tone: 'muted',
      },
    ],
    causaRaiz: [
      'No hay causa raíz que corregir: el PodDisruptionBudget hizo exactamente lo que se le pidió.',
      'El experimento existe para verificar que el control está activo. Un PDB mal configurado no avisa: se descubre el día del mantenimiento, cuando ya se llevó puesto el servicio.',
      'El riesgo operativo real es de interpretación: quien ve un 429 en medio de un drain sin saber qué es, borra el PDB para "destrabar" y elimina la única protección que había.',
    ],
    impacto:
      'Ninguno sobre el servicio, que es el punto: el presupuesto de disrupción impidió que el mantenimiento bajara la disponibilidad por debajo del mínimo.',
    acciones: [
      { texto: 'Verificar el PDB con la Eviction API en vez de asumir que está bien por estar declarado.', estado: 'Hecho' },
      {
        texto: 'Dejar el 429 documentado en el runbook de drenaje de nodos, con la lectura correcta al lado.',
        estado: 'Hecho',
      },
      {
        texto: 'Incluir el chequeo del PDB en el CI que ya valida los manifiestos con yamllint y kubeconform.',
        estado: 'Pendiente',
      },
    ],
    leccion:
      'Un control de seguridad que nunca se probó es una suposición. Y un código de error sin contexto en un runbook es una invitación a desactivarlo bajo presión.',
    repo: 'https://github.com/seamnex/k8s-lab#bitácora-de-experimentos',
  },
]
