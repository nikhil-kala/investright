import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx is executing...');
console.log('Root element:', document.getElementById('root'));

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Error rendering React app:', error);
}
