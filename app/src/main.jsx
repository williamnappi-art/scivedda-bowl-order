import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n.js'
import BowlOrderApp from './BowlOrderApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BowlOrderApp />
  </StrictMode>,
)
