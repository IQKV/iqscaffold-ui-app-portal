import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import {
    PaymentGatewayProvider,
    CreateGatewayConfigRequest,
    UpdateGatewayConfigRequest,
} from "@/shared/api/billing/types";
import { gatewayConfigKeys } from "./queries";

export const useCreateGatewayConfigMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (request: CreateGatewayConfigRequest) =>
            billingApi.createGatewayConfig(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gatewayConfigKeys.list() });
        },
    });
};

export const useUpdateGatewayConfigMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            provider,
            request,
        }: {
            provider: PaymentGatewayProvider;
            request: UpdateGatewayConfigRequest;
        }) => billingApi.updateGatewayConfig(provider, request),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: gatewayConfigKeys.list() });
            queryClient.invalidateQueries({
                queryKey: gatewayConfigKeys.detail(variables.provider),
            });
        },
    });
};

export const useDeleteGatewayConfigMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: PaymentGatewayProvider) =>
            billingApi.deleteGatewayConfig(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gatewayConfigKeys.list() });
        },
    });
};

export const useActivateGatewayMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: PaymentGatewayProvider) =>
            billingApi.activateGateway(provider),
        onSuccess: (_, provider) => {
            queryClient.invalidateQueries({ queryKey: gatewayConfigKeys.list() });
            queryClient.invalidateQueries({
                queryKey: gatewayConfigKeys.detail(provider),
            });
        },
    });
};

export const useDeactivateGatewayMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: PaymentGatewayProvider) =>
            billingApi.deactivateGateway(provider),
        onSuccess: (_, provider) => {
            queryClient.invalidateQueries({ queryKey: gatewayConfigKeys.list() });
            queryClient.invalidateQueries({
                queryKey: gatewayConfigKeys.detail(provider),
            });
        },
    });
};

export const useSetPrimaryGatewayMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (provider: PaymentGatewayProvider) =>
            billingApi.setPrimaryGateway(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: gatewayConfigKeys.list() });
            queryClient.invalidateQueries({
                queryKey: gatewayConfigKeys.primary(),
            });
        },
    });
};
