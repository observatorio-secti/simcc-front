import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Providers } from '@/app/providers';
import { initTheme } from '@/shared/lib/theme';
import '@/app/styles.css';

initTheme();

const root = document.getElementById('root');
if (!root) throw new Error('Elemento #root não encontrado no index.html.');

createRoot(root).render(
  <StrictMode>
    <Providers />
  </StrictMode>,
);
