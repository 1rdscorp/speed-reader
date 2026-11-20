import '@fontsource-variable/inter/wght.css';
import '@fontsource-variable/space-grotesk/wght.css';
import './styles/tokens.css';
import './styles/base.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter } from 'react-router';
import { App } from '@/app/App';
import { createServices } from '@/app/createServices';
import { buildRoutes } from '@/app/routes';

async function start() {
  const services = await createServices();
  await services.settings.load();

  // Hash routing keeps deep links working on any static host; see vite.config.ts.
  const router = createHashRouter(buildRoutes());

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App services={services} router={router} />
    </StrictMode>,
  );
}

void start();
