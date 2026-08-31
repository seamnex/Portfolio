// ─────────────────────────────────────────────────────────────
//  Líneas de bitácora del Command Center.
//
//  Está separado del proveedor por el mismo motivo que `lineaDeFase()` en
//  `caos.js` y que el intérprete entero de la consola: son funciones
//  puras, así que se pueden ejercitar en Node —los quince pasos, en los
//  dos idiomas, en menos de un segundo— sin montar React ni un navegador.
//
//  Ese barrido es lo que caza el bug típico de esta clase de feature: un
//  paso al que nadie tradujo el título sale como `undefined` en el medio
//  de un runbook que pretende parecer un procedimiento real, y solo se
//  ve si alguien abre ese runbook, en ese idioma, y llega hasta ese paso.
// ─────────────────────────────────────────────────────────────

/** Cabecera: qué runbook se abrió, con qué señal y con qué rótulo. */
export function lineasApertura(playbook, ui, ahora = Date.now()) {
  const texto = ui.playbooks.escenarios[playbook.id]
  return [
    {
      id: `${playbook.id}:cabecera:${ahora}`,
      tipo: 'cabecera',
      nivel: 'accent',
      texto: ui.playbooks.consola.abriendo(texto.titulo),
    },
    // El rótulo de "salida ilustrativa" va DENTRO del bloque, no solo en
    // el aviso de la sección: quien copie estas líneas a un ticket se
    // lleva la aclaración pegada.
    {
      id: `${playbook.id}:aviso:${ahora}`,
      tipo: 'aviso',
      nivel: 'muted',
      texto: ui.playbooks.consola.aviso,
    },
    {
      id: `${playbook.id}:senal:${ahora}`,
      tipo: 'senal',
      nivel: 'warn',
      texto: `${ui.playbooks.consola.senal}: ${playbook.senal}`,
    },
  ]
}

/**
 * Las líneas de un paso: qué se hace, por qué, el comando y su salida.
 *
 * El "por qué" va antes del comando a propósito. Un runbook que solo
 * lista comandos se puede seguir sin entender nada, y entonces no
 * enseña: lo que hay que poder reconstruir después es el criterio.
 */
export function lineasDePaso(playbook, indice, ui, ahora = Date.now()) {
  const paso = playbook.pasos[indice]
  if (!paso) return []

  const texto = ui.playbooks.escenarios[playbook.id].pasos[paso.id]
  const cabecera = `${ui.playbooks.consola.paso(indice + 1, playbook.pasos.length)} · ${texto.titulo}`

  return [
    { id: `${playbook.id}:${paso.id}:titulo:${ahora}`, tipo: 'paso', nivel: 'accent', texto: cabecera },
    { id: `${playbook.id}:${paso.id}:porque:${ahora}`, tipo: 'porque', nivel: 'muted', texto: texto.porQue },
    { id: `${playbook.id}:${paso.id}:cmd:${ahora}`, tipo: 'comando', nivel: undefined, texto: paso.comando },
    ...paso.salida.map((linea, i) => ({
      id: `${playbook.id}:${paso.id}:out${i}:${ahora}`,
      tipo: 'salida',
      nivel: paso.tone,
      texto: linea,
    })),
  ]
}

/**
 * Línea de cierre. `motivo` es 'terminado', 'reiniciado' o 'cerrado':
 * los tres son finales distintos y el registro tiene que distinguirlos.
 */
export function lineaCierre(playbook, motivo, ui, ahora = Date.now()) {
  const texto = ui.playbooks.escenarios[playbook.id]
  const nivel = motivo === 'terminado' ? 'ok' : motivo === 'reiniciado' ? 'warn' : 'muted'
  return {
    id: `${playbook.id}:${motivo}:${ahora}`,
    tipo: motivo === 'reiniciado' ? 'cabecera' : 'cierre',
    nivel,
    texto: ui.playbooks.consola[motivo](texto.titulo),
  }
}

/** ¿Queda algún paso por correr? */
export function quedanPasos(playbook, paso) {
  return Boolean(playbook) && paso + 1 < playbook.pasos.length
}
