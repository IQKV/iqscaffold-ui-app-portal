import React from "react";
import {
  Paper,
  Title,
  Button,
  Stack,
  Group,
  Text,
  Alert,
  Tabs,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import {
  IconInfoCircle,
  IconUser,
  IconCreditCard,
  IconUsers,
} from "@tabler/icons-react";
import { UserFormField, getUserRoles } from "@/entities/user";
import {
  BillingFormField,
  getBillingGateways,
  getBillingCurrencies,
} from "@/entities/billing";
import {
  CrmFormField,
  getCrmLeadSources,
  getCrmPriorities,
} from "@/entities/crm";

// User management schema
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  authorities: z.array(z.string()).min(1, "At least one role is required"),
  enabled: z.boolean(),
});

// Billing configuration schema
const billingSchema = z.object({
  gateway: z.string().min(1, "Please select a gateway"),
  apiKey: z.string().min(8, "API key is required"),
  environment: z.string().min(1, "Please select environment"),
  currency: z.string().min(1, "Please select currency"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
});

// CRM lead schema
const crmSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  source: z.string().min(1, "Please select a lead source"),
  priority: z.string().min(1, "Please select priority"),
  notes: z.string().max(500, "Notes must not exceed 500 characters").optional(),
});

type UserFormData = z.infer<typeof userSchema>;
type BillingFormData = z.infer<typeof billingSchema>;
type CrmFormData = z.infer<typeof crmSchema>;

