import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Styles — import order matters: reset → tokens → globals → (components import their own)
import '@/styles/reset.css';
import '@/styles/tokens.css';
import './index.css'; // globals + existing component styles (refactor progressively)

import App from './App.tsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[main.tsx] Could not find #root element. Check that index.html has <div id="root"></div>.',
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
