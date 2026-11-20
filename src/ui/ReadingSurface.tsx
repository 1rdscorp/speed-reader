import type { ComponentProps, CSSProperties } from 'react';
import styles from './ReadingSurface.module.css';

interface ReadingSurfaceProps extends ComponentProps<'div'> {
  /** Light text on a dark ground. */
  dark?: boolean;
  /** Which focus colour to use: the name of a `--focus-<name>` token. */
  focus?: string;
}

/** A card for reading on, light or dark, that sets the focus-letter colour for what it holds. */
export function ReadingSurface({
  dark = false,
  focus = 'red',
  className = '',
  style,
  ...rest
}: ReadingSurfaceProps) {
  const focusLetter = `var(--focus-${focus}${dark ? '-night' : ''})`;
  return (
    <div
      className={`${styles.surface} ${className}`}
      data-dark={dark || undefined}
      style={{ '--focus-letter': focusLetter, ...style } as CSSProperties}
      {...rest}
    />
  );
}
