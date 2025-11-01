# FormField API Reference

## Component Import

```typescript
import { FormField } from "@/shared/ui";
```

## Type Definitions

```typescript
import type {
  FormFieldProps,
  BaseFormFieldProps,
  TextFormFieldProps,
  PasswordFormFieldProps,
  SelectFormFieldProps,
  // ... other field type props
} from "@/shared/ui";
```

## Supported Field Types

| Type          | Description                 | Enhanced Features                    |
| ------------- | --------------------------- | ------------------------------------ |
| `text`        | Basic text input            | Character counter, validation status |
| `email`       | Email input with validation | Validation status indicator          |
| `tel`         | Phone number input          | Format validation                    |
| `url`         | URL input with validation   | Protocol validation                  |
| `search`      | Search input                | Left/right sections for icons        |
| `password`    | Password input              | Strength meter, visibility toggle    |
| `textarea`    | Multi-line text input       | Character counter, auto-resize       |
| `number`      | Numeric input               | Min/max validation, step control     |
| `select`      | Dropdown selection          | Search, grouping, creation           |
| `multiselect` | Multiple selection          | Max values, hide picked options      |
| `date`        | Date picker                 | Min/max dates, custom format         |
| `time`        | Time picker                 | 12/24 hour format, seconds           |
| `datetime`    | Date and time picker        | Combined date/time selection         |
| `checkbox`    | Checkbox input              | Indeterminate state                  |
| `switch`      | Toggle switch               | On/off labels, thumb icon            |
| `radio`       | Radio button group          | Vertical/horizontal layout           |
| `file`        | File upload                 | Type validation, size limits         |
| `color`       | Color picker                | Swatches, format options             |

## Base Props

All field types inherit these properties:

```typescript
interface BaseFormFieldProps {
  // Required
  name: string;
  label: string | MessageDescriptor;
  form: UseFormReturnType<any>;

  // Optional
  placeholder?: string | MessageDescriptor;
  disabled?: boolean;
  description?: string | MessageDescriptor;
  tooltip?: string | MessageDescriptor;
  showValidationStatus?: boolean;
  customError?: string;
  loading?: boolean;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "filled" | "unstyled";
  withAsterisk?: boolean;
}
```

## Field-Specific Props

### Text Fields

```typescript
interface TextFormFieldProps extends BaseFormFieldProps {
  type: "text" | "email" | "tel" | "url" | "search";
  maxLength?: number;
  showCharacterCount?: boolean;
  leftSection?: React.ReactNode;
  rightSection?: React.ReactNode;
}
```

### Password Fields

```typescript
interface PasswordFormFieldProps extends BaseFormFieldProps {
  type: "password";
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  showStrengthIndicator?: boolean;
  strengthCalculator?: (password: string) => {
    strength: number;
    label: string;
    color: string;
    percentage?: number;
  };
}
```

### Select Fields

```typescript
interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  data: Array<{
    value: string;
    label: string | MessageDescriptor;
    disabled?: boolean;
    group?: string;
  }>;
  searchable?: boolean;
  clearable?: boolean;
  creatable?: boolean;
  createLabel?: string | MessageDescriptor;
  limit?: number;
}
```

### Number Fields

```typescript
interface NumberFormFieldProps extends BaseFormFieldProps {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  hideControls?: boolean;
  thousandSeparator?: string;
  decimalSeparator?: string;
}
```

## Enhanced Features API

### Validation Status

```typescript
// Enable validation status indicators
<FormField
  showValidationStatus={true} // Shows checkmark/X icons
  // ... other props
/>
```

### Character Counter

```typescript
// Enable character counting
<FormField
  type="text"
  maxLength={100}
  showCharacterCount={true} // Shows "45/100" with color coding
  // ... other props
/>
```

### Password Strength

```typescript
// Enable password strength meter
<FormField
  type="password"
  showStrengthIndicator={true}
  strengthCalculator={(password) => ({
    strength: 4, // 1-5 scale
    percentage: 80, // 0-100 for progress bar
    color: "green", // Mantine color
    label: "Strong", // Display label
  })}
  // ... other props
/>
```

