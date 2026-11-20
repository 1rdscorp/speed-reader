import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { App } from '@/app/App';
import { buildRoutes } from '@/app/routes';
import { createDocumentRepository } from '@/lib/documents';
import type { Services } from '@/lib/services';
import { SettingsStore } from '@/lib/settings';
import { createMemoryStore } from '@/lib/storage';

/** Services backed by memory, for tests. */
export function createTestServices(): Services {
  const store = createMemoryStore();
  return {
    documents: createDocumentRepository(store),
    settings: new SettingsStore(store),
  };
}

/** Render the whole app at a URL, with in-memory routing and storage. */
export function renderApp(path = '/', services: Services = createTestServices()) {
  const router = createMemoryRouter(buildRoutes(), { initialEntries: [path] });
  return {
    services,
    router,
    user: userEvent.setup(),
    ...render(<App services={services} router={router} />),
  };
}
