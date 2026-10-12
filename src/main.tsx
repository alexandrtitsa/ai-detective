import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';
import { CrashScreen } from '@/app/ui/CrashScreen';
import { ErrorBoundary } from '@/app/ui/ErrorBoundary';
import '@/app/styles/index.scss';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={<CrashScreen />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
