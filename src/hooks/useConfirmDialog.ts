import { useState, useCallback } from 'react';
import type { DialogType } from '../components/common/ConfirmDialog';

interface DialogConfig {
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success';
}

interface DialogState extends DialogConfig {
  isOpen: boolean;
  onConfirm: () => void;
}

export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = useState<DialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmVariant: 'primary',
    onConfirm: () => {}
  });

  const showDialog = useCallback((config: DialogConfig, onConfirm: () => void) => {
    setDialogState({
      isOpen: true,
      title: config.title,
      message: config.message,
      type: config.type || 'confirm',
      confirmText: config.confirmText || 'Confirm',
      cancelText: config.cancelText || 'Cancel',
      confirmVariant: config.confirmVariant || 'primary',
      onConfirm
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const confirmDialog = useCallback((config: DialogConfig): Promise<boolean> => {
    return new Promise((resolve) => {
      showDialog(config, () => resolve(true));
      // If dialog is closed without confirming, resolve with false
      setTimeout(() => {
        if (!dialogState.isOpen) resolve(false);
      }, 100);
    });
  }, [showDialog, dialogState.isOpen]);

  return {
    dialogState,
    showDialog,
    hideDialog,
    confirmDialog
  };
};
