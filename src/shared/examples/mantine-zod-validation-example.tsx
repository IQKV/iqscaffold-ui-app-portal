import React from "react";
import { Paper, Title, Button, Stack, Group, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { IconInfoCircle } from "@tabler/icons-react";
import { FormField } from "@/shared/ui";

// Comprehensive Zod schema with various validation rules
const validationSchema = z.object({
  // Basic text validation
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters"),

  // Email validation
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),

  // Password with complex validation
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),

  // Number validation
  age: z
    .number()
    .min(18, "You must be at least 18 years old")
    .max(120, "Age must be realistic")
    .int("Age must be a whole number"),

  // Select validation
  country: z.string().min(1, "Please select a country"),

  // Multi-select validation
  interests: z
    .array(z.string())
    .min(1, "Please select at least one interest")
    .max(5, "Please select no more than 5 interests"),

  // Date validation (using string for simplicity)
  birthDate: z
    .string()
    .min(1, "Birth date is required")
    .refine((dateStr) => {
      const date = new Date(dateStr);
      const age = new Date().getFullYear() - date.getFullYear();
      return age >= 18;
    }, "You must be at least 18 years old"),

  // Textarea validation
  bio: z
    .string()
    .min(10, "Bio must be at least 10 characters")
    .max(500, "Bio must not exceed 500 characters")
    .optional(),

  // Boolean validation
  agreeToTerms: z
    .boolean()
    .refine(
      (val) => val === true,
      "You must agree to the terms and conditions"
    ),

  // Optional newsletter subscription
  subscribeNewsletter: z.boolean().optional(),
});

type FormData = z.infer<typeof validationSchema>;

const countryOptions = [
  { value: "us", label: "United States" },
  { value: "ca", label: "Canada" },
  { value: "uk", label: "United Kingdom" },
  { value: "de", label: "Germany" },
  { value: "fr", label: "France" },
];

const interestOptions = [
  { value: "technology", label: "Technology" },
  { value: "sports", label: "Sports" },
  { value: "music", label: "Music" },
  { value: "travel", label: "Travel" },
  { value: "cooking", label: "Cooking" },
  { value: "reading", label: "Reading" },
  { value: "gaming", label: "Gaming" },
  { value: "art", label: "Art" },
];

export function MantineZodValidationExample() {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<FormData>({
    // Use zodResolver for validation - this replaces HTML5 validation
    validate: zodResolver(validationSchema),
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      age: 18,
      country: "",
      interests: [],
      birthDate: "",
      bio: "",
      agreeToTerms: false,
      subscribeNewsletter: false,
    },
  });

  const handleSubmit = async (values: FormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Form submitted with values:", values);

      // Reset form on success
      form.reset();

      // eslint-disable-next-line no-alert
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Form submission error:", error);
      // eslint-disable-next-line no-alert
      alert("Form submission failed!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper p="xl" withBorder maw={600} mx="auto">
      <Title order={2} mb="lg">
        Mantine + Zod Validation Example
      </Title>

      <Alert color="blue" icon={<IconInfoCircle size={16} />} mb="lg">
        <Text size="sm">
          This form demonstrates proper Mantine + Zod validation with HTML5
          validation disabled. All validation is handled by Zod schemas and
          Mantine's form system.
        </Text>
      </Alert>

      {/* 
        IMPORTANT: noValidate attribute disables HTML5 validation
        This ensures only Zod validation is used
      */}
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          {/* Basic text inputs with enhanced validation */}
          <Group grow>
            <FormField
              type="text"
              name="firstName"
              label="First Name"
              placeholder="Enter your first name"
              form={form}
              withAsterisk
              showCharacterCount
              maxLength={50}
            />
            <FormField
              type="text"
              name="lastName"
              label="Last Name"
              placeholder="Enter your last name"
              form={form}
              withAsterisk
              showCharacterCount
              maxLength={50}
            />
          </Group>

          {/* Email input with validation status */}
          <FormField
            type="email"
            name="email"
            label="Email"
            placeholder="Enter your email"
            form={form}
            withAsterisk
            showValidationStatus
          />

          {/* Password with strength indicator */}
          <FormField
            type="password"
            name="password"
            label="Password"
            placeholder="Enter a strong password"
            description="Must contain uppercase, lowercase, number, and special character"
            form={form}
            withAsterisk
            showStrengthIndicator
          />

          {/* Number input with validation */}
          <FormField
            type="number"
            name="age"
            label="Age"
            placeholder="Enter your age"
            form={form}
            withAsterisk
            min={18}
            max={120}
          />

          {/* Select dropdown with search */}
          <FormField
            type="select"
            name="country"
            label="Country"
            placeholder="Select your country"
            data={countryOptions}
            form={form}
            withAsterisk
            searchable
            clearable
          />

          {/* Multi-select with limits */}
          <FormField
            type="multiselect"
            name="interests"
            label="Interests"
            placeholder="Select your interests (1-5)"
            data={interestOptions}
            form={form}
            withAsterisk
            searchable
            maxValues={5}
          />

          {/* Date input */}
          <FormField
            type="text"
            name="birthDate"
            label="Birth Date"
            placeholder="YYYY-MM-DD"
            form={form}
            withAsterisk
          />

          {/* Textarea with character count */}
          <FormField
            type="textarea"
            name="bio"
            label="Bio (Optional)"
            placeholder="Tell us about yourself"
            form={form}
            rows={4}
            maxLength={500}
            showCharacterCount
            autosize
            minRows={2}
            maxRows={6}
          />

          {/* Required switch */}
          <FormField
            type="switch"
            name="agreeToTerms"
            label="I agree to the terms and conditions"
            form={form}
          />

          {/* Optional switch */}
          <FormField
            type="switch"
            name="subscribeNewsletter"
            label="Subscribe to newsletter"
            description="Receive updates about new features and content"
            form={form}
          />

          <Group justify="flex-end" mt="lg">
            <Button
              type="button"
              variant="subtle"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button type="submit" loading={isLoading}>
              Submit Form
            </Button>
          </Group>
        </Stack>
      </form>

      {/* Debug information */}
      <Paper p="md" mt="xl" bg="gray.0">
        <Title order={4} mb="sm">
          Debug Information
        </Title>
        <Text size="sm" mb="xs">
          Form Values:
        </Text>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(form.values, null, 2)}
        </pre>
        <Text size="sm" mb="xs" mt="md">
          Form Errors:
        </Text>
        <pre style={{ fontSize: "12px", overflow: "auto" }}>
          {JSON.stringify(form.errors, null, 2)}
        </pre>
      </Paper>
    </Paper>
  );
}
