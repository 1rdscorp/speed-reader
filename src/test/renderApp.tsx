import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { App } from '@/app/App';
import { buildRoutes } from '@/app/routes';
import { createDocumentRepository } from '@/lib/documents';
import { createTextImporter, type TextImporterOptions } from '@/lib/import';
import type { Services } from '@/lib/services';
import { SettingsStore } from '@/lib/settings';
import { createStereogramRepository } from '@/lib/stereograms';
import { createMemoryStore } from '@/lib/storage';

/** Services backed by memory, for tests. Pass importer options to switch link import on. */
export function createTestServices(importerOptions?: TextImporterOptions): Services {
  const store = createMemoryStore();
  // A clock that always moves on, so "most recent" is never a tie between documents made in the same millisecond.
  let time = Date.now();
  const clock = () => (time += 1000);
  return {
    documents: createDocumentRepository(store, clock),
    settings: new SettingsStore(store),
    importer: createTextImporter(importerOptions),
    stereograms: createStereogramRepository(store),
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
