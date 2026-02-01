// Re-export gateway configuration hooks from billing entity
export {
  useGatewayConfigs,
  useActiveGatewayConfigs,
  useGatewayConfig,
  usePrimaryGatewayConfig,
  useCreateGatewayConfig,
  useUpdateGatewayConfig,
  useDeleteGatewayConfig,
  useActivateGateway,
  useDeactivateGateway,
  useSetPrimaryGateway,
} from "@/entities/billing";
