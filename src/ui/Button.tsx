import type { ComponentProps } from 'react';
import { buttonClassName, type ButtonVariant } from './buttonClassName';

interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
}

export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  ...rest
}: ButtonProps) {
  return <button type={type} className={`${buttonClassName(variant)} ${className}`} {...rest} />;
}

interface IconButtonProps extends Omit<ComponentProps<'button'>, 'aria-label'> {
  /** Accessible name; also shown as a tooltip. */
  label: string;
  variant?: ButtonVariant;
}

export function IconButton({
  label,
  variant = 'quiet',
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`${buttonClassName(variant, true)} ${className}`}
      {...rest}
    />
  );
}
