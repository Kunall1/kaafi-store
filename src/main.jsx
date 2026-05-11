import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import { Analytics } from '@vercel/analytics/react'

// AuthProvider wraps the entire app so any component can call useAuth()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Analytics />
    </AuthProvider>
  </StrictMode>,
)
