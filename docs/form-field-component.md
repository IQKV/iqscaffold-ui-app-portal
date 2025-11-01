# FormField Component Documentation

The `FormField` component is a comprehensive, unified form field solution that integrates Mantine UI components, Zod validation, and Lingui internationalization. It replaces the need for multiple form field components and provides enhanced UX features.

## Overview

- **15+ Field Types**: Supports all common form field types
- **Mantine Integration**: Built on top of Mantine UI components
- **Zod Validation**: Seamless integration with Zod schemas
- **Lingui i18n**: Full internationalization support
- **Enhanced UX**: Validation status, character counters, password strength
- **Accessibility**: WCAG compliant with proper ARIA attributes
- **TypeScript**: Full type safety with exported interfaces

## Installation & Setup

The FormField component is already included in the project. Import it from the shared UI:

```typescript
import { FormField } from "@/shared/ui";
```

## Basic Usage

```typescript
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { FormField } from "@/shared/ui";
import { msg } from "@lingui/core/macro";

// Define Zod schema
const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password too short"),
});

function MyForm() {
  const form = useForm({
    validate: zodResolver(schema),
    initialValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <FormField
        type="email"
        name="email"
        label={msg`Email`}
        placeholder={msg`Enter your email`}
        form={form}
        withAsterisk
      />

      <FormField
        type="password"
        name="password"
        label={msg`Password`}
        form={form}
        withAsterisk
        showStrengthIndicator
      />

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Field Types

### Text Fields

```typescript
// Basic text input
<FormField
  type="text"
  name="firstName"
  label={msg`First Name`}
  placeholder={msg`Enter your first name`}
  form={form}
  maxLength={50}
  showCharacterCount
/>

// Email input with validation status
<FormField
  type="email"
  name="email"
  label={msg`Email Address`}
  form={form}
  showValidationStatus
/>

// Phone number input
<FormField
  type="tel"
  name="phone"
  label={msg`Phone Number`}
  placeholder={msg`+1 (555) 123-4567`}
  form={form}
/>

// URL input
<FormField
  type="url"
  name="website"
  label={msg`Website`}
  placeholder={msg`https://example.com`}
  form={form}
/>

// Search input
<FormField
  type="search"
  name="query"
  label={msg`Search`}
  placeholder={msg`Search users...`}
  form={form}
  leftSection={<IconSearch size={16} />}
/>
```

### Password Fields

```typescript
// Password with strength indicator
<FormField
  type="password"
  name="password"
  label={msg`Password`}
  form={form}
  showStrengthIndicator
  strengthCalculator={(password) => ({
    strength: calculateCustomStrength(password),
    label: "Custom strength",
    color: "blue",
    percentage: 75
  })}
/>

// Confirm password
<FormField
  type="password"
  name="confirmPassword"
  label={msg`Confirm Password`}
  form={form}
/>
```

### Textarea Fields

```typescript
<FormField
  type="textarea"
  name="description"
  label={msg`Description`}
  placeholder={msg`Tell us about yourself`}
  form={form}
  rows={4}
  autosize
  minRows={2}
  maxRows={8}
  maxLength={500}
  showCharacterCount
  resize="vertical"
/>
```

### Number Fields

```typescript
<FormField
  type="number"
  name="age"
  label={msg`Age`}
  form={form}
  min={18}
  max={120}
  step={1}
  hideControls={false}
  thousandSeparator=","
  decimalSeparator="."
/>
```

### Select Fields

```typescript
// Basic select
<FormField
  type="select"
  name="country"
  label={msg`Country`}
  placeholder={msg`Select your country`}
  data={[
    { value: "us", label: msg`United States` },
    { value: "ca", label: msg`Canada` },
    { value: "uk", label: msg`United Kingdom` },
  ]}
  form={form}
  searchable
  clearable
/>

