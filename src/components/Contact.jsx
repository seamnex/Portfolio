import { useState } from 'react'
import { Github, Linkedin, Loader2, Mail, MapPin, Send } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
import { useAvisos } from '../avisos/AvisosProvider'
import Section from './ui/Section'
import CopyButton from './ui/CopyButton'
import StatusBadge from './ui/StatusBadge'

const inicial = { nombre: '', email: '', mensaje: '' }

// ID del formulario de Formspree (VITE_FORMSPREE_ID en .env / Vercel).
// Si no está configurado, el formulario cae al comportamiento anterior —
// abrir el cliente de correo— en vez de romperse: preferible un envío
// incómodo a un botón que no hace nada.
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID
const ENDPOINT = FORMSPREE_ID ? `https://formspree.io/f/${FORMSPREE_ID}` : null

// Más de esto y el "Enviando…" deja de ser una espera y pasa a ser un
// botón colgado. Se corta y se avisa, con el mailto a mano.
const TIMEOUT_MS = 12000

export default function Contact() {
  const { contacto, profile, ui } = useContenido()
  const { avisar } = useAvisos()
  const [form, setForm] = useState(inicial)
  const [errores, setErrores] = useState({})
  // Qué campos ya se tocaron: el error de un campo se muestra al salir de
  // él, no mientras se tipea la primera letra. Al enviar se marcan todos.
  const [tocados, setTocados] = useState({})
  // idle → enviando → ok | error
  const [estado, setEstado] = useState('idle')

  const validarCampo = (campo, valor) => {
    if (campo === 'nombre' && valor.trim().length < 2) return ui.form.errores.nombre
    if (campo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) return ui.form.errores.email
    if (campo === 'mensaje' && valor.trim().length < 10) return ui.form.errores.mensaje
    return undefined
  }

  const validar = (datos = form) => {
    const e = {}
    for (const campo of Object.keys(inicial)) {
      const error = validarCampo(campo, datos[campo])
      if (error) e[campo] = error
    }
    return e
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    // Un campo ya marcado como erróneo se revalida al tipear, para que el
    // mensaje desaparezca en cuanto el valor es válido y no al salir.
    if (tocados[name]) setErrores((err) => ({ ...err, [name]: validarCampo(name, value) }))
  }

  const onBlur = (e) => {
    const { name, value } = e.target
    setTocados((t) => ({ ...t, [name]: true }))
    setErrores((err) => ({ ...err, [name]: validarCampo(name, value) }))
  }

  const abrirMailto = () => {
    const asunto = encodeURIComponent(ui.form.asunto(form.nombre))
    const cuerpo = encodeURIComponent(`${form.mensaje}\n\n—\n${form.nombre}\n${form.email}`)
    window.location.href = `mailto:${profile.email}?subject=${asunto}&body=${cuerpo}`
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const e2 = validar()
    setErrores(e2)
    setTocados({ nombre: true, email: true, mensaje: true })
    if (Object.keys(e2).length) {
      // Foco al primer campo con error: quien envió con el teclado no
      // tiene por qué buscar cuál fue.
      document.getElementById(Object.keys(e2)[0])?.focus()
      return
    }

    // Sin ID configurado el sitio sigue funcionando como antes, con mailto.
    if (!ENDPOINT) {
      abrirMailto()
      setEstado('ok')
      setForm(inicial)
      setTocados({})
      avisar({ estado: 'info', titulo: ui.form.okMailto })
      setTimeout(() => setEstado('idle'), 6000)
      return
    }

    setEstado('enviando')
    const control = new AbortController()
    const corte = setTimeout(() => control.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        signal: control.signal,
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          mensaje: form.mensaje,
          _subject: ui.form.asunto(form.nombre),
        }),
      })
      if (!res.ok) {
        // Formspree contesta con `errors[]` legibles (formulario inactivo,
        // email inválido para su validación, cuota agotada). Se registran
        // para diagnosticar desde la consola; al visitante le va el aviso
        // genérico con la salida por mailto.
        const cuerpo = await res.json().catch(() => null)
        throw new Error(`HTTP ${res.status}${cuerpo?.errors ? ` · ${cuerpo.errors.map((x) => x.message).join('; ')}` : ''}`)
      }
      setEstado('ok')
      setForm(inicial)
      setTocados({})
      avisar({ estado: 'resolved', titulo: ui.form.okFormspree, meta: ui.form.avisoMeta })
      setTimeout(() => setEstado('idle'), 8000)
    } catch (err) {
      // Sin backend propio no hay reintento que valga: lo honesto es avisar
      // y dejar la vía directa a mano, no tragarse el error en silencio.
      console.error('contacto → formspree', err)
      setEstado('error')
      avisar({ estado: 'error', titulo: ui.form.error, detalle: ui.form.errorDetalle(profile.email) })
    } finally {
      clearTimeout(corte)
    }
  }

  const inputCls = (campo) =>
    `w-full rounded-lg border bg-base-900/60 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40 ${
      errores[campo] ? 'border-crit/60' : 'border-base-600'
    }`

  // Atributos que comparten los tres campos: el error se enlaza por
  // `aria-describedby` para que el lector de pantalla lo lea con el campo.
  const a11y = (campo) => ({
    'aria-invalid': Boolean(errores[campo]),
    'aria-describedby': errores[campo] ? `${campo}-error` : undefined,
  })

  return (
    <Section id="contacto" label={contacto.label} titulo={contacto.titulo} bajada={contacto.bajada}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Datos directos */}
        <div className="space-y-4">
          <div className="card p-6">
            <StatusBadge texto={profile.disponibilidad} tone="ok" />

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-base-600 pb-4">
                <span className="flex items-center gap-3 text-sm text-slate-300">
                  <Mail size={16} className="text-accent" /> {profile.email}
                </span>
                <CopyButton value={profile.email} />
              </div>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center justify-between gap-3 border-b border-base-600 pb-4 text-sm text-slate-300 transition-colors hover:text-accent"
              >
                <span className="flex items-center gap-3">
                  <Linkedin size={16} className="text-accent" /> /in/samuel-garcia-baciliadis
                </span>
                <span className="font-mono text-[11px] text-slate-500">{ui.acciones.abrir}</span>
              </a>

              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between gap-3 border-b border-base-600 pb-4 text-sm text-slate-300 transition-colors hover:text-accent"
                >
                  <span className="flex items-center gap-3">
                    <Github size={16} className="text-accent" /> {ui.form.githubLinea}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{ui.acciones.abrir}</span>
                </a>
              )}

              <p className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin size={16} className="text-accent" /> {profile.ubicacion}
              </p>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{ui.form.tiempoRespuesta}</p>
            <p className="mt-2 text-sm text-slate-400">
              <span className="font-mono text-ok">{ui.form.sla}</span> {ui.form.slaTexto}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} noValidate className="card p-6">
          <div className="space-y-4">
            {/* Honeypot: los bots completan todo, las personas no ven este campo.
                Formspree descarta el envío si viene con contenido. */}
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
            />

            <div>
              <label htmlFor="nombre" className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
                {ui.form.nombre}
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={ui.form.nombrePlaceholder}
                {...a11y('nombre')}
                className={inputCls('nombre')}
              />
              {errores.nombre && (
                <p id="nombre-error" className="mt-1.5 font-mono text-[11px] text-crit">
                  {errores.nombre}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
                {ui.form.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={ui.form.emailPlaceholder}
                {...a11y('email')}
                className={inputCls('email')}
              />
              {errores.email && (
                <p id="email-error" className="mt-1.5 font-mono text-[11px] text-crit">
                  {errores.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="mensaje" className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
                {ui.form.mensaje}
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={6}
                value={form.mensaje}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={ui.form.mensajePlaceholder}
                {...a11y('mensaje')}
                className={`${inputCls('mensaje')} resize-none`}
              />
              {errores.mensaje && (
                <p id="mensaje-error" className="mt-1.5 font-mono text-[11px] text-crit">
                  {errores.mensaje}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={estado === 'enviando'}
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {estado === 'enviando' ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> {ui.form.enviando}
                </>
              ) : (
                <>
                  <Send size={16} /> {ui.form.enviar}
                </>
              )}
            </button>

            <div aria-live="polite">
              {estado === 'ok' && (
                <p className="rounded-lg border border-ok/30 bg-ok/10 px-4 py-3 text-center font-mono text-[12px] text-ok">
                  {ENDPOINT ? ui.form.okFormspree : ui.form.okMailto}
                </p>
              )}

              {estado === 'error' && (
                <p className="rounded-lg border border-crit/30 bg-crit/10 px-4 py-3 text-center font-mono text-[12px] text-crit">
                  {ui.form.error}{' '}
                  <button
                    type="button"
                    onClick={abrirMailto}
                    className="underline underline-offset-2 hover:text-crit/80"
                  >
                    {ui.form.errorCta}
                  </button>{' '}
                  {ui.form.errorCola(profile.email)}
                </p>
              )}
            </div>

            <p className="text-center font-mono text-[10.5px] text-slate-600">
              {ENDPOINT ? ui.form.pieFormspree(profile.email) : ui.form.pieMailto(profile.email)}
            </p>
          </div>
        </form>
      </div>
    </Section>
  )
}
