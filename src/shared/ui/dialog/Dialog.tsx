import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import styles from './Dialog.module.scss';

interface DialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

export function Dialog({ open, title, onClose, children }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;

    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={titleId} onClose={onClose}>
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {children}
    </dialog>
  );
}
