import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  Container,
  Stack,
  Group,
  TextInput,
  Select,
  Button,
  Pagination,
  Text,
  Paper,
  ActionIcon,
  Tooltip,
  Loader,
  Center,
  Alert,
  MultiSelect,
  Drawer,
  Collapse,
  Skeleton,
} from "@mantine/core";
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconFilter,
  IconX,
  IconAdjustments,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import {
  LeadCard,
  LeadForm,
  FollowUpForm,
  useQualifyLeadMutation,
  useCreateFollowUpMutation,
} from "@/entities/crm";
import { LeadListSkeleton } from "./skeletons";
import { LeadSource } from "@/shared/api/crm/types";
import { useNavigate } from "@tanstack/react-router";
import { useLeadList } from "../model/useLeadList";
import { useMediaQuery, useDisclosure } from "@mantine/hooks";
import { useUsersQuery } from "@/entities/users";
import { useKeyboardNavigation, useAnnouncer } from "@/shared/lib/accessibility";

/**
 * LeadListPage Component
 *
 * Main page for viewing and managing leads with:
 * - Pagination (20 items per page)
 * - Real-time search filtering
 * - Filter panel (source, stage, assigned user)
 * - Bulk actions and export functionality
 * - Responsive design with mobile-optimized filters
 * - Touch-friendly interactions
 * - Keyboard navigation and accessibility support
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 12.1, 14.1, 14.2, 14.6, 14.7
 */
