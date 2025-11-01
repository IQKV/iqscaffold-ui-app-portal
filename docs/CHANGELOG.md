# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Comprehensive FormField Component**: New unified form field component with 15+ field types
  - Text fields: text, email, tel, url, search
  - Password fields with strength indicator
  - Textarea with character counter and auto-resize
  - Number fields with validation and formatting
  - Select and multi-select with search and grouping
  - Date, time, and datetime pickers
  - Boolean fields: checkbox, switch, radio groups
  - File upload with validation
  - Color picker with swatches
- **Enhanced UX Features**:
  - Validation status indicators (checkmarks/X icons)
  - Password strength meter with customizable calculation
  - Character counters with color-coded limits
  - Tooltips for contextual help
  - Loading states and accessibility support
- **Mantine + Zod + Lingui Integration**:
  - Seamless Zod validation with zodResolver
  - Full Lingui internationalization support
  - Mantine UI component integration
  - TypeScript interfaces for all field types
- **Comprehensive Documentation**:
  - Complete FormField component guide
  - API reference documentation
  - Migration guide from basic form fields
  - Best practices and troubleshooting

### Changed

- **BREAKING**: Removed basic `FormField` component in favor of comprehensive solution
- **BREAKING**: Form validation now uses Zod schemas instead of HTML5 validation
- Updated all form implementations to use new FormField component:
  - Login form with validation status
  - User form modal with password strength indicator
  - Sample form with enhanced field types
- Disabled HTML5 form validation across all forms (added `noValidate` attribute)
- Updated form field props: removed `required`, added `withAsterisk` for visual indicators

### Improved

- **Form Development Experience**:
  - Single component for all form field needs
  - Consistent validation and error handling
  - Enhanced accessibility and screen reader support
  - Better TypeScript support with exported interfaces
- **User Experience**:
  - Visual feedback for form validation
  - Helpful features like password strength and character counting
  - Improved internationalization support
  - Better mobile and keyboard navigation
- **Developer Experience**:
  - Comprehensive test suite (17 test cases)
  - Clear migration path from old components
  - Extensive documentation and examples
  - Type-safe field configuration

### Fixed

- ESLint issues with curly braces and alert usage
- TypeScript interface exports for external usage
- Form submission timeout issues in test environment
- Accessibility issues with form field labeling

### Documentation

- Added comprehensive FormField component documentation
- Updated architecture documentation with form patterns
- Created API reference for FormField component
- Updated main README with quick reference examples
- Added migration guide and best practices

## Previous Versions

### [1.0.0] - Initial Release

- Initial project setup with Feature-Sliced Design
- Mantine UI integration
- TanStack Router and Query setup
- Basic authentication system
- MSW for API mocking
- Comprehensive testing setup
- CI/CD pipeline configuration

---

## Migration Guide

### From Basic FormField to Enhanced FormField

```typescript
// Before
<FormField
  type="text"
  name="email"
  label="Email"
  required
  form={form}
/>

// After
<FormField
  type="email"
  name="email"
  label={msg`Email`}
  withAsterisk
  showValidationStatus
  form={form}
/>
```

### Form Setup Changes

```typescript
// Before - HTML5 validation
<form onSubmit={form.onSubmit(handleSubmit)}>

// After - Zod validation
<form onSubmit={form.onSubmit(handleSubmit)} noValidate>
```

### Validation Schema Updates

```typescript
// Before - Basic validation
const form = useForm({
  initialValues: { email: "" },
  validate: {
    email: (value) => (value ? null : "Required"),
  },
});

// After - Zod schema validation
const schema = z.object({
  email: z.string().email(_(msg`Invalid email`)),
});

const form = useForm({
  validate: zodResolver(schema),
  initialValues: { email: "" },
});
```

For detailed migration instructions, see the [FormField Component Guide](./form-field-component.md).
