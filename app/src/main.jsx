import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import BowlOrderApp from './BowlOrderApp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BowlOrderApp />
  </StrictMode>,
)
