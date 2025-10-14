'use client'
import { createContext, ReactNode, useContext, useState } from 'react';
import DeleteConfirmationDialog from '../dialogs/delete-confirmation-dialog';

type ConfirmCallback = () => Promise<void> | void;

interface DeleteDialogContextType {
  confirmDeletion: (onConfirm: ConfirmCallback) => void;
}

const DeleteDialogContext = createContext<DeleteDialogContextType | undefined>(undefined);

export const DeleteDialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirmCallback, setOnConfirmCallback] = useState<ConfirmCallback>(() => {});

  const confirmDeletion = (onConfirm: ConfirmCallback) => {
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    setIsOpen(false);
    await onConfirmCallback?.();
  };

  return (
    <DeleteDialogContext.Provider value={{ confirmDeletion }}>
      {children}
      <DeleteConfirmationDialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
      />
    </DeleteDialogContext.Provider>
  );
};

export const useDeleteDialog = (): DeleteDialogContextType => {
  const context = useContext(DeleteDialogContext);
  if (!context) {
    throw new Error('useDeleteDialog must be used within a DeleteDialogProvider');
  }
  return context;
};