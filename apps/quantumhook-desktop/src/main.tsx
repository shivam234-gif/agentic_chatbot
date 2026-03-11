import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

window.addEventListener('error', (e) => {
    document.body.innerHTML = `<div style="color: red; background: #111; height: 100vh; padding: 20px; font-family: monospace;">
        <h1>Uncaught Error</h1>
        <pre>${e.error?.stack || e.message}</pre>
    </div>`;
});

window.addEventListener('unhandledrejection', (e) => {
    document.body.innerHTML = `<div style="color: red; background: #111; height: 100vh; padding: 20px; font-family: monospace;">
        <h1>Unhandled Promise Rejection</h1>
        <pre>${e.reason?.stack || e.reason}</pre>
    </div>`;
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
