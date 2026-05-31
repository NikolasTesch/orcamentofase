import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Design System — fonte da verdade visual (importada na ordem do guia HTML).
import './styles/fase-tokens.css'
import './styles/fase-guide.css'
import './styles/fase-components.css'
import './styles/app.css'

// Registra o custom element <image-slot> (efeito colateral).
import './lib/image-slot.js'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
