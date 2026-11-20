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
  const isDefault = (Object.keys(DEFAULT_SETTINGS) as Array<keyof Settings>).every(
    (key) => settings[key] === DEFAULT_SETTINGS[key],
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
            <Button disabled={isDefault} onClick={() => store.update(DEFAULT_SETTINGS)}>
              Reset to defaults
            </Button>
            <span>Your settings are saved in this browser.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
