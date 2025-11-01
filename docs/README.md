# 📚 Project Documentation

Welcome to the comprehensive documentation for the Mantine UI Project Layout. This documentation covers all aspects of the project from architecture to deployment.

## 📖 Documentation Structure

### [🏗️ Architecture](./architecture/README.md)

- Feature-Sliced Design methodology
- Technology stack overview
- Component architecture patterns
- State management strategies
- Performance optimization techniques

### [📝 Form Development](./form-field-component.md)

- Comprehensive FormField component guide
- 15+ field types with enhanced UX features
- Mantine + Zod + Lingui integration
- Validation strategies and best practices
- Migration guide from basic form fields

### [📡 API Documentation](./api/README.md)

- API client configuration
- Authentication patterns
- Endpoint reference
- Error handling strategies
- Mock Service Worker setup
- Testing API integration

### [🚀 Deployment Guide](./deployment/README.md)

- Quick deployment steps
- Multiple deployment options (Vercel, Netlify, Docker)
- CI/CD pipeline setup
- Performance optimization
- Security configurations

## 🚀 Quick Start

1. **Setup Development Environment**

   ```bash
   pnpm install
   cp .env.example .env
   pnpm dev
   ```

2. **Run Tests**

   ```bash
   pnpm test          # Unit tests
   pnpm e2e           # E2E tests
   ```

3. **Build for Production**
   ```bash
   pnpm build
   pnpm preview
   ```

## 🎯 Quick Reference

### FormField Component

```typescript
import { FormField } from "@/shared/ui";
import { msg } from "@lingui/core/macro";

// Basic usage with enhanced features
<FormField
  type="email"
  name="email"
  label={msg`Email Address`}
  placeholder={msg`Enter your email`}
  form={form}
  withAsterisk
  showValidationStatus
/>

// Password with strength indicator
<FormField
  type="password"
  name="password"
  label={msg`Password`}
  form={form}
  withAsterisk
  showStrengthIndicator
/>

// Select with search and internationalization
<FormField
  type="select"
  name="country"
  label={msg`Country`}
  data={countries}
  form={form}
  searchable
  clearable
/>
```

### Form Setup Pattern

```typescript
// 1. Define Zod schema with i18n messages
const schema = z.object({
  email: z.string().email(_(msg`Invalid email`)),
  password: z.string().min(8, _(msg`Password too short`)),
});

// 2. Setup Mantine form with zodResolver
const form = useForm({
  validate: zodResolver(schema),
  initialValues: { email: "", password: "" },
});

// 3. Form with noValidate attribute
<form onSubmit={form.onSubmit(handleSubmit)} noValidate>
  {/* FormField components */}
</form>
```

## 🔧 Development Workflow

### Code Quality

- **Linting**: ESLint with React and TypeScript rules
- **Formatting**: Prettier with automatic formatting
- **Type Checking**: TypeScript strict mode
- **Testing**: Vitest for unit tests, Playwright for E2E

### Git Workflow

- **Conventional Commits**: Enforced via commitlint
- **Pre-commit Hooks**: Husky for code quality checks
- **Automated Releases**: Release-it with conventional changelog

### Development Tools

- **Hot Reload**: Vite with instant HMR
- **DevTools**: React Query and Router devtools
- **Storybook**: Component development and documentation
- **Form Validation**: Comprehensive FormField component with Mantine + Zod + Lingui integration

## 📋 Project Standards

### Code Organization

- Follow Feature-Sliced Design methodology
- Use TypeScript for type safety
- Implement proper error boundaries
- Write comprehensive tests
- Use unified FormField component for all form inputs

### Form Development

- **Validation**: Use Zod schemas with mantine-form-zod-resolver
- **Internationalization**: Integrate Lingui for all form labels and messages
- **UX Enhancement**: Leverage validation status indicators, character counters, and password strength meters
- **Accessibility**: Ensure proper ARIA attributes and screen reader support
- **HTML5 Validation**: Disabled in favor of Zod validation for consistency

### Performance

- Lazy load routes and heavy components
- Optimize bundle size with code splitting
- Implement proper caching strategies
- Monitor Core Web Vitals

### Accessibility

- Follow WCAG 2.1 guidelines
- Use semantic HTML elements
- Implement proper ARIA attributes
- Test with screen readers

### Security

- Validate all user inputs
- Implement proper authentication
- Use secure HTTP headers
- Regular dependency updates

## 🤝 Contributing

Please read our [Contributing Guidelines](./.github/CONTRIBUTING.md) before submitting pull requests.

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Review

- All changes require code review
- Automated checks must pass
- Documentation must be updated
- Tests must be included

## 📞 Support

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Security**: Report security issues privately via email

## 📋 Additional Resources

- **[Changelog](./CHANGELOG.md)** - Version history and migration guides
- **[Mantine + Zod Validation Guide](./mantine-zod-validation-guide.md)** - Form validation patterns
- **[Authentication Guide](./authentication.md)** - Auth implementation details
- **[MSW Implementation](./msw-implementation.md)** - API mocking setup

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
