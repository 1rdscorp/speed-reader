import type { CSSProperties } from 'react';
import styles from './fields.module.css';

interface SliderFieldProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** The value as it should read beside the label, e.g. "300 WPM". */
  display: string;
  /** Draw the value in the accent colour. */
  emphasis?: boolean;
  /** Print the lowest and highest values under the track. */
  showEnds?: boolean;
  onChange: (value: number) => void;
}

export function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  emphasis = false,
  showEnds = false,
  onChange,
}: SliderFieldProps) {
  return (
    <div className={styles.field}>
      <div className={styles.row}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <output htmlFor={id} className={styles.value} data-emphasis={emphasis || undefined}>
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      {showEnds && (
        <div className={styles.ends} aria-hidden="true">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

interface Option<T> {
  value: T;
  label: string;
}

interface SelectFieldProps<T extends string | number> {
  id: string;
  label: string;
  value: T;
  options: ReadonlyArray<Option<T>>;
  onChange: (value: T) => void;
}

export function SelectField<T extends string | number>({
  id,
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(event) => {
          const chosen = options.find((option) => String(option.value) === event.target.value);
          if (chosen) onChange(chosen.value);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface ToggleFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function ToggleField({ label, checked, onChange }: ToggleFieldProps) {
  return (
    <label className={styles.toggle}>
      {label}
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </label>
  );
}

interface SwatchFieldProps<T extends string> {
  /** Groups the options; must be unique on the page. */
  name: string;
  label: string;
  value: T;
  /** `color` is any CSS colour, usually a token: "var(--focus-red)". */
  options: ReadonlyArray<Option<T> & { color: string }>;
  onChange: (value: T) => void;
}

/** Pick one of a few colours. Options carry their names, so the choice never rests on colour alone. */
export function SwatchField<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: SwatchFieldProps<T>) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.swatches}>
        {options.map((option) => (
          <label
            key={option.value}
            className={styles.swatch}
            style={{ '--swatch': option.color } as CSSProperties}
          >
            <input
              type="radio"
              className="visuallyHidden"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
