import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AudioProvider } from './context/AudioContext';
import App from './App';
import './styles/global.css';
import './styles/animations.css';
import './styles/layout.css';
import './styles/components.css';
import '@dotlottie/player-component';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
