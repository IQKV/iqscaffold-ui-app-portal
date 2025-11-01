import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { FormField } from "./enhanced-form-field";
import { TestWrapper } from "@/shared/lib/test-utils";

// Test schema
const testSchema = z.object({
  text: z.string().min(1, "Text is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  number: z.number().min(0, "Must be positive"),
  select: z.string().min(1, "Please select an option"),
  multiselect: z.array(z.string()).min(1, "Please select at least one"),
  checkbox: z.boolean(),
  switch: z.boolean(),
  textarea: z.string().optional(),
});

type TestFormData = z.infer<typeof testSchema>;

// Test component wrapper
function TestFormField({ type, ...props }: any) {
  const form = useForm<TestFormData>({
    validate: zodResolver(testSchema),
    initialValues: {
      text: "",
      email: "",
      password: "",
      number: 0,
      select: "",
      multiselect: [],
      checkbox: false,
      switch: false,
      textarea: "",
    },
  });

  return (
    <form noValidate>
      <FormField type={type} form={form} {...props} />
    </form>
  );
}

describe("FormField", () => {
  it("renders text input correctly", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="text"
          name="text"
          label="Text Field"
          placeholder="Enter text"
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Text Field")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders email input correctly", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="email"
          name="email"
          label="Email Field"
          placeholder="Enter email"
        />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Email Field");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");
  });

  it("renders password input correctly", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="password"
          name="password"
          label="Password Field"
          placeholder="Enter password"
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Password Field")).toBeInTheDocument();
  });

  it("renders password with strength indicator", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="password"
          name="password"
          label="Password Field"
          showStrengthIndicator
        />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Password Field");
    fireEvent.change(input, { target: { value: "TestPassword123!" } });

    // Should show strength indicator
    expect(screen.getByText(/Password strength/)).toBeInTheDocument();
  });

  it("renders textarea correctly", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="textarea"
          name="textarea"
          label="Textarea Field"
          rows={4}
        />
      </TestWrapper>
    );

    const textarea = screen.getByLabelText("Textarea Field");
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("renders number input correctly", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="number"
          name="number"
          label="Number Field"
          min={0}
          max={100}
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Number Field")).toBeInTheDocument();
  });

  it("renders select correctly", () => {
    const data = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ];

    render(
      <TestWrapper>
        <TestFormField
          type="select"
          name="select"
          label="Select Field"
          data={data}
        />
      </TestWrapper>
    );

    // Check for the input element specifically
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("renders multiselect correctly", () => {
    const data = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ];

    render(
      <TestWrapper>
        <TestFormField
          type="multiselect"
          name="multiselect"
          label="MultiSelect Field"
          data={data}
        />
      </TestWrapper>
    );

    // Check for the input element specifically
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("renders checkbox correctly", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="checkbox"
          name="checkbox"
          label="Checkbox Field"
          checkboxLabel="Check me"
        />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Check me")).toBeInTheDocument();
  });

  it("renders switch correctly", () => {
    render(
      <TestWrapper>
        <TestFormField type="switch" name="switch" label="Switch Field" />
      </TestWrapper>
    );

    expect(screen.getByLabelText("Switch Field")).toBeInTheDocument();
  });

  it("shows asterisk when withAsterisk is true", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="text"
          name="text"
          label="Required Field"
          withAsterisk
        />
      </TestWrapper>
    );

    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows tooltip when provided", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="text"
          name="text"
          label="Field with Tooltip"
          tooltip="This is a helpful tooltip"
        />
      </TestWrapper>
    );

    // Tooltip icon should be present
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows character count for text fields", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="text"
          name="text"
          label="Text with Counter"
          maxLength={10}
          showCharacterCount
        />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Text with Counter");
    fireEvent.change(input, { target: { value: "test" } });

    expect(screen.getByText("4/10")).toBeInTheDocument();
  });

  it("handles disabled state correctly", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="text"
          name="text"
          label="Disabled Field"
          disabled
        />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Disabled Field");
    expect(input).toBeDisabled();
  });

  it("handles loading state correctly", () => {
    render(
      <TestWrapper>
        <TestFormField type="text" name="text" label="Loading Field" loading />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Loading Field");
    expect(input).toBeDisabled();
  });

  it("displays description when provided", () => {
    render(
      <TestWrapper>
        <TestFormField
          type="text"
          name="text"
          label="Field with Description"
          description="This is a helpful description"
        />
      </TestWrapper>
    );

    expect(
      screen.getByText("This is a helpful description")
    ).toBeInTheDocument();
  });

  it("handles user input correctly", () => {
    render(
      <TestWrapper>
        <TestFormField type="text" name="text" label="Interactive Field" />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Interactive Field");
    fireEvent.change(input, { target: { value: "test input" } });

    expect(input).toHaveValue("test input");
  });
});
