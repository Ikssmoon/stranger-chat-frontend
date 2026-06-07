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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>,
)
