
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from './components/ui/toaster'
import { DirectionProvider } from '@radix-ui/react-direction'

createRoot(document.getElementById("root")!).render(
  <DirectionProvider dir="ltr">
    <App />
    <Toaster />
  </DirectionProvider>
);