// Grouped select
<FormField
  type="select"
  name="city"
  label={msg`City`}
  data={[
    { value: "ny", label: msg`New York`, group: "USA" },
    { value: "la", label: msg`Los Angeles`, group: "USA" },
    { value: "to", label: msg`Toronto`, group: "Canada" },
    { value: "va", label: msg`Vancouver`, group: "Canada" },
  ]}
  form={form}
  searchable
/>

// Creatable select
<FormField
  type="select"
  name="skill"
  label={msg`Skill`}
  data={skillOptions}
  form={form}
  creatable
  createLabel={msg`Create new skill`}
/>
```

### Multi-Select Fields

```typescript
<FormField
  type="multiselect"
  name="interests"
  label={msg`Interests`}
  placeholder={msg`Select your interests`}
  data={interestOptions}
  form={form}
  maxValues={5}
  searchable
  hidePickedOptions
  clearable
/>
```

### Date & Time Fields

```typescript
// Date picker
<FormField
  type="date"
  name="birthDate"
  label={msg`Birth Date`}
  form={form}
  minDate={new Date(1900, 0, 1)}
  maxDate={new Date()}
  valueFormat="YYYY-MM-DD"
  firstDayOfWeek={1}
/>

// Time picker
<FormField
  type="time"
  name="appointmentTime"
  label={msg`Appointment Time`}
  form={form}
  format="24"
  withSeconds
/>

// Date and time
<FormField
  type="datetime"
  name="eventDateTime"
  label={msg`Event Date & Time`}
  form={form}
  minDate={new Date()}
  timeFormat="12"
  withSeconds={false}
/>
```

### Boolean Fields

```typescript
// Checkbox
<FormField
  type="checkbox"
  name="agreeToTerms"
  label={msg`Terms and Conditions`}
  checkboxLabel={msg`I agree to the terms and conditions`}
  form={form}
  indeterminate={false}
/>

// Switch
<FormField
  type="switch"
  name="notifications"
  label={msg`Email Notifications`}
  description={msg`Receive email updates about your account`}
  form={form}
  onLabel={msg`On`}
  offLabel={msg`Off`}
/>
```

### Radio Fields

```typescript
<FormField
  type="radio"
  name="subscriptionPlan"
  label={msg`Subscription Plan`}
  data={[
    {
      value: "basic",
      label: msg`Basic Plan`,
      description: "$9.99/month - Essential features"
    },
    {
      value: "premium",
      label: msg`Premium Plan`,
      description: "$19.99/month - All features included"
    },
    {
      value: "enterprise",
      label: msg`Enterprise Plan`,
      description: "Custom pricing - Contact sales"
    },
  ]}
  form={form}
  orientation="vertical"
/>
```

### File Fields

```typescript
<FormField
  type="file"
  name="avatar"
  label={msg`Profile Picture`}
  form={form}
  accept="image/*"
  multiple={false}
  maxSize={5 * 1024 * 1024} // 5MB
  fileValidator={(file) => {
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be less than 5MB";
    }
    if (!file.type.startsWith('image/')) {
      return "File must be an image";
    }
    return null;
  }}
/>
```

### Color Fields

```typescript
<FormField
  type="color"
  name="themeColor"
  label={msg`Theme Color`}
  form={form}
  format="hex"
  swatches={[
    "#FF6B6B", "#4ECDC4", "#45B7D1",
    "#96CEB4", "#FFEAA7", "#DDA0DD"
  ]}
