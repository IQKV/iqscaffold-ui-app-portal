import React, { useState } from "react";
import {
  Container,
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Badge,
  Tabs,
  Loader,
  Center,
  Alert,
  ActionIcon,
  Tooltip,
  Box,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconEdit,
  IconStar,
  IconUserCheck,
  IconMail,
  IconPhone,
  IconBuilding,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import { notifications } from "@mantine/notifications";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useLeadQuery,
  useConvertLeadMutation,
  LeadScoreBadge,
  LeadSourceBadge
} from "@/entities/crm";
import { LeadNotesSection } from "./LeadNotesSection";
import { FollowUpSection } from "./FollowUpSection";
import { ActivityTimeline } from "./ActivityTimeline";
import { LeadDetailSkeleton } from "./skeletons";
import { LeadEditModal } from "./LeadEditModal";

/**
 * LeadDetailPage Component
 *
 * Comprehensive lead detail view with:
 * - Tabbed interface (Overview, Notes, Activities, Follow-ups)
 * - Lead header with quick actions (qualify, convert, edit)
 * - Integration with LeadNotesSection and ActivityTimeline
 */
export const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { leadId } = useParams({ strict: false }) as { leadId: string };
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  const [editModalOpened, setEditModalOpened] = useState(false);

  // Fetch lead data
  const { data: lead, isLoading, error, refetch } = useLeadQuery(leadId);

  // Handle qualify lead
  const handleQualifyLead = () => {
    // TODO: Implement qualify lead functionality
    console.log("Qualifying lead:", leadId);
  };

  // Handle convert lead
  const convertLeadMutation = useConvertLeadMutation();
  const handleConvertLead = async () => {
    try {
      const response = await convertLeadMutation.mutateAsync(leadId);
      notifications.show({
        title: t`Success`,
        message: response.message || t`Lead converted to contact successfully`,
        color: "green",
      });
      // Redirect to contact page
      navigate({ to: `/crm/contacts/${response.contactId}` });
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Failed to convert lead`,
        color: "red",
      });
    }
  };

  // Handle edit lead
  const handleEditLead = () => {
    setEditModalOpened(true);
  };

  // Handle back navigation
  const handleBack = () => {
    window.history.back();
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Render loading state
  if (isLoading) {
    return <LeadDetailSkeleton />;
  }

  // Render error state
  if (error || !lead) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title={t`Error loading lead`}>
          <Stack gap="sm">
            <Text>
              {error
                ? t`Failed to load lead details. Please try again.`
                : t`Lead not found.`}
            </Text>
            <Button onClick={handleBack} variant="light">
              {t`Back to Leads`}
            </Button>
          </Stack>
        </Alert>
      </Container>
    );
  }

  // Get stage color
  const getStageColor = (stage: string): string => {
    const stageLower = stage.toLowerCase();

    if (stageLower.includes("new") || stageLower.includes("lead")) {
      return "blue";
    }
    if (stageLower.includes("qualified") || stageLower.includes("contacted")) {
      return "cyan";
    }
    if (stageLower.includes("proposal") || stageLower.includes("negotiation")) {
      return "grape";
    }
    if (stageLower.includes("won") || stageLower.includes("closed")) {
      return "green";
    }
    if (stageLower.includes("lost")) {
      return "red";
    }

    return "gray";
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Back button */}
        <Group>
          <ActionIcon variant="subtle" onClick={handleBack}>
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Text size="sm" c="dimmed">
            Back to Leads
          </Text>
        </Group>

        {/* Lead Header */}
        <Paper p="xl" withBorder>
          <Stack gap="md">
            {/* Name and stage */}
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xl" fw={700}>
                  {lead.name}
                </Text>
                {lead.company && (
                  <Group gap="xs" mt="xs">
                    <IconBuilding size={16} />
                    <Text size="sm" c="dimmed">
                      {lead.company}
                    </Text>
                  </Group>
                )}
              </div>
              <Badge size="lg" color={getStageColor(lead.currentStage)}>
                {lead.currentStage}
              </Badge>
            </Group>

            {/* Contact information */}
            <Group gap="xl">
              <Group gap="xs">
                <IconMail size={16} />
                <Text size="sm">{lead.email}</Text>
              </Group>
              {lead.phone && (
                <Group gap="xs">
                  <IconPhone size={16} />
                  <Text size="sm">{lead.phone}</Text>
                </Group>
              )}
            </Group>

            {/* Metrics and badges */}
            <Group gap="md">
              <LeadScoreBadge score={lead.score} />
              <LeadSourceBadge source={lead.source} />
              {lead.isQualified && (
                <Badge color="green" variant="light">
                  {t`Qualified`}
                </Badge>
              )}
              {lead.isOverdue && (
                <Badge color="red" variant="filled">
                  {t`Overdue`}
                </Badge>
              )}
            </Group>

            {/* Assigned user and dates */}
            <Group gap="xl">
              {lead.assignedToName && (
                <Box>
                  <Text size="xs" c="dimmed">
                    {t`Assigned to`}
                  </Text>
                  <Text size="sm" fw={500}>
                    {lead.assignedToName}
                  </Text>
                </Box>
              )}
              <Box>
                <Text size="xs" c="dimmed">
                  Created
                </Text>
                <Text size="sm">{formatDate(lead.createdAt)}</Text>
              </Box>
              {lead.lastContactedAt && (
                <Box>
                  <Text size="xs" c="dimmed">
                    Last Contacted
                  </Text>
                  <Text size="sm">{formatDate(lead.lastContactedAt)}</Text>
                </Box>
              )}
              {lead.nextFollowUpDate && (
                <Box>
                  <Text size="xs" c="dimmed">
                    {t`Next Follow-up`}
                  </Text>
                  <Text size="sm">{formatDate(lead.nextFollowUpDate)}</Text>
                </Box>
              )}
            </Group>

            {/* Quick actions */}
            <Group gap="md" mt="md">
              <Button
                leftSection={<IconStar size={16} />}
                variant="light"
                onClick={handleQualifyLead}
                disabled={lead.isQualified}
              >
                {lead.isQualified ? t`Qualified` : t`Qualify Lead`}
              </Button>
              <Button
                leftSection={<IconUserCheck size={16} />}
                variant="light"
                onClick={handleConvertLead}
                loading={convertLeadMutation.isPending}
              >
                {t`Convert to Contact`}
              </Button>
              <Button
                leftSection={<IconEdit size={16} />}
                variant="outline"
                onClick={handleEditLead}
              >
                {t`Edit Lead`}
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Tabbed content */}
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview">{t`Overview`}</Tabs.Tab>
            <Tabs.Tab value="notes">{t`Notes`}</Tabs.Tab>
            <Tabs.Tab value="activities">{t`Activities`}</Tabs.Tab>
            <Tabs.Tab value="follow-ups">{t`Follow-ups`}</Tabs.Tab>
          </Tabs.List>

          <Box mt="md">
            <Tabs.Panel value="overview">
              <Paper p="xl" withBorder>
                <Stack gap="lg">
                  <div>
                    <Text size="sm" fw={500} mb="xs">
                      Lead Information
                    </Text>
                    <Stack gap="sm">
                      <Group>
                        <Text size="sm" c="dimmed" style={{ width: 150 }}>
                          Name:
                        </Text>
                        <Text size="sm">{lead.name}</Text>
                      </Group>
                      <Group>
                        <Text size="sm" c="dimmed" style={{ width: 150 }}>
                          Email:
                        </Text>
                        <Text size="sm">{lead.email}</Text>
                      </Group>
                      {lead.phone && (
                        <Group>
                          <Text size="sm" c="dimmed" style={{ width: 150 }}>
                            Phone:
                          </Text>
                          <Text size="sm">{lead.phone}</Text>
                        </Group>
                      )}
                      {lead.company && (
                        <Group>
                          <Text size="sm" c="dimmed" style={{ width: 150 }}>
                            Company:
                          </Text>
                          <Text size="sm">{lead.company}</Text>
                        </Group>
                      )}
                      <Group>
                        <Text size="sm" c="dimmed" style={{ width: 150 }}>
                          Source:
                        </Text>
                        <LeadSourceBadge source={lead.source} />
                      </Group>
                      <Group>
                        <Text size="sm" c="dimmed" style={{ width: 150 }}>
                          Current Stage:
                        </Text>
                        <Badge color={getStageColor(lead.currentStage)}>
                          {lead.currentStage}
                        </Badge>
                      </Group>
                      <Group>
                        <Text size="sm" c="dimmed" style={{ width: 150 }}>
                          Lead Score:
                        </Text>
                        <LeadScoreBadge score={lead.score} />
                      </Group>
                      {lead.conversionProbability !== undefined && (
                        <Group>
                          <Text size="sm" c="dimmed" style={{ width: 150 }}>
                            Conversion Probability:
                          </Text>
                          <Text size="sm">
                            {Math.round(lead.conversionProbability * 100)}%
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </div>
                </Stack>
              </Paper>
            </Tabs.Panel>

            <Tabs.Panel value="notes">
              <LeadNotesSection leadId={leadId} />
            </Tabs.Panel>

            <Tabs.Panel value="activities">
              <ActivityTimeline leadId={leadId} />
            </Tabs.Panel>

            <Tabs.Panel value="follow-ups">
              <FollowUpSection leadId={leadId} />
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Stack>

      {/* Edit Modal */}
      <LeadEditModal
        opened={editModalOpened}
        onClose={() => setEditModalOpened(false)}
        lead={lead}
        onSuccess={() => {
          refetch();
          setEditModalOpened(false);
        }}
      />
    </Container>
  );
};
