import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/theme-provider.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import QueryProvider from './context/query-provider.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <QueryProvider>
    <ThemeProvider  defaultTheme="system" storageKey="vite-ui-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </QueryProvider>
</StrictMode>
)
