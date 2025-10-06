Perform a comprehensive accessibility audit to ensure WCAG 2.1 AA compliance and inclusive user experience.

## Audit Process

1. Use ui-specialist to analyze component accessibility patterns
2. Use react-architect to check focus management and keyboard navigation
3. Use typescript-pro to validate ARIA types and accessibility APIs
4. Use fsd-enforcer to ensure accessibility patterns are consistent across layers

## Accessibility Standards

### WCAG 2.1 AA Requirements

- **Perceivable**: Information must be presentable in ways users can perceive
- **Operable**: Interface components must be operable by all users
- **Understandable**: Information and UI operation must be understandable
- **Robust**: Content must be robust enough for various assistive technologies

### Key Areas to Audit

- **Color and Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper semantic markup and ARIA attributes
- **Focus Management**: Visible focus indicators and logical tab order
- **Form Accessibility**: Proper labels, error messages, and validation
- **Media Accessibility**: Alt text, captions, and audio descriptions

## Implementation Patterns

### Semantic HTML Structure

```typescript
// ✅ REQUIRED - Proper semantic structure
function AccessibleUserProfile({ user }: { user: User }) {
  return (
    <article role="main" aria-labelledby="profile-heading">
      <header>
        <h1 id="profile-heading">{user.name}</h1>
        <p aria-describedby="user-role">{user.title}</p>
      </header>

      <section aria-labelledby="contact-heading">
        <h2 id="contact-heading">Contact Information</h2>
        <address>
          <p>
            <span className="sr-only">Email: </span>
            <a href={`mailto:${user.email}`}>{user.email}</a>
          </p>
          <p>
            <span className="sr-only">Phone: </span>
            <a href={`tel:${user.phone}`}>{user.phone}</a>
          </p>
        </address>
      </section>
    </article>
  );
}

// ❌ WRONG - Non-semantic structure
function BadUserProfile({ user }: { user: User }) {
  return (
    <div>
      <div>{user.name}</div>  {/* Should be h1 */}
      <div>{user.email}</div> {/* Should be in address */}
    </div>
  );
}
```

### ARIA Attributes and Roles

```typescript
// ✅ REQUIRED - Proper ARIA usage
function AccessibleDataTable({ users }: { users: User[] }) {
  const [sortColumn, setSortColumn] = useState<keyof User>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  return (
    <Table
      role="table"
      aria-label="User management table"
      aria-rowcount={users.length + 1}
    >
      <Table.Thead>
        <Table.Tr role="row">
          <Table.Th
            role="columnheader"
            aria-sort={sortColumn === "name" ? sortDirection : "none"}
            tabIndex={0}
            onClick={() => handleSort("name")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleSort("name");
              }
            }}
          >
            Name
            {sortColumn === "name" && (
              <span aria-hidden="true">
                {sortDirection === "asc" ? " ↑" : " ↓"}
              </span>
            )}
          </Table.Th>
          <Table.Th role="columnheader">Email</Table.Th>
          <Table.Th role="columnheader">
            <span className="sr-only">Actions</span>
          </Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {users.map((user, index) => (
          <Table.Tr key={user.id} role="row" aria-rowindex={index + 2}>
            <Table.Td role="gridcell">{user.name}</Table.Td>
            <Table.Td role="gridcell">{user.email}</Table.Td>
            <Table.Td role="gridcell">
              <Group gap="xs">
                <ActionIcon
                  aria-label={`Edit ${user.name}`}
                  title={`Edit ${user.name}`}
                >
                  <IconEdit />
                </ActionIcon>
                <ActionIcon
                  aria-label={`Delete ${user.name}`}
                  title={`Delete ${user.name}`}
                  color="red"
                >
                  <IconTrash />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
```

### Form Accessibility

```typescript
// ✅ REQUIRED - Accessible form patterns
function AccessibleUserForm({ onSubmit }: { onSubmit: (data: UserFormData) => void }) {
  const form = useForm<UserFormData>({
    initialValues: { name: "", email: "", role: "user" },
    validate: zodResolver(userFormSchema),
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);

  return (
    <form
      onSubmit={form.onSubmit((values) => {
        setSubmitAttempted(true);
        onSubmit(values);
      })}
      noValidate
      aria-describedby="form-instructions"
    >
      <Text id="form-instructions" size="sm" c="dimmed" mb="md">
        All fields marked with an asterisk (*) are required.
      </Text>

      <Stack gap="md">
        <TextInput
          label="Full Name"
          description="Enter your first and last name"
          required
          error={form.errors.name}
          {...form.getInputProps("name")}
          aria-describedby={
            form.errors.name
              ? `name-error ${submitAttempted ? "name-error-live" : ""}`
              : "name-description"
          }
          aria-invalid={!!form.errors.name}
        />

        {form.errors.name && (
          <div
            id="name-error"
            role="alert"
            aria-live={submitAttempted ? "polite" : "off"}
          >
            {form.errors.name}
          </div>
        )}

        <TextInput
          label="Email Address"
          description="We'll use this to send you notifications"
          type="email"
          required
          error={form.errors.email}
          {...form.getInputProps("email")}
          aria-describedby={
            form.errors.email
              ? `email-error ${submitAttempted ? "email-error-live" : ""}`
              : "email-description"
          }
          aria-invalid={!!form.errors.email}
        />

        <Select
          label="Role"
          description="Select your role in the organization"
          required
          data={[
            { value: "user", label: "User" },
            { value: "admin", label: "Administrator" },
            { value: "manager", label: "Manager" },
          ]}
          error={form.errors.role}
          {...form.getInputProps("role")}
          aria-describedby={form.errors.role ? "role-error" : "role-description"}
          aria-invalid={!!form.errors.role}
        />

        <Group justify="flex-end" mt="xl">
          <Button type="submit">
            Create User
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
```