/>
```

## Props Reference

### Base Props

All field types inherit these base properties:

```typescript
interface BaseFormFieldProps {
  name: string; // Field name (required)
  label: string | MessageDescriptor; // Field label (required)
  form: UseFormReturnType<any>; // Mantine form instance (required)
  placeholder?: string | MessageDescriptor;
  disabled?: boolean;
  description?: string | MessageDescriptor;
  tooltip?: string | MessageDescriptor;
  showValidationStatus?: boolean; // Show checkmark/X icons
  customError?: string;
  loading?: boolean;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "filled" | "unstyled";
  withAsterisk?: boolean; // Show required asterisk
}
```

### Field-Specific Props

Each field type has additional props. See the TypeScript interfaces for complete details:

- `TextFormFieldProps`
- `PasswordFormFieldProps`
- `TextareaFormFieldProps`
- `NumberFormFieldProps`
- `SelectFormFieldProps`
- `MultiSelectFormFieldProps`
- `DateFormFieldProps`
- `TimeFormFieldProps`
- `DateTimeFormFieldProps`
- `CheckboxFormFieldProps`
- `SwitchFormFieldProps`
- `RadioFormFieldProps`
- `FileFormFieldProps`
- `ColorFormFieldProps`

## Enhanced Features

### Validation Status Indicators

Visual feedback for field validation state:

```typescript
<FormField
  type="email"
  name="email"
  label={msg`Email`}
  form={form}
  showValidationStatus={true} // Shows checkmark when valid, X when invalid
/>
```

### Character Counters

Smart character counting with color-coded limits:

```typescript
<FormField
  type="text"
  name="title"
  label={msg`Title`}
  form={form}
  maxLength={100}
  showCharacterCount={true} // Shows "45/100" with color coding
/>
```

### Password Strength Meter

Real-time password strength calculation:

```typescript
<FormField
  type="password"
  name="password"
  label={msg`Password`}
  form={form}
  showStrengthIndicator={true} // Shows strength bar and label
  strengthCalculator={(password) => {
    // Custom strength calculation
    const strength = calculateStrength(password);
    return {
      strength: strength,
      percentage: (strength / 5) * 100,
      color: getStrengthColor(strength),
      label: getStrengthLabel(strength),
    };
  }}
/>
```

### Tooltips

Contextual help with info icons:

```typescript
<FormField
  type="text"
  name="username"
  label={msg`Username`}
  form={form}
  tooltip={msg`Username must be unique and contain only letters, numbers, and underscores`}
/>
```

### Loading States

Proper disabled states during async operations:

```typescript
<FormField
  type="text"
  name="name"
  label={msg`Name`}
  form={form}
  loading={isSubmitting} // Disables field during submission
/>
```

## Internationalization

The FormField component fully supports Lingui for internationalization:

```typescript
import { msg } from "@lingui/core/macro";

<FormField
  type="select"
  name="language"
  label={msg`Preferred Language`}
  placeholder={msg`Select your language`}
  description={msg`This will be used for all communications`}
  tooltip={msg`You can change this later in settings`}
  data={[
    { value: "en", label: msg`English` },
    { value: "es", label: msg`Spanish` },
    { value: "fr", label: msg`French` },
  ]}
  form={form}
/>
```

## Accessibility

The FormField component follows WCAG 2.1 guidelines:

- **Proper Labels**: All fields have associated labels
- **ARIA Attributes**: Correct ARIA roles and properties
- **Error Association**: Errors are properly associated with fields
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Descriptive text for assistive technologies
- **Focus Management**: Proper focus indicators and management

## Best Practices

### Form Setup

```typescript
// 1. Always use noValidate to disable HTML5 validation
<form onSubmit={form.onSubmit(handleSubmit)} noValidate>

// 2. Use Zod schemas for validation
const schema = z.object({
  email: z.string().email(_(msg`Invalid email address`)),
});

// 3. Use zodResolver with Mantine forms
const form = useForm({
  validate: zodResolver(schema),
  initialValues: { email: "" },
});
```

### Field Configuration

```typescript
// 1. Use withAsterisk instead of required prop
<FormField
  type="email"
  name="email"
  label={msg`Email`}
  form={form}
  withAsterisk // Visual indicator only, validation handled by Zod
/>

// 2. Enable helpful features
<FormField
  type="password"
  name="password"
  label={msg`Password`}
  form={form}
  withAsterisk
  showStrengthIndicator // Help users create strong passwords
  showValidationStatus // Visual feedback