export function MantineZodValidationExample() {
  const [activeTab, setActiveTab] = React.useState<string | null>("user");

  // User form
  const userForm = useForm<UserFormData>({
    validate: zodResolver(userSchema),
    initialValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      authorities: ["USER"],
      enabled: true,
    },
  });

  // Billing form
  const billingForm = useForm<BillingFormData>({
    validate: zodResolver(billingSchema),
    initialValues: {
      gateway: "",
      apiKey: "",
      environment: "",
      currency: "USD",
      amount: 0,
    },
  });

  // CRM form
  const crmForm = useForm<CrmFormData>({
    validate: zodResolver(crmSchema),
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      source: "",
      priority: "",
      notes: "",
    },
  });

  const handleUserSubmit = async (values: UserFormData) => {
    console.log("User form submitted:", values);
    // eslint-disable-next-line no-alert
    alert("User form submitted successfully!");
  };

  const handleBillingSubmit = async (values: BillingFormData) => {
    console.log("Billing form submitted:", values);
    // eslint-disable-next-line no-alert
    alert("Billing form submitted successfully!");
  };

  const handleCrmSubmit = async (values: CrmFormData) => {
    console.log("CRM form submitted:", values);
    // eslint-disable-next-line no-alert
    alert("CRM form submitted successfully!");
  };

  return (
    <Paper p="xl" withBorder maw={800} mx="auto">
      <Title order={2} mb="lg">
        Business-Focused Form Components Example
      </Title>

      <Alert color="blue" icon={<IconInfoCircle size={16} />} mb="lg">
        <Text size="sm">
          This example demonstrates business-focused form components for
          different domains: User Management, Billing Configuration, and CRM.
          Each domain has its own specialized form fields with business-specific
          validation and features.
        </Text>
      </Alert>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="user" leftSection={<IconUser size={16} />}>
            User Management
          </Tabs.Tab>
          <Tabs.Tab value="billing" leftSection={<IconCreditCard size={16} />}>
            Billing Config
          </Tabs.Tab>
          <Tabs.Tab value="crm" leftSection={<IconUsers size={16} />}>
            CRM Lead
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="user" pt="md">
          <form onSubmit={userForm.onSubmit(handleUserSubmit)} noValidate>
            <Stack gap="md">
              <UserFormField
                type="username"
                name="username"
                label="Username"
                placeholder="Enter username"
                form={userForm}
                withAsterisk
                maxLength={30}
                showCharacterCount
              />

              <Group grow>
                <UserFormField
                  type="text"
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  form={userForm}
                  withAsterisk
                />
                <UserFormField
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  form={userForm}
                  withAsterisk
                />
              </Group>

              <UserFormField
                type="email"
                name="email"
                label="Email"
                placeholder="Enter email address"
                form={userForm}
                withAsterisk
              />

              <UserFormField
                type="password"
                name="password"
                label="Password"
                placeholder="Enter password"
                form={userForm}
                withAsterisk
                showStrengthIndicator
                requireStrong
              />

              <UserFormField
                type="multiselect"
                name="authorities"
                label="Roles"
                placeholder="Select user roles"
                data={getUserRoles()}
                form={userForm}
                withAsterisk
                maxValues={3}
              />

              <UserFormField
                type="switch"
                name="enabled"
                label="Account Enabled"
                description="User can log in and access the system"
                form={userForm}
              />

              <Button type="submit">Create User</Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="billing" pt="md">
          <form onSubmit={billingForm.onSubmit(handleBillingSubmit)} noValidate>
            <Stack gap="md">
              <BillingFormField
                type="select"
                name="gateway"
                label="Payment Gateway"
                placeholder="Select gateway"
                data={getBillingGateways()}
                form={billingForm}
                withAsterisk
              />

              <BillingFormField
                type="password"
                name="apiKey"
                label="API Key"
                placeholder="Enter API key"
                form={billingForm}
                withAsterisk
                showStrengthIndicator
              />

              <Group grow>
                <BillingFormField
                  type="select"
                  name="environment"
                  label="Environment"
                  placeholder="Select environment"
                  data={[
                    { value: "SANDBOX", label: "Sandbox" },
                    { value: "PRODUCTION", label: "Production" },
                  ]}
                  form={billingForm}
                  withAsterisk
                />
                <BillingFormField
                  type="select"
                  name="currency"
                  label="Currency"
                  placeholder="Select currency"
                  data={getBillingCurrencies()}
                  form={billingForm}
                  withAsterisk
                />
              </Group>

              <BillingFormField
                type="amount"
                name="amount"
                label="Test Amount"
                form={billingForm}
                currency="USD"
                min={0.01}
                max={10000}
                precision={2}
              />

              <Button type="submit">Save Configuration</Button>
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="crm" pt="md">
          <form onSubmit={crmForm.onSubmit(handleCrmSubmit)} noValidate>
            <Stack gap="md">
              <Group grow>
                <CrmFormField
                  type="text"
                  name="firstName"
                  label="First Name"
                  placeholder="Enter first name"
                  form={crmForm}
                  withAsterisk
                  maxLength={100}
                  showCharacterCount
                />
                <CrmFormField
                  type="text"
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter last name"
                  form={crmForm}
                  withAsterisk
                  maxLength={100}
                  showCharacterCount
                />
              </Group>

              <CrmFormField
                type="email"
                name="email"
                label="Email"
                placeholder="Enter email address"
                form={crmForm}
                withAsterisk
              />

              <CrmFormField
                type="text"
                name="company"
                label="Company"
                placeholder="Enter company name"
                form={crmForm}
                maxLength={200}
                showCharacterCount
              />

              <Group grow>
                <CrmFormField
                  type="select"
                  name="source"
                  label="Lead Source"
                  placeholder="Select source"
                  data={getCrmLeadSources()}
                  form={crmForm}
                  withAsterisk
                  searchable
                />
                <CrmFormField
                  type="select"
                  name="priority"
                  label="Priority"
                  placeholder="Select priority"
                  data={getCrmPriorities()}
                  form={crmForm}
                  withAsterisk
                />
              </Group>

              <CrmFormField
                type="textarea"
                name="notes"
                label="Notes"
                placeholder="Enter additional notes"
                form={crmForm}
                rows={3}
                maxLength={500}
                showCharacterCount
              />

              <Button type="submit">Create Lead</Button>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
}
