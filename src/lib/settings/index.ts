export {
  FocusColorSetting,
  FontSizeSetting,
  DarkReaderSetting,
  PunctuationSetting,
  SpeedSetting,
  WordsPerFrameSetting,
} from './controls';
export {
  DEFAULT_SETTINGS,
  FOCUS_COLORS,
  FONT_SIZE_STEP,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  SCREEN_COLORS,
  type FocusColor,
  type ScreenColor,
  type Settings,
  type Theme,
} from './settings';
export { SETTINGS_KEY, SettingsStore } from './settingsStore';
export { applyTheme } from './theme';
export { useSettings } from './useSettings';
