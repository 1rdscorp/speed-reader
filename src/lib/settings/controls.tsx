import { MAX_WORDS_PER_FRAME, MAX_WPM, MIN_WPM, WPM_STEP } from '@/core';
import { useServices } from '@/lib/services';
import { SelectField, SliderField, SwatchField, ToggleField } from '@/ui';
import {
  FOCUS_COLORS,
  FONT_SIZE_STEP,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
  type Settings,
} from './settings';
import { useSettings } from './useSettings';

/*
 * One control per setting, each wired to the settings store. The reader's
 * Controls panel and the Settings page are both built from these, so a
 * setting looks and behaves the same wherever it appears. Each uses a fixed
 * id, so show a given control once per page.
 */

function useSetting<K extends keyof Settings>(key: K): [Settings[K], (value: Settings[K]) => void] {
  const { settings } = useServices();
  return [useSettings()[key], (value) => settings.update({ [key]: value })];
}

export function SpeedSetting() {
  const [wpm, setWpm] = useSetting('wpm');
  return (
    <SliderField
      id="wpm"
      label="Speed"
      value={wpm}
      min={MIN_WPM}
      max={MAX_WPM}
      step={WPM_STEP}
      display={`${wpm} WPM`}
      emphasis
      showEnds
      onChange={setWpm}
    />
  );
}

const WORD_CHOICES = Array.from({ length: MAX_WORDS_PER_FRAME }, (_, i) => ({
  value: i + 1,
  label: i === 0 ? '1 word' : `${i + 1} words`,
}));

export function WordsPerFrameSetting() {
  const [wordsPerFrame, setWordsPerFrame] = useSetting('wordsPerFrame');
  return (
    <SelectField
      id="words-per-frame"
      label="Words at a time"
      value={wordsPerFrame}
      options={WORD_CHOICES}
      onChange={setWordsPerFrame}
    />
  );
}

export function FontSizeSetting() {
  const [fontSize, setFontSize] = useSetting('fontSize');
  return (
    <SliderField
      id="font-size"
      label="Font size"
      value={fontSize}
      min={MIN_FONT_SIZE}
      max={MAX_FONT_SIZE}
      step={FONT_SIZE_STEP}
      display={`${fontSize} px`}
      onChange={setFontSize}
    />
  );
}

export function DarkReaderSetting() {
  const [darkReader, setDarkReader] = useSetting('darkReader');
  return <ToggleField label="Dark reading area" checked={darkReader} onChange={setDarkReader} />;
}

export function PunctuationSetting() {
  const [punctuationPauses, setPunctuationPauses] = useSetting('punctuationPauses');
  return (
    <ToggleField
      label="Pause longer on punctuation"
      checked={punctuationPauses}
      onChange={setPunctuationPauses}
    />
  );
}

const COLOR_CHOICES = FOCUS_COLORS.map((color) => ({
  value: color.id,
  label: color.label,
  color: `var(--focus-${color.id})`,
}));

export function FocusColorSetting() {
  const [focusColor, setFocusColor] = useSetting('focusColor');
  return (
    <SwatchField
      name="focus-color"
      label="Focus-letter color"
      value={focusColor}
      options={COLOR_CHOICES}
      onChange={setFocusColor}
    />
  );
}
