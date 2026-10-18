import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { RouterProvider } from './lib/router'
import { AuthProvider } from './providers/AuthProvider'
import { AccountSettingsSync } from './providers/AccountSettingsSync'
import { SettingsProvider } from './providers/SettingsProvider'
import { ToastProvider } from './providers/ToastProvider'
import { registerServiceWorker } from './pwa/registerSW'
import './styles/tokens.css'
import './styles/preferences.css'
import './styles/app.css'
import './styles/ui.css'
import './styles/screens.css'
import './styles/admin.css'
import './styles/landing.css'
import './styles/legal.css'

registerServiceWorker()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <SettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <AccountSettingsSync />
            <App />
          </AuthProvider>
        </ToastProvider>
      </SettingsProvider>
    </RouterProvider>
  </StrictMode>,
)
