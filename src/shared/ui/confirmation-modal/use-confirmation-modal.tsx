import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { ConfirmationModal } from "./confirmation-modal";

interface UseConfirmationModalOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  danger?: boolean;
}

export function useConfirmationModal(options: UseConfirmationModalOptions = {}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(
    null,
  );

  const confirm = (callback: () => void | Promise<void>) => {
    setOnConfirmCallback(() => callback);
    open();
  };

  const handleConfirm = async () => {
    if (!onConfirmCallback) {
      return;
    }

    try {
      setLoading(true);
      await onConfirmCallback();
      close();
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setLoading(false);
      setOnConfirmCallback(null);
    }
  };

  const handleClose = () => {
    if (loading) {
      return;
    }
    close();
    setOnConfirmCallback(null);
  };

  const modal = (
    <ConfirmationModal
      opened={opened}
      onClose={handleClose}
      onConfirm={handleConfirm}
      loading={loading}
      {...options}
    />
  );

  return {
    confirm,
    modal,
    isOpen: opened,
    isLoading: loading,
  };
}
