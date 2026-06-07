import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LangProvider } from './contexts/LangContext'
import theme from './config/theme/default.json'
import './app.css'
import './style.css'

// Inject theme into :root before first render — no flash, fully synchronous
Object.entries(theme).forEach(([k, v]) =>
  document.documentElement.style.setProperty(k, v)
)

// iOS vh fix — updates --vh on keyboard open/close
function setVh() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}
document.addEventListener('focusin', setVh)
document.addEventListener('focusout', setVh)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>,
)
