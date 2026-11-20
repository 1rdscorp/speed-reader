import { APP_NAME } from '@/lib/config';
import { useServices } from '@/lib/services';
import {
  DEFAULT_SETTINGS,
  DarkReaderSetting,
  FocusColorSetting,
  FontSizeSetting,
  PunctuationSetting,
  SpeedSetting,
  WordsPerFrameSetting,
  useSettings,
  type Settings,
} from '@/lib/settings';
import { Button } from '@/ui';
import styles from './SettingsPage.module.css';
import { SettingsPreview } from './SettingsPreview';

export function SettingsPage() {
  const { settings: store } = useServices();
  const settings = useSettings();
  // The light or dark theme is chosen in the header and is not a reading setting, so a reset leaves it alone.
  const defaults: Settings = { ...DEFAULT_SETTINGS, theme: settings.theme };
  const isDefault = (Object.keys(defaults) as Array<keyof Settings>).every(
    (key) => settings[key] === defaults[key],
  );

  return (
    <div className={`container ${styles.page}`}>
      <title>{`Settings · ${APP_NAME}`}</title>

      <header>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.lede}>How text looks and moves in the reader.</p>
      </header>

      <div className={styles.layout}>
        <SettingsPreview />

        <div className={styles.groups}>
          <section className={styles.group} aria-labelledby="appearance-title">
            <h2 id="appearance-title" className={styles.groupTitle}>
              Appearance
            </h2>
            <FontSizeSetting />
            <DarkReaderSetting />
            <FocusColorSetting />
          </section>

          <section className={styles.group} aria-labelledby="pace-title">
            <h2 id="pace-title" className={styles.groupTitle}>
              Pace
            </h2>
            <SpeedSetting />
            <WordsPerFrameSetting />
            <PunctuationSetting />
          </section>

          <div className={styles.footer}>
            <Button disabled={isDefault} onClick={() => store.update(defaults)}>
              Reset to defaults
            </Button>
            <span>Your settings are saved in this browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
