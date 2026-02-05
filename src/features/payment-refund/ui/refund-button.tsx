import { useState } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { RefundConfirmationDialog } from "./refund-confirmation-dialog";
import { useRefundPaymentMutation } from "@/entities/billing";
import { notificationService } from "@/shared/lib/notifications";

interface RefundButtonProps {
  paymentId: string;
  paymentAmount?: number;
  paymentCurrency?: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export const RefundButton = ({
  paymentId,
  paymentAmount,
  paymentCurrency,
  disabled = false,
  onSuccess,
}: RefundButtonProps) => {
  const [dialogOpened, setDialogOpened] = useState(false);
  const refundMutation = useRefundPaymentMutation();

  const handleRefund = async () => {
    try {
      await refundMutation.mutateAsync(paymentId);
      notificationService.success({
        title: t`Refund Processed`,
        message: t`The payment has been refunded successfully`,
      });
      setDialogOpened(false);
      onSuccess?.();
    } catch (error) {
      notificationService.error({
        title: t`Refund Failed`,
        message: t`Failed to process the refund. Please try again.`,
      });
    }
  };

  return (
    <>
      <Tooltip label={t`Refund Payment`}>
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => setDialogOpened(true)}
          disabled={disabled}
        >
          <IconCurrencyDollar size={18} />
        </ActionIcon>
      </Tooltip>

      <RefundConfirmationDialog
        opened={dialogOpened}
        onClose={() => setDialogOpened(false)}
        onConfirm={handleRefund}
        loading={refundMutation.isPending}
        paymentAmount={paymentAmount}
        paymentCurrency={paymentCurrency}
        paymentId={paymentId}
      />
    </>
  );
};