### Tooltips

```typescript
// Add contextual help
<FormField
  tooltip={msg`This field accepts only alphanumeric characters`}
  // ... other props
/>
```

## Form Integration

### Zod Schema Integration

```typescript
import { z } from "zod";
import { zodResolver } from "mantine-form-zod-resolver";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Too short"),
});

const form = useForm({
  validate: zodResolver(schema),
  initialValues: { email: "", password: "" },
});
```

### Lingui Integration

```typescript
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react";

function MyForm() {
  const { _ } = useLingui();

  return (
    <FormField
      type="email"
      name="email"
      label={msg`Email Address`}
      placeholder={msg`Enter your email`}
      description={msg`We'll never share your email`}
      tooltip={msg`Must be a valid email format`}
      form={form}
    />
  );
}
```

## Event Handlers

### Form Submission

```typescript
const handleSubmit = async (values: FormData) => {
  try {
    await submitForm(values);
    form.reset();
  } catch (error) {
    // Handle errors
  }
};

<form onSubmit={form.onSubmit(handleSubmit)} noValidate>
  {/* FormField components */}
</form>
```

### Field Events

```typescript
// Password visibility toggle
<FormField
  type="password"
  name="password"
  onVisibilityChange={(visible) => {
    console.log('Password visibility:', visible);
  }}
  form={form}
/>

// File validation
<FormField
  type="file"
  name="avatar"
  fileValidator={(file) => {
    if (file.size > 1024 * 1024) {
      return "File too large";
    }
    return null;
  }}
  form={form}
/>
```

## Styling API

### Size Variants

```typescript
<FormField size="xs" />   // Extra small
<FormField size="sm" />   // Small (default)
<FormField size="md" />   // Medium
<FormField size="lg" />   // Large
<FormField size="xl" />   // Extra large
```

### Style Variants

```typescript
<FormField variant="default" />  // Default styling
<FormField variant="filled" />   // Filled background
<FormField variant="unstyled" /> // No default styling
```

### Custom Styling

```typescript
<FormField
  className="my-custom-field"
  style={{ marginBottom: '1rem' }}
  // ... other props
/>
```

## Accessibility API

### ARIA Attributes

The FormField component automatically handles:

- `aria-label` and `aria-labelledby`
- `aria-describedby` for descriptions and errors
- `aria-invalid` for validation state
- `aria-required` for required fields
- `role` attributes for complex fields

### Screen Reader Support

```typescript
// Automatic screen reader support
<FormField
  type="password"
  name="password"
  label={msg`Password`}
  description={msg`Must be at least 8 characters`}
  showStrengthIndicator // Announces strength changes
  form={form}
/>
```

## Testing API

### Test Utilities

```typescript
import { render, screen } from '@testing-library/react';
import { FormField } from '@/shared/ui';

// Test field rendering
test('renders email field', () => {
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
```

### Mock Form Helper

```typescript
import { useForm } from "@mantine/form";

const createMockForm = (initialValues = {}) => {
  return useForm({
    initialValues,
    validate: {},
  });
};

// Usage in tests
const mockForm = createMockForm({ email: "test@example.com" });
```

## Migration API

### From Basic FormField

```typescript
// Old API
<FormField
  type="text"
  name="name"
  label="Name"
  required
  form={form}
/>

// New API
<FormField
  type="text"
  name="name"
  label={msg`Name`}
  withAsterisk
  showValidationStatus
  form={form}
/>
```

### From Direct Mantine Components

```typescript
// Old Mantine API
<TextInput
  label="Email"
  required
  {...form.getInputProps("email")}
/>

// New FormField API
<FormField
  type="email"
  name="email"
  label={msg`Email`}
  withAsterisk
  showValidationStatus
  form={form}
/>
```

This API reference provides comprehensive coverage of all FormField component capabilities and integration patterns.
