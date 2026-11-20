import { useServices } from '@/lib/services';
import { useSettings } from '@/lib/settings';
import { IconButton, MoonIcon, SunIcon } from '@/ui';

/** Switches the whole site between light and dark. The icon shows what a press will give. */
export function ThemeToggle() {
  const { settings } = useServices();
  const dark = useSettings().theme === 'dark';
  return (
    <IconButton
      label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => settings.update({ theme: dark ? 'light' : 'dark' })}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