/>

// 3. Use appropriate field types
<FormField type="email" /> // Better than type="text" for email
<FormField type="tel" />   // Better than type="text" for phone
<FormField type="url" />   // Better than type="text" for URLs
```

### Error Handling

```typescript
// 1. Provide clear, actionable error messages
const schema = z.object({
  email: z
    .string()
    .min(1, _(msg`Email is required`))
    .email(_(msg`Please enter a valid email address`)),

  password: z
    .string()
    .min(8, _(msg`Password must be at least 8 characters`))
    .regex(
      /[A-Z]/,
      _(msg`Password must contain at least one uppercase letter`)
    ),
});

// 2. Handle form submission errors
const handleSubmit = async (values: FormData) => {
  try {
    await submitForm(values);
  } catch (error) {
    if (error.fieldErrors) {
      // Set field-specific errors
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        form.setFieldError(field, message);
      });
    }
  }
};
```

### Performance

```typescript
// 1. Use appropriate field types to avoid unnecessary re-renders
<FormField type="select" data={memoizedOptions} />

// 2. Memoize expensive calculations
const strengthCalculator = useCallback((password: string) => {
  return calculatePasswordStrength(password);
}, []);

<FormField
  type="password"
  name="password"
  strengthCalculator={strengthCalculator}
/>
```

## Migration Guide

### From Basic FormField

```typescript
// Old basic FormField
<FormField
  type="text"
  name="name"
  label="Name"
  placeholder="Enter name"
  required
  form={form}
/>

// New enhanced FormField
<FormField
  type="text"
  name="name"
  label={msg`Name`}
  placeholder={msg`Enter name`}
  withAsterisk
  showValidationStatus
  form={form}
/>
```

### From Direct Mantine Components

```typescript
// Old direct Mantine usage
<TextInput
  label="Email"
  placeholder="Enter email"
  required
  {...form.getInputProps("email")}
/>

// New FormField usage
<FormField
  type="email"
  name="email"
  label={msg`Email`}
  placeholder={msg`Enter email`}
  withAsterisk
  showValidationStatus
  form={form}
/>
```

## TypeScript Support

The FormField component provides full TypeScript support:

```typescript
import type {
  FormFieldProps,
  TextFormFieldProps,
  PasswordFormFieldProps,
  SelectFormFieldProps,
} from "@/shared/ui";

// Type-safe field configuration
const fieldConfig: TextFormFieldProps = {
  type: "text",
  name: "username",
  label: msg`Username`,
  form: form,
  maxLength: 50,
  showCharacterCount: true,
};

<FormField {...fieldConfig} />
```

## Testing

The FormField component includes comprehensive tests:

```typescript
// Test field rendering
test('renders email field correctly', () => {
  render(
    <FormField
      type="email"
      name="email"
      label="Email"
      form={mockForm}
    />
  );

  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
});

// Test validation status
test('shows validation status when enabled', () => {
  const form = useForm({
    initialValues: { email: 'valid@example.com' },
    validate: { email: (value) => value ? null : 'Required' },
  });

  render(
    <FormField
      type="email"
      name="email"
      label="Email"
      form={form}
      showValidationStatus
    />
  );

  // Should show checkmark for valid email
  expect(screen.getByTestId('validation-success')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Validation not working**: Ensure you're using `zodResolver` and `noValidate` on the form
2. **i18n messages not showing**: Check that Lingui provider is set up correctly
3. **TypeScript errors**: Make sure you're importing the correct prop types
4. **Styling issues**: Verify Mantine theme is properly configured

### Debug Mode

Enable debug mode to see form state:

```typescript
// Add debug information
<pre>{JSON.stringify(form.values, null, 2)}</pre>
<pre>{JSON.stringify(form.errors, null, 2)}</pre>
```

This comprehensive FormField component provides a unified, accessible, and feature-rich solution for all form field needs in your React application.
