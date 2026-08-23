import { useState } from 'react'
import { Github, Linkedin, Loader2, Mail, MapPin, Send } from 'lucide-react'
import { useContenido } from '../i18n/LanguageProvider'
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

export default function Contact() {
  const { contacto, profile, ui } = useContenido()
  const [form, setForm] = useState(inicial)
  const [errores, setErrores] = useState({})
  // idle → enviando → ok | error
  const [estado, setEstado] = useState('idle')

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrores((err) => ({ ...err, [name]: undefined }))
  }

  const validar = () => {
    const e = {}
    if (form.nombre.trim().length < 2) e.nombre = ui.form.errores.nombre
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = ui.form.errores.email
    if (form.mensaje.trim().length < 10) e.mensaje = ui.form.errores.mensaje
    return e
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
    if (Object.keys(e2).length) return

    // Sin ID configurado el sitio sigue funcionando como antes, con mailto.
    if (!ENDPOINT) {
      abrirMailto()
      setEstado('ok')
      setForm(inicial)
      setTimeout(() => setEstado('idle'), 6000)
      return
    }

    setEstado('enviando')
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          mensaje: form.mensaje,
          _subject: ui.form.asunto(form.nombre),
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setEstado('ok')
      setForm(inicial)
      setTimeout(() => setEstado('idle'), 8000)
    } catch {
      // Sin backend propio no hay reintento que valga: lo honesto es avisar
      // y dejar la vía directa a mano, no tragarse el error en silencio.
      setEstado('error')
    }
  }

  const inputCls = (campo) =>
    `w-full rounded-lg border bg-base-900/60 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40 ${
      errores[campo] ? 'border-crit/60' : 'border-base-600'
    }`

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
                placeholder={ui.form.nombrePlaceholder}
                className={inputCls('nombre')}
              />
              {errores.nombre && <p className="mt-1.5 font-mono text-[11px] text-crit">{errores.nombre}</p>}
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
                placeholder={ui.form.emailPlaceholder}
                className={inputCls('email')}
              />
              {errores.email && <p className="mt-1.5 font-mono text-[11px] text-crit">{errores.email}</p>}
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
                placeholder={ui.form.mensajePlaceholder}
                className={`${inputCls('mensaje')} resize-none`}
              />
              {errores.mensaje && <p className="mt-1.5 font-mono text-[11px] text-crit">{errores.mensaje}</p>}
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
