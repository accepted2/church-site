import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@/styles'
import { MetaDataProvider } from "@/context/MetaDataContext";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MetaDataProvider>
      <App />
    </MetaDataProvider>

  </StrictMode>,
)
