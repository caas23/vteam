// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  /* StrictMode causes issues with OAuth due to double fetching --> disabling*/
  
  // <StrictMode>
    <App />
  // </StrictMode>,
)