### Focus Management

```typescript
// ✅ REQUIRED - Proper focus management
function AccessibleModal({ opened, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (opened) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    } else {
      // Restore previous focus
      previousFocusRef.current?.focus();
    }
  }, [opened]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      onClose();
    }

    // Trap focus within modal
    if (e.key === "Tab") {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      aria-modal="true"
      aria-labelledby="modal-title"
      role="dialog"
    >
      <div id="modal-title" className="sr-only">
        {title}
      </div>
      {children}
    </Modal>
  );
}
```

### Color and Contrast

```typescript
// ✅ REQUIRED - Accessible color patterns
function AccessibleStatusBadge({ status }: { status: UserStatus }) {
  const getStatusProps = (status: UserStatus) => {
    switch (status) {
      case "active":
        return {
          color: "green",
          icon: <IconCheck size="0.8rem" />,
          "aria-label": "Active status",
        };
      case "inactive":
        return {
          color: "gray",
          icon: <IconX size="0.8rem" />,
          "aria-label": "Inactive status",
        };
      case "pending":
        return {
          color: "yellow",
          icon: <IconClock size="0.8rem" />,
          "aria-label": "Pending status",
        };
      default:
        return {
          color: "gray",
          icon: null,
          "aria-label": "Unknown status",
        };
    }
  };

  const statusProps = getStatusProps(status);

  return (
    <Badge
      {...statusProps}
      variant="light"
      leftSection={statusProps.icon}
    >
      {status}
    </Badge>
  );
}

// ✅ REQUIRED - High contrast mode support
function HighContrastButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      style={(theme) => ({
        ...props.style,
        "@media (prefers-contrast: high)": {
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: theme.colors.dark[9],
        },
      })}
    >
      {children}
    </Button>
  );
}
```

## Audit Checklist

### Keyboard Navigation

- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical and intuitive
- [ ] Focus indicators are visible and clear
- [ ] Skip links are provided for main content
- [ ] Keyboard shortcuts don't conflict with assistive technology

### Screen Reader Support

- [ ] Proper heading hierarchy (h1, h2, h3, etc.)
- [ ] ARIA labels and descriptions are meaningful
- [ ] Form labels are properly associated
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced

### Visual Accessibility

- [ ] Color contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Information is not conveyed by color alone
- [ ] Text can be resized up to 200% without loss of functionality
- [ ] Focus indicators are visible
- [ ] Animation can be disabled (prefers-reduced-motion)

### Form Accessibility

- [ ] All form controls have labels
- [ ] Required fields are clearly marked
- [ ] Error messages are descriptive and helpful
- [ ] Form validation is accessible
- [ ] Fieldsets and legends are used for grouped controls

### Media Accessibility

- [ ] Images have appropriate alt text
- [ ] Decorative images have empty alt attributes
- [ ] Videos have captions and transcripts
- [ ] Audio content has transcripts
- [ ] Complex images have detailed descriptions

## Testing Tools and Methods

### Automated Testing

```typescript
// ✅ REQUIRED - Accessibility tests
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("UserCard Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(<UserCard user={mockUser} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should be keyboard navigable", async () => {
    render(<UserCard user={mockUser} onEdit={mockEdit} onDelete={mockDelete} />);

    // Tab to edit button
    await userEvent.tab();
    expect(screen.getByLabelText(`Edit ${mockUser.name}`)).toHaveFocus();

    // Tab to delete button
    await userEvent.tab();
    expect(screen.getByLabelText(`Delete ${mockUser.name}`)).toHaveFocus();
  });

  it("should announce changes to screen readers", async () => {
    render(<UserStatusUpdater user={mockUser} />);

    const statusButton = screen.getByRole("button", { name: /change status/i });
    await userEvent.click(statusButton);

    expect(screen.getByRole("status")).toHaveTextContent("Status updated to active");
  });
});
```

### Manual Testing Checklist

- [ ] Navigate entire application using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify high contrast mode compatibility
- [ ] Test with browser zoom at 200%
- [ ] Validate color-blind accessibility
- [ ] Check focus management in modals and dropdowns

The accessibility audit should result in an inclusive application that works for all users, regardless of their abilities or assistive technologies used.
