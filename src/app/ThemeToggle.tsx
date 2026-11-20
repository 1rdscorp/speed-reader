import { useSyncExternalStore } from 'react';
import { useServices } from '@/lib/services';
import { useSettings } from '@/lib/settings';
import { IconButton, MoonIcon, SunIcon } from '@/ui';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** Flips between light and dark. Until first used, the app follows the system setting. */
export function ThemeToggle() {
  const { settings } = useServices();
  const { theme } = useSettings();
  const systemIsDark = useSyncExternalStore(
    subscribeToSystemTheme,
    () => window.matchMedia(DARK_QUERY).matches,
  );
  const isDark = theme === 'system' ? systemIsDark : theme === 'dark';

  return (
    <IconButton
      label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => settings.update({ theme: isDark ? 'light' : 'dark' })}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
