import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Tipografías servidas desde el propio sitio (antes, Google Fonts): no
// bloquean el render con un pedido a otro dominio, entran en la CSP sin
// excepciones y Google deja de recibir la IP de cada visitante. Son las
// versiones variables, así que un solo archivo cubre todos los pesos.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
