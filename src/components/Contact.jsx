import { useState } from 'react'
import { Github, Linkedin, Mail, MapPin, Send } from 'lucide-react'
import { contacto, profile } from '../data/content'
import Section from './ui/Section'
import CopyButton from './ui/CopyButton'
import StatusBadge from './ui/StatusBadge'

const inicial = { nombre: '', email: '', mensaje: '' }

export default function Contact() {
  const [form, setForm] = useState(inicial)
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrores((err) => ({ ...err, [name]: undefined }))
  }

  const validar = () => {
    const e = {}
    if (form.nombre.trim().length < 2) e.nombre = 'Ingresá tu nombre'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Ingresá un email válido'
    if (form.mensaje.trim().length < 10) e.mensaje = 'Contame un poco más (mínimo 10 caracteres)'
    return e
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const e2 = validar()
    setErrores(e2)
    if (Object.keys(e2).length) return

    // Sin backend: abre el cliente de correo con el mensaje ya armado.
    // Para producción, reemplazar por un POST a Formspree / EmailJS / API propia.
    const asunto = encodeURIComponent(`Contacto desde el portfolio — ${form.nombre}`)
    const cuerpo = encodeURIComponent(`${form.mensaje}\n\n—\n${form.nombre}\n${form.email}`)
    window.location.href = `mailto:${profile.email}?subject=${asunto}&body=${cuerpo}`

    setEnviado(true)
    setForm(inicial)
    setTimeout(() => setEnviado(false), 6000)
  }

  const inputCls = (campo) =>
    `w-full rounded-lg border bg-base-900/60 px-4 py-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition-colors focus:border-accent/60 focus:ring-1 focus:ring-accent/40 ${
      errores[campo] ? 'border-crit/60' : 'border-base-600'
    }`

  return (
    <Section id="contacto" label="Contacto" titulo={contacto.titulo} bajada={contacto.bajada}>
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
                <span className="font-mono text-[11px] text-slate-500">abrir →</span>
              </a>

              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between gap-3 border-b border-base-600 pb-4 text-sm text-slate-300 transition-colors hover:text-accent"
                >
                  <span className="flex items-center gap-3">
                    <Github size={16} className="text-accent" /> GitHub · Labs y repos
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">abrir →</span>
                </a>
              )}

              <p className="flex items-center gap-3 text-sm text-slate-400">
                <MapPin size={16} className="text-accent" /> {profile.ubicacion}
              </p>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Tiempo de respuesta</p>
            <p className="mt-2 text-sm text-slate-400">
              <span className="font-mono text-ok">&lt; 24 h hábiles</span> — el mismo criterio de SLA que aplico en
              operaciones.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} noValidate className="card p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre" className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Nombre
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={onChange}
                placeholder="Cómo te llamás"
                className={inputCls('nombre')}
              />
              {errores.nombre && <p className="mt-1.5 font-mono text-[11px] text-crit">{errores.nombre}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                placeholder="tu@empresa.com"
                className={inputCls('email')}
              />
              {errores.email && <p className="mt-1.5 font-mono text-[11px] text-crit">{errores.email}</p>}
            </div>

            <div>
              <label htmlFor="mensaje" className="mb-2 block font-mono text-[11px] uppercase tracking-wider text-slate-500">
                Mensaje
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows={6}
                value={form.mensaje}
                onChange={onChange}
                placeholder="Contame sobre la posición, el equipo o el proyecto."
                className={`${inputCls('mensaje')} resize-none`}
              />
              {errores.mensaje && <p className="mt-1.5 font-mono text-[11px] text-crit">{errores.mensaje}</p>}
            </div>

            <button type="submit" className="btn-primary w-full">
              <Send size={16} /> Enviar mensaje
            </button>

            {enviado && (
              <p className="rounded-lg border border-ok/30 bg-ok/10 px-4 py-3 text-center font-mono text-[12px] text-ok">
                Mensaje preparado en tu cliente de correo. ¡Gracias por escribir!
              </p>
            )}

            <p className="text-center font-mono text-[10.5px] text-slate-600">
              El formulario abre tu cliente de correo. También podés escribirme directo a {profile.email}
            </p>
          </div>
        </form>
      </div>
    </Section>
  )
}