export const LeadListPage: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { announce } = useAnnouncer();

  const {
    searchTerm,
    setSearchTerm,
    selectedSource,
    setSelectedSource,
    selectedStage,
    setSelectedStage,
    selectedUser,
    setSelectedUser,
    currentPage,
    selectedLeads,
    setSelectedLeads,
    leads,
    isLoading,
    error,
    refetch,
    totalPages,
    totalElements,
    hasActiveFilters,
    isExporting,
    isBulkQualifying,
    handleClearFilters,
    handleSelectAll,
    handleExport,
    handleBulkQualify,
    handlePageChange,
  } = useLeadList();

  // Filter drawer state for mobile
  const [filterDrawerOpened, { open: openFilterDrawer, close: closeFilterDrawer }] =
    useDisclosure(false);

  // Lead form modal state
  const [leadFormOpened, { open: openLeadForm, close: closeLeadForm }] = useDisclosure(false);

  // Follow-up form modal state
  const [followUpFormOpened, { open: openFollowUpForm, close: closeFollowUpForm }] =
    useDisclosure(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<string | null>(null);

  const [focusedLeadIndex, setFocusedLeadIndex] = useState(0);

  // Mutations for quick actions
  const qualifyLeadMutation = useQualifyLeadMutation();
  const createFollowUpMutation = useCreateFollowUpMutation();

  // Fetch users for filter dropdown
  const { data: usersData, isLoading: isLoadingUsers } = useUsersQuery({
    active: true,
  });

  // Keyboard shortcuts
  const handleCreateLead = useCallback(() => {
    openLeadForm();
    announce("Opening create lead form", { priority: "polite" });
  }, [openLeadForm, announce]);

  // Quick action handlers
  const handleQuickQualify = useCallback(
    async (leadId: string) => {
      try {
        await qualifyLeadMutation.mutateAsync(leadId);
        announce("Lead qualified successfully", { priority: "polite" });
      } catch (error) {
        // Error is handled by the mutation
      }
    },
    [qualifyLeadMutation, announce],
  );

  const handleQuickScheduleFollowUp = useCallback(
    (leadId: string) => {
      setSelectedLeadForFollowUp(leadId);
      openFollowUpForm();
      announce("Opening schedule follow-up form", { priority: "polite" });
    },
    [openFollowUpForm, announce],
  );

  const handleFollowUpSubmit = async (data: any) => {
    await createFollowUpMutation.mutateAsync(data);
  };

  const handleFocusSearch = useCallback(() => {
    searchInputRef.current?.focus();
    announce("Search field focused", { priority: "polite" });
  }, [announce]);

  // Setup keyboard shortcuts
  useKeyboardNavigation({
    shortcuts: [
      {
        key: "n",
        ctrl: true,
        action: handleCreateLead,
        description: "Create new lead",
      },
      {
        key: "k",
        ctrl: true,
        action: handleFocusSearch,
        description: "Focus search",
      },
      {
        key: "a",
        ctrl: true,
        action: handleSelectAll,
        description: "Select/deselect all leads",
      },
      {
        key: "j",
        action: () => {
          if (focusedLeadIndex < leads.length - 1) {
            setFocusedLeadIndex(focusedLeadIndex + 1);
          }
        },
        description: "Next lead",
        preventDefault: true,
      },
      {
        key: "k",
        action: () => {
          if (focusedLeadIndex > 0) {
            setFocusedLeadIndex(focusedLeadIndex - 1);
          }
        },
        description: "Previous lead",
        preventDefault: true,
      },
    ],
    enabled: !filterDrawerOpened,
  });

  // Handle lead click navigation
  const handleLeadClick = (leadId: string) => {
    navigate({ to: `/crm/leads/${leadId}` });
  };

  // Handle lead keyboard navigation
  const handleLeadKeyDown = (event: React.KeyboardEvent, leadId: string, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleLeadClick(leadId);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (index < leads.length - 1) {
        setFocusedLeadIndex(index + 1);
      }
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index > 0) {
        setFocusedLeadIndex(index - 1);
      }
    }
  };

  // Announce filter changes
  React.useEffect(() => {
    if (leads.length > 0 && !isLoading) {
      announce(`${totalElements} leads found`, { priority: "polite" });
    }
  }, [leads, isLoading, totalElements, announce]);

  // Render loading state
  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          {/* Header skeleton */}
          <Group justify="space-between">
            <div>
              <Text size="xl" fw={700}>
                Leads
              </Text>
            </div>
          </Group>

          {/* Search and filters skeleton */}
          <Paper p="md" withBorder>
            <Stack gap="md">
              <Group gap="xs">
                <div style={{ flex: 1 }}>
                  <Skeleton height={36} />
                </div>
              </Group>
            </Stack>
          </Paper>

          {/* Lead list skeleton */}
          <LeadListSkeleton count={5} variant={isMobile ? "compact" : "list"} />
        </Stack>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title={t`Error loading leads`}>
          <Stack gap="sm">
            <Text>{t`Failed to load leads. Please try again.`}</Text>
            <Button onClick={() => refetch()} variant="light">
              {t`Retry`}
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  // Render filter controls - extracted for reuse in drawer
  const renderFilterControls = () => (
    <Stack gap="md">
      <Select
        placeholder={t`Filter by source`}
        leftSection={<IconFilter size={16} />}
        data={[
          { value: "WEBSITE", label: t`Website` },
          { value: "REFERRAL", label: t`Referral` },
          { value: "COLD_CALL", label: t`Cold Call` },
          { value: "EMAIL_CAMPAIGN", label: t`Email Campaign` },
          { value: "SOCIAL_MEDIA", label: t`Social Media` },
          { value: "TRADE_SHOW", label: t`Trade Show` },
          { value: "PARTNER", label: t`Partner` },
          { value: "OTHER", label: t`Other` },
        ]}
        value={selectedSource}
        onChange={setSelectedSource}
        clearable
      />

      <Select
        placeholder={t`Filter by stage`}
        leftSection={<IconFilter size={16} />}
        data={[
          { value: "New", label: t`New` },
          { value: "Contacted", label: t`Contacted` },
          { value: "Qualified", label: t`Qualified` },
          { value: "Proposal", label: t`Proposal` },
          { value: "Negotiation", label: t`Negotiation` },
          { value: "Won", label: t`Won` },
          { value: "Lost", label: t`Lost` },
        ]}
        value={selectedStage}
        onChange={setSelectedStage}
        clearable
      />

      <Select
        placeholder={t`Filter by assigned user`}
        leftSection={<IconFilter size={16} />}
        data={
          isLoadingUsers
            ? []
            : (usersData || []).map((user) => ({
                value: user.id,
                label: user.fullName || `${user.firstName} ${user.lastName}`,
              }))
        }
        value={selectedUser}
        onChange={setSelectedUser}
        clearable
        disabled={isLoadingUsers}
        searchable
      />

      {hasActiveFilters && (
        <Button
          variant="light"
          color="red"
          fullWidth
          leftSection={<IconX size={16} />}
          onClick={() => {
            handleClearFilters();
            if (isMobile) {
              closeFilterDrawer();
            }
          }}
        >
          {t`Clear all filters`}
        </Button>
      )}
    </Stack>
  );

  return (
    <>
      <Container size="xl" py={isMobile ? "sm" : "xl"} px={isMobile ? "xs" : "md"}>
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" wrap={isMobile ? "wrap" : "nowrap"}>
            <div style={{ flex: isMobile ? "1 1 100%" : "auto" }}>
              <Text size={isMobile ? "lg" : "xl"} fw={700}>
                Leads
              </Text>
              <Text size="sm" c="dimmed">
                {totalElements} total leads
              </Text>
            </div>
            <Group gap="xs" style={{ flex: isMobile ? "1 1 100%" : "auto" }}>
              {!isMobile && (
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="light"
                  onClick={handleExport}
                  loading={isExporting}
                  disabled={isExporting}
                  size={isTablet ? "sm" : "md"}
                >
                  Export
                </Button>
              )}
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleCreateLead}
                size={isMobile ? "sm" : isTablet ? "sm" : "md"}
                fullWidth={isMobile}
              >
                Add Lead
              </Button>
            </Group>
          </Group>

          {/* Search and Filters */}
          <Paper p={isMobile ? "sm" : "md"} withBorder>
            <Stack gap="md">
              {/* Search bar - always visible */}
              <Group gap="xs" wrap="nowrap">
                <TextInput
                  ref={searchInputRef}
                  placeholder={
                    isMobile ? "Search leads..." : "Search by name, email, company, or phone..."
                  }
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  rightSection={
                    searchTerm && (
                      <ActionIcon
                        variant="subtle"
                        onClick={() => setSearchTerm("")}
                        size="sm"
                        aria-label="Clear search"
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    )
                  }
                  style={{ flex: 1 }}
                  styles={{
                    input: {
                      fontSize: isMobile ? "14px" : "16px",
                      minHeight: isMobile ? "40px" : "36px",
                    },
                  }}
                  aria-label="Search leads"
                />

                {/* Mobile filter button */}
                {isMobile && (
                  <ActionIcon
                    variant="light"
                    size="lg"
                    onClick={openFilterDrawer}
                    color={hasActiveFilters ? "blue" : "gray"}
                    aria-label="Open filters"
                  >
                    <IconAdjustments size={20} />
                  </ActionIcon>
                )}
              </Group>

              {/* Desktop/Tablet filter controls */}
              {!isMobile && (
                <Group>
                  <Select
                    placeholder={t`Filter by source`}
                    leftSection={<IconFilter size={16} />}
                    data={[
                      { value: "WEBSITE", label: t`Website` },
                      { value: "REFERRAL", label: t`Referral` },
                      { value: "COLD_CALL", label: t`Cold Call` },
                      { value: "EMAIL_CAMPAIGN", label: t`Email Campaign` },
                      { value: "SOCIAL_MEDIA", label: t`Social Media` },
                      { value: "TRADE_SHOW", label: t`Trade Show` },
                      { value: "PARTNER", label: t`Partner` },
                      { value: "OTHER", label: t`Other` },
                    ]}
                    value={selectedSource}
                    onChange={setSelectedSource}
                    clearable
                    style={{ flex: 1 }}
                    size={isTablet ? "sm" : "md"}
                  />

                  <Select
                    placeholder={t`Filter by stage`}
                    leftSection={<IconFilter size={16} />}
                    data={[
                      { value: "New", label: t`New` },
                      { value: "Contacted", label: t`Contacted` },
                      { value: "Qualified", label: t`Qualified` },
                      { value: "Proposal", label: t`Proposal` },
                      { value: "Negotiation", label: t`Negotiation` },
                      { value: "Won", label: t`Won` },
                      { value: "Lost", label: t`Lost` },
                    ]}
                    value={selectedStage}
                    onChange={setSelectedStage}
                    clearable
                    style={{ flex: 1 }}
                    size={isTablet ? "sm" : "md"}
                  />

                  <Select
                    placeholder={t`Filter by assigned user`}
                    leftSection={<IconFilter size={16} />}
                    data={
                      isLoadingUsers
                        ? []
                        : (usersData || []).map((user) => ({
                            value: user.id,
                            label: user.fullName || `${user.firstName} ${user.lastName}`,
                          }))
                    }
                    value={selectedUser}
                    onChange={setSelectedUser}
                    clearable
                    disabled={isLoadingUsers}
                    searchable
                    style={{ flex: 1 }}
                    size={isTablet ? "sm" : "md"}
                  />

                  {hasActiveFilters && (
                    <Tooltip label={t`Clear all filters`}>
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={handleClearFilters}
                        size={isTablet ? "md" : "lg"}
                      >
                        <IconX size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                </Group>
              )}
            </Stack>
          </Paper>

          {/* Mobile Filter Drawer */}
          <Drawer
            opened={filterDrawerOpened}
            onClose={closeFilterDrawer}
            title={t`Filter Leads`}
            position="right"
            size="sm"
            padding="md"
          >
            {renderFilterControls()}
          </Drawer>

          {/* Bulk actions */}
          {selectedLeads.length > 0 && (
            <Paper p={isMobile ? "sm" : "md"} withBorder bg="blue.0">
              <Group justify="space-between" wrap={isMobile ? "wrap" : "nowrap"}>
                <Text size="sm" fw={500} style={{ flex: isMobile ? "1 1 100%" : "auto" }}>
                  {selectedLeads.length} lead(s) selected
                </Text>
                <Group gap="xs" style={{ flex: isMobile ? "1 1 100%" : "auto" }}>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={handleBulkQualify}
                    loading={isBulkQualifying}
                    disabled={isBulkQualifying}
                    fullWidth={isMobile}
                  >
                    Qualify Selected
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => setSelectedLeads([])}
                    disabled={isBulkQualifying}
                    fullWidth={isMobile}
                  >
                    Clear Selection
                  </Button>
                </Group>
              </Group>
            </Paper>
          )}

          {/* Lead list */}
          {leads.length === 0 ? (
            <Paper p="xl" withBorder>
              <Center>
                <Stack align="center" gap="md">
                  <Text size="lg" c="dimmed">
                    No leads found
                  </Text>
                  {hasActiveFilters ? (
                    <Button variant="light" onClick={handleClearFilters} fullWidth={isMobile}>
                      Clear filters
                    </Button>
                  ) : (
                    <Button onClick={handleCreateLead} fullWidth={isMobile}>
                      Create your first lead
                    </Button>
                  )}
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Stack gap={isMobile ? "sm" : "md"} role="list" aria-label="Leads list">
              {leads.map((lead: any, index: number) => (
                <div
                  key={lead.id}
                  role="listitem"
                  style={{
                    cursor: "pointer",
                    minHeight: isMobile ? "44px" : "auto",
                  }}
                >
                  <LeadCard
                    lead={lead}
                    variant={isMobile ? "compact" : "list"}
                    showQuickActions={!isMobile}
                    tabIndex={index === focusedLeadIndex ? 0 : -1}
                    onKeyDown={(e) => handleLeadKeyDown(e, lead.id, index)}
                    onClick={() => handleLeadClick(lead.id)}
                    onQuickActions={
                      !isMobile
                        ? {
                            qualify: () => handleQuickQualify(lead.id),
                            scheduleFollowUp: () => handleQuickScheduleFollowUp(lead.id),
                            viewDetails: () => handleLeadClick(lead.id),
                          }
                        : undefined
                    }
                  />
                </div>
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center">
              <Pagination
                total={totalPages}
                value={currentPage}
                onChange={handlePageChange}
                size={isMobile ? "sm" : "md"}
                // Mobile-friendly: show fewer siblings on small screens
                siblings={isMobile ? 0 : 1}
                boundaries={isMobile ? 1 : 1}
              />
            </Group>
          )}
        </Stack>
      </Container>

      {/* Lead Form Modal */}
      <LeadForm
        opened={leadFormOpened}
        onClose={() => {
          closeLeadForm();
          refetch();
        }}
      />

      {/* Follow-up Form Modal */}
      {selectedLeadForFollowUp && (
        <FollowUpForm
          opened={followUpFormOpened}
          onClose={() => {
            closeFollowUpForm();
            setSelectedLeadForFollowUp(null);
          }}
          leadId={selectedLeadForFollowUp}
          onSubmit={handleFollowUpSubmit}
          isLoading={createFollowUpMutation.isPending}
        />
      )}
    </>
  );
};
