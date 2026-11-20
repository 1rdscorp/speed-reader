import { createContext, use } from 'react';
import type { DocumentRepository } from '@/lib/documents';
import type { TextImporter } from '@/lib/import';
import type { SettingsStore } from '@/lib/settings';

/**
 * The app's long-lived collaborators. Components reach them through
 * `useServices()` rather than importing singletons, so tests (and later, other
 * backends) can supply their own. New stages add their service here.
 */
export interface Services {
  documents: DocumentRepository;
  settings: SettingsStore;
  importer: TextImporter;
}

export const ServicesContext = createContext<Services | null>(null);

export function useServices(): Services {
  const services = use(ServicesContext);
  if (!services) throw new Error('useServices must be used inside <ServicesContext>');
  return services;
}
