# 📚 Project Documentation

Welcome to the comprehensive documentation for the Mantine UI Project Layout. This documentation covers all aspects of the project from architecture to deployment.

## 📖 Documentation Structure

### [🏗️ Architecture](./architecture/README.md)

- Feature-Sliced Design methodology
- Technology stack overview
- Component architecture patterns
- State management strategies
- Performance optimization techniques

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

## 📋 Project Standards

### Code Organization

- Follow Feature-Sliced Design methodology
- Use TypeScript for type safety
- Implement proper error boundaries
- Write comprehensive tests

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

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../LICENSE) file for details.
