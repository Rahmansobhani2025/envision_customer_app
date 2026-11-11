import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ShopProvider } from './context/ShopContext.tsx';
import ShopGate from './components/ShopGate.tsx';

// Prevent unhandled network fetch rejections from breaking the app
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (event.reason.name === 'TypeError' || event.reason.message?.includes('fetch') || event.reason.message?.includes('Failed to fetch'))) {
    console.warn('Network fetch event gracefully handled:', event.reason);
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ShopProvider>
      <ShopGate>
        <App />
      </ShopGate>
    </ShopProvider>
  </StrictMode>,
);
