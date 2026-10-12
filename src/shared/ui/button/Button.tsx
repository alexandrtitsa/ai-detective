import type { ComponentPropsWithoutRef } from 'react';
import { cx } from '@/shared/lib';
import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'className'> {
  readonly variant?: ButtonVariant;
}

export function Button({ variant = 'primary', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={cx(styles.button, styles[variant])} {...rest} />;
}
