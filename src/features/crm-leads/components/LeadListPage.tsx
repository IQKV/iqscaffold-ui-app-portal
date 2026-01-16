import React, { useState, useMemo } from "react";
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
} from "@mantine/core";
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import { useLeads } from "@/entities/crm/api/crm-queries";
import { LeadCard } from "@/entities/crm/ui";
import { LeadListParams, LeadSource } from "@/shared/api/crm/types";
import { useNavigate } from "@tanstack/react-router";
import { useDebouncedValue } from "@mantine/hooks";

/**
 * LeadListPage Component
 * 
 * Main page for viewing and managing leads with:
 * - Pagination (20 items per page)
 * - Real-time search filtering
 * - Filter panel (source, stage, assigned user)
 * - Bulk actions and export functionality
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */
export const LeadListPage: React.FC = () => {
  const navigate = useNavigate();

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
  const { data, isLoading, error, refetch } = useLeads(queryParams);

  // Handle filter clearing
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedSource(null);
    setSelectedStage(null);
    setSelectedUser(null);
    setCurrentPage(1);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm || selectedSource || selectedStage || selectedUser;

  // Handle lead selection for bulk actions
  const handleLeadSelect = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (data?.content) {
      if (selectedLeads.length === data.content.length) {
        setSelectedLeads([]);
      } else {
        setSelectedLeads(data.content.map((lead) => lead.id));
      }
    }
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Exporting leads with filters:", queryParams);
  };

  // Handle bulk actions
  const handleBulkQualify = () => {
    // TODO: Implement bulk qualify
    console.log("Bulk qualifying leads:", selectedLeads);
  };

  // Handle page change - preserves filter state
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle lead click navigation
  const handleLeadClick = (leadId: string) => {
    navigate({ to: `/crm/leads/${leadId}` });
  };

  // Handle create lead
  const handleCreateLead = () => {
    // TODO: Open lead form modal
    console.log("Opening create lead form");
  };

  // Render loading state
  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading leads...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error loading leads">
          <Stack gap="sm">
            <Text>Failed to load leads. Please try again.</Text>
            <Button onClick={() => refetch()} variant="light">
              Retry
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  const leads = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={700}>
              Leads
            </Text>
            <Text size="sm" c="dimmed">
              {totalElements} total leads
            </Text>
          </div>
          <Group>
            <Button
              leftSection={<IconDownload size={16} />}
              variant="light"
              onClick={handleExport}
            >
              Export
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleCreateLead}
            >
              Add Lead
            </Button>
          </Group>
        </Group>

        {/* Search and Filters */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            {/* Search bar */}
            <TextInput
              placeholder="Search by name, email, company, or phone..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.currentTarget.value)}
              rightSection={
                searchTerm && (
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setSearchTerm("")}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                )
              }
            />

            {/* Filter controls */}
            <Group>
              <Select
                placeholder="Filter by source"
                leftSection={<IconFilter size={16} />}
                data={[
                  { value: "WEBSITE", label: "Website" },
                  { value: "REFERRAL", label: "Referral" },
                  { value: "COLD_CALL", label: "Cold Call" },
                  { value: "EMAIL_CAMPAIGN", label: "Email Campaign" },
                  { value: "SOCIAL_MEDIA", label: "Social Media" },
                  { value: "TRADE_SHOW", label: "Trade Show" },
                  { value: "PARTNER", label: "Partner" },
                  { value: "OTHER", label: "Other" },
                ]}
                value={selectedSource}
                onChange={setSelectedSource}
                clearable
                style={{ flex: 1 }}
              />

              <Select
                placeholder="Filter by stage"
                leftSection={<IconFilter size={16} />}
                data={[
                  { value: "New", label: "New" },
                  { value: "Contacted", label: "Contacted" },
                  { value: "Qualified", label: "Qualified" },
                  { value: "Proposal", label: "Proposal" },
                  { value: "Negotiation", label: "Negotiation" },
                  { value: "Won", label: "Won" },
                  { value: "Lost", label: "Lost" },
                ]}
                value={selectedStage}
                onChange={setSelectedStage}
                clearable
                style={{ flex: 1 }}
              />

              <Select
                placeholder="Filter by assigned user"
                leftSection={<IconFilter size={16} />}
                data={[
                  // TODO: Fetch from users API
                  { value: "user1", label: "John Doe" },
                  { value: "user2", label: "Jane Smith" },
                ]}
                value={selectedUser}
                onChange={setSelectedUser}
                clearable
                style={{ flex: 1 }}
              />

              {hasActiveFilters && (
                <Tooltip label="Clear all filters">
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={handleClearFilters}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Stack>
        </Paper>

        {/* Bulk actions */}
        {selectedLeads.length > 0 && (
          <Paper p="md" withBorder bg="blue.0">
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                {selectedLeads.length} lead(s) selected
              </Text>
              <Group>
                <Button
                  size="xs"
                  variant="light"
                  onClick={handleBulkQualify}
                >
                  Qualify Selected
                </Button>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => setSelectedLeads([])}
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
                  <Button variant="light" onClick={handleClearFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button onClick={handleCreateLead}>
                    Create your first lead
                  </Button>
                )}
              </Stack>
            </Center>
          </Paper>
        ) : (
          <Stack gap="md">
            {leads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => handleLeadClick(lead.id)}
                style={{ cursor: "pointer" }}
              >
                <LeadCard
                  lead={lead}
                  variant="list"
                  showQuickActions={true}
                  onQuickActions={{
                    qualify: () => console.log("Qualify", lead.id),
                    scheduleFollowUp: () =>
                      console.log("Schedule follow-up", lead.id),
                    viewDetails: () => handleLeadClick(lead.id),
                  }}
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
              size="md"
            />
          </Group>
        )}
      </Stack>
    </Container>
  );
};
