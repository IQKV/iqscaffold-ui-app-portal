# Comprehensive Form Field Guide: Mantine + Zod + Lingui

This guide explains how to use the enhanced `FormField` component that integrates Mantine forms, Zod validation, and Lingui internationalization.

## Overview

The `FormField` component is a comprehensive form field solution that combines:

- **Mantine UI components** for consistent design
- **Zod schemas** for robust validation
- **Lingui integration** for internationalization
- **Enhanced UX features** like validation status, character counts, password strength
- **Type safety** with full TypeScript support

## Features

- ✅ **15+ field types**: text, email, password, number, select, multiselect, date, time, textarea, checkbox, switch, radio, file, color
- ✅ **Validation status indicators**: visual feedback for valid/invalid states
- ✅ **Password strength meter**: with customizable calculation
- ✅ **Character counters**: for text fields with limits
- ✅ **Internationalization**: full Lingui support for labels, placeholders, descriptions
- ✅ **Accessibility**: proper ARIA attributes and screen reader support
- ✅ **Loading states**: disabled state during async operations
- ✅ **Tooltips**: contextual help for complex fields

## Key Principles

### 1. Disable HTML5 Validation

Always add `noValidate` to your form elements:

```tsx
<form onSubmit={form.onSubmit(handleSubmit)} noValidate>
  {/* form fields */}
</form>
```

### 2. Remove `required` Props

Don't use the `required` prop on form inputs. Validation is handled by Zod:

```tsx
// ❌ Don't do this
<TextInput
  label="Email"
  required
  {...form.getInputProps("email")}
/>

// ✅ Do this instead
<TextInput
  label="Email"
  {...form.getInputProps("email")}
/>
```

### 3. Use Zod for All Validation

Define comprehensive Zod schemas:

```tsx
const schema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[a-z]/, "Must contain lowercase letter")
    .regex(/[0-9]/, "Must contain number"),
});
```

### 4. Use zodResolver

Connect Zod schemas to Mantine forms:

```tsx
import { zodResolver } from "mantine-form-zod-resolver";

const form = useForm({
  validate: zodResolver(schema),
  initialValues: {
    email: "",
    password: "",
  },
});
```

## Complete Example

```tsx
import React from "react";
import { Paper, Button, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { FormField } from "@/shared/ui";
import { msg } from "@lingui/core/macro";

// Define validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginFormData>({
    validate: zodResolver(loginSchema),
    initialValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = (values: LoginFormData) => {
    console.log("Form submitted:", values);
  };

  return (
    <Paper p="md" withBorder>
      {/* IMPORTANT: noValidate disables HTML5 validation */}
      <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
        <Stack gap="md">
          <FormField
            type="email"
            name="email"
            label={msg`Email`}
            placeholder={msg`Enter your email`}
            form={form}
            withAsterisk
            showValidationStatus
          />

          <FormField
            type="password"
            name="password"
            label={msg`Password`}
            placeholder={msg`Enter your password`}
            form={form}
            withAsterisk
            showStrengthIndicator
          />

          <Button type="submit">Login</Button>
        </Stack>
      </form>
    </Paper>
  );
}
```

## Advanced Validation Patterns

### Complex Field Validation

```tsx
const userSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),

  age: z
    .number()
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),

  interests: z
    .array(z.string())
    .min(1, "Please select at least one interest")
    .max(5, "Please select no more than 5 interests"),
});
```

### Cross-Field Validation

```tsx
const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

### Conditional Validation

```tsx
const profileSchema = z
  .object({
    hasAddress: z.boolean(),
    address: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.hasAddress && !data.address) {
        return false;
      }
      return true;
    },
    {
      message: "Address is required when 'Has Address' is checked",
      path: ["address"],
    }
  );
```

## Field Types and Props

### Text Fields

```tsx
<FormField
  type="text" // or "email", "tel", "url", "search"
  name="firstName"
  label={msg`First Name`}
  placeholder={msg`Enter your first name`}
  form={form}
  withAsterisk
  maxLength={50}
  showCharacterCount
  showValidationStatus
  leftSection={<IconUser size={16} />}
