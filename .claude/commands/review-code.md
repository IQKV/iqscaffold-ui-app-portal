Use the subagent typescript-pro to perform a comprehensive code review of the current changes. The review should include:

## Architecture Review

- Use fsd-enforcer to validate Feature-Sliced Design compliance
- Check layer boundaries and import hierarchies
- Verify public API usage and cross-feature isolation
- Ensure proper segment organization

## Code Quality Review

- Use typescript-pro to check TypeScript patterns and type safety
- Verify Zod-first development with proper schema validation
- Check for proper error handling and type definitions
- Validate React 19 patterns and performance optimizations

## UI/UX Review

- Use ui-specialist to check Mantine UI compliance
- Verify accessibility standards (WCAG 2.1 AA)
- Check responsive design implementation
- Validate consistent design system usage

## Review Process

1. Compare current branch against the default dev branch
2. Examine all modified, added, and deleted files
3. Check commit messages and change scope
4. Validate that changes follow project conventions
5. Identify any architectural violations or code quality issues

## Report Format

Provide a structured review report with:

- **Summary**: Overall assessment and recommendation
- **Architecture**: FSD compliance and structural issues
- **Code Quality**: TypeScript, patterns, and best practices
- **UI/Accessibility**: Design system and accessibility compliance
- **Performance**: Optimization opportunities and concerns
- **Action Items**: Specific issues to address before merge

Focus on maintainability, scalability, and adherence to established patterns.
