import type { DataRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ServicesContext, type Services } from '@/lib/services';

export function App({ services, router }: { services: Services; router: DataRouter }) {
  return (
    <ServicesContext value={services}>
      <RouterProvider router={router} />
    </ServicesContext>
  );
}