/>
```

### Password Fields

```tsx
<FormField
  type="password"
  name="password"
  label={msg`Password`}
  form={form}
  withAsterisk
  showStrengthIndicator
  strengthCalculator={(password) => ({
    strength: calculateCustomStrength(password),
    label: "Custom strength",
    color: "blue",
    percentage: 75,
  })}
/>
```

### Select Fields

```tsx
<FormField
  type="select"
  name="country"
  label={msg`Country`}
  data={[
    { value: "us", label: msg`United States` },
    { value: "ca", label: msg`Canada` },
  ]}
  form={form}
  searchable
  clearable
  creatable
  createLabel={msg`Create new option`}
/>
```

### Multi-Select Fields

```tsx
<FormField
  type="multiselect"
  name="interests"
  label={msg`Interests`}
  data={interestOptions}
  form={form}
  maxValues={5}
  searchable
  hidePickedOptions
/>
```

### Textarea Fields

```tsx
<FormField
  type="textarea"
  name="description"
  label={msg`Description`}
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

```tsx
<FormField
  type="number"
  name="age"
  label={msg`Age`}
  form={form}
  min={18}
  max={120}
  step={1}
  hideControls
  thousandSeparator=","
/>
```

### Date/Time Fields

```tsx
<FormField
  type="date"
  name="birthDate"
  label={msg`Birth Date`}
  form={form}
  minDate={new Date(1900, 0, 1)}
  maxDate={new Date()}
/>

<FormField
  type="time"
  name="appointmentTime"
  label={msg`Appointment Time`}
  form={form}
  format="24"
  withSeconds
/>
```

### Boolean Fields

```tsx
<FormField
  type="checkbox"
  name="agreeToTerms"
  label={msg`Terms and Conditions`}
  checkboxLabel={msg`I agree to the terms and conditions`}
  form={form}
/>

<FormField
  type="switch"
  name="notifications"
  label={msg`Email Notifications`}
  description={msg`Receive email updates`}
  form={form}
  onLabel={msg`On`}
  offLabel={msg`Off`}
/>
```

### Radio Fields

```tsx
<FormField
  type="radio"
  name="plan"
  label={msg`Subscription Plan`}
  data={[
    {
      value: "basic",
      label: msg`Basic Plan`,
      description: "$9.99/month",
    },
    {
      value: "premium",
      label: msg`Premium Plan`,
      description: "$19.99/month",
    },
  ]}
  form={form}
  orientation="vertical"
/>
```

## Migration Checklist

When updating existing forms:

- [ ] Add `noValidate` to all `<form>` elements
- [ ] Remove `required` props from all form inputs
- [ ] Create Zod schemas for validation
- [ ] Use `zodResolver` in `useForm`
- [ ] Update form field components to not use `required` prop
- [ ] Test all validation scenarios
- [ ] Update tests to not expect HTML5 validation

## Benefits

1. **Consistent UX**: Same validation behavior across all browsers
2. **Better Error Messages**: Custom, user-friendly error messages
3. **Type Safety**: Full TypeScript support with inferred types
4. **Complex Logic**: Support for cross-field validation and conditional rules
5. **Server Compatibility**: Same validation logic can be used on the server
6. **Accessibility**: Better screen reader support with proper error associations

## Common Patterns

### Loading States

```tsx
const [isLoading, setIsLoading] = useState(false);

const handleSubmit = async (values: FormData) => {
  setIsLoading(true);
  try {
    await submitForm(values);
  } finally {
    setIsLoading(false);
  }
};

// Disable form during loading
<Button type="submit" loading={isLoading}>
  Submit
</Button>;
```

### Form Reset

```tsx
const handleReset = () => {
  form.reset();
};

<Button type="button" variant="subtle" onClick={handleReset}>
  Reset Form
</Button>;
```

### Dynamic Validation

```tsx
// Update validation based on form state
useEffect(() => {
  if (form.values.userType === "business") {
    // Apply business-specific validation
    form.setFieldValue("companyName", "");
  }
}, [form.values.userType]);
```

This approach ensures robust, accessible, and maintainable form validation throughout your application.
