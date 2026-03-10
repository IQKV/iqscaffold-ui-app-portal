import { useState, useMemo, useCallback } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { useLeadsQuery, useBulkQualifyLeadsMutation, useExportLeadsMutation } from "@/entities/crm";
import { LeadListParams, LeadSource } from "@/shared/api/crm/types";
import { useAnnouncer } from "@/shared/lib/accessibility";
import { t } from "@lingui/core/macro";

export function useLeadList() {
  const { announce } = useAnnouncer();

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  // Build query params
  const queryParams = useMemo<LeadListParams>(() => {
    const params: LeadListParams = {
      page: currentPage - 1, // API uses 0-based indexing
      size: 20,
      sort: "createdAt,desc",
    };

    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    if (selectedSource) {
      params.source = selectedSource as LeadSource;
    }
    if (selectedStage) {
      params.stage = selectedStage;
    }
    if (selectedUser) {
      params.assignedTo = selectedUser;
    }

    return params;
  }, [debouncedSearch, selectedSource, selectedStage, selectedUser, currentPage]);

  // Fetch leads with filters
  const { data, isLoading, error, refetch } = useLeadsQuery(queryParams);

  const leads = useMemo(() => (data as any)?.content || [], [data]);
  const totalPages = (data as any)?.totalPages || 0;
  const totalElements = (data as any)?.totalElements || 0;

  // Mutations
  const bulkQualifyMutation = useBulkQualifyLeadsMutation();
  const exportMutation = useExportLeadsMutation();

  // Handlers
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSource(null);
    setSelectedStage(null);
    setSelectedUser(null);
    setCurrentPage(1);
    announce("All filters cleared", { priority: "polite" });
  }, [announce]);

  const handleLeadSelect = useCallback((leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    if (leads.length === 0) {
      return;
    }

    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
      announce("All leads deselected", { priority: "polite" });
    } else {
      setSelectedLeads(leads.map((lead: any) => lead.id));
      announce(`${leads.length} leads selected`, { priority: "polite" });
    }
  }, [leads, selectedLeads.length, announce]);

  const handleExport = async () => {
    try {
      await exportMutation.mutateAsync(queryParams);
      announce("Leads exported successfully", { priority: "polite" });
    } catch (e) {
      announce("Failed to export leads", { priority: "assertive" });
      throw e;
    }
  };

  const handleBulkQualify = async () => {
    if (selectedLeads.length === 0) {
      announce("No leads selected for qualification", {
        priority: "assertive",
      });
      return;
    }

    try {
      await bulkQualifyMutation.mutateAsync(selectedLeads);
      setSelectedLeads([]);
      announce(`Successfully qualified ${selectedLeads.length} leads`, {
        priority: "polite",
      });
    } catch (e) {
      announce("Failed to qualify leads", { priority: "assertive" });
      throw e;
    }
  };

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      announce(`Page ${page} of ${totalPages}`, { priority: "polite" });
    },
    [totalPages, announce],
  );

  return {
    // State
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedStage,
    setSelectedStage,
    selectedUser,
    setSelectedUser,
    currentPage,
    setCurrentPage,
    selectedLeads,
    setSelectedLeads,

    // Data
    leads,
    isLoading,
    error,
    refetch,
    totalPages,
    totalElements,
    hasActiveFilters: !!(searchTerm || selectedSource || selectedStage || selectedUser),

    // Mutations
    isExporting: exportMutation.isPending,
    isBulkQualifying: bulkQualifyMutation.isPending,

    // Handlers
    handleClearFilters,
    handleLeadSelect,
    handleSelectAll,
    handleExport,
    handleBulkQualify,
    handlePageChange,
  };
}
