import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { RecoilRoot } from 'recoil'
import { Toaster } from 'sonner'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RecoilRoot>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {/* Composant Sonner monté une seule fois */}
        <Toaster richColors position="top-right" />
        <App />
      </BrowserRouter>
    </RecoilRoot>
  </StrictMode>
)
