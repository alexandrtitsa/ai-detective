import { Button } from '../button/Button';
import { Dialog } from '../dialog/Dialog';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel: string;
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      <p>{message}</p>
      <div className={styles.actions}>
        {/* «Скасувати» першою в DOM: нативний showModal() фокусує перший елемент */}
        <Button variant="secondary" onClick={onClose}>
          Скасувати
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
