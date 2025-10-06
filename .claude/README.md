# Claude Agent Configuration

This directory contains specialized Claude agents and commands designed for modern React applications using Feature-Sliced Design (FSD) architecture.

## Agents

### 🎯 [typescript-pro](./agents/typescript-pro.md)

Expert TypeScript agent for FSD architecture with React 19, Mantine UI, and strict type safety. Enforces Zod-first development, proper layer boundaries, and modern TypeScript patterns.

**Use for:**

- Type-safe API contracts and validation
- Advanced TypeScript patterns and generics
- Zod schema design and type inference
- Error handling with discriminated unions

### ⚛️ [react-architect](./agents/react-architect.md)

React 19 architecture specialist for FSD-compliant applications. Handles Suspense, concurrent features, Mantine UI integration, and performance optimization patterns.

**Use for:**

- Component architecture and composition
- React 19 concurrent features (Suspense, useTransition)
- Performance optimization patterns
- State management with TanStack Query

### 🏗️ [fsd-enforcer](./agents/fsd-enforcer.md)

Feature-Sliced Design architecture enforcer. Validates layer boundaries, public API compliance, and proper segment organization.

**Use for:**

- Architecture reviews and validation
- Refactoring guidance for FSD compliance
- Layer boundary enforcement
- Public API design patterns

### 🎨 [ui-specialist](./agents/ui-specialist.md)

Mantine UI and accessibility specialist. Creates consistent, accessible, and responsive components following design system principles and WCAG 2.1 AA standards.

**Use for:**

- Mantine UI component development
- Accessibility compliance (WCAG 2.1 AA)
- Responsive design patterns
- Design system consistency

## Commands

### 📋 [review-code](./commands/review-code.md)

Comprehensive code review using all specialized agents to validate architecture, code quality, UI/UX, and accessibility compliance.

### 🚀 [create-feature](./commands/create-feature.md)

Create new features following FSD architecture with complete structure, type safety, React patterns, and UI compliance.

### 🔧 [refactor-architecture](./commands/refactor-architecture.md)

Refactor existing code to comply with FSD architecture and modern development patterns, including migration strategies and breaking change management.

### ⚡ [optimize-performance](./commands/optimize-performance.md)

Analyze and optimize application performance using React 19 patterns, proper memoization, and bundle optimization techniques.

### ♿ [accessibility-audit](./commands/accessibility-audit.md)

Perform comprehensive accessibility audits to ensure WCAG 2.1 AA compliance and inclusive user experience.

## Usage Patterns

### For New Features

```
Use create-feature command with requirements:
- Feature name and functionality description
- Required UI components and interactions
- Data models and API requirements
- Accessibility and responsive design needs
```

### For Code Reviews

```
Use review-code command to:
- Validate FSD architecture compliance
- Check TypeScript patterns and type safety
- Verify UI consistency and accessibility
- Assess performance implications
```

### For Refactoring

```
Use refactor-architecture command to:
- Fix layer boundary violations
- Improve type safety with Zod schemas
- Optimize component performance
- Enhance accessibility compliance
```

### For Performance Issues

```
Use optimize-performance command to:
- Identify rendering bottlenecks
- Implement proper memoization
- Add concurrent React features
- Optimize bundle size and loading
```

### For Accessibility Compliance

```
Use accessibility-audit command to:
- Check WCAG 2.1 AA compliance
- Validate keyboard navigation
- Test screen reader compatibility
- Ensure inclusive design patterns
```

## Agent Collaboration

The agents are designed to work together seamlessly:

1. **fsd-enforcer** validates architectural boundaries
2. **typescript-pro** ensures type safety and validation
3. **react-architect** implements React patterns and performance
4. **ui-specialist** handles UI consistency and accessibility

This collaborative approach ensures comprehensive coverage of all development aspects while maintaining consistency across the codebase.

## Quality Standards

All agents enforce these quality standards:

- **Architecture**: Strict FSD layer boundaries and public APIs
- **Type Safety**: Zod-first development with comprehensive validation
- **Performance**: React 19 patterns with proper optimization
- **Accessibility**: WCAG 2.1 AA compliance throughout
- **Consistency**: Design system adherence and pattern consistency
- **Testing**: Comprehensive test coverage with proper mocking

## Integration with Project

These agents are specifically configured for projects using:

- **Feature-Sliced Design** architecture
- **React 19** with concurrent features
- **TypeScript** in strict mode
- **Mantine UI** design system
- **TanStack Query** for data fetching
- **Zod** for schema validation
- **Vitest** for testing
- **Lingui** for internationalization

The configuration aligns with the project's `.cursor/rules` and development patterns to provide consistent, high-quality code generation and review.
