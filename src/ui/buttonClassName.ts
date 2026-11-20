import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'quiet';

/** Button styling as a class name, for elements that are not <button>, such as links. */
export function buttonClassName(variant: ButtonVariant = 'secondary', icon = false): string {
  return [styles.button, styles[variant], icon ? styles.icon : ''].filter(Boolean).join(' ');
}
