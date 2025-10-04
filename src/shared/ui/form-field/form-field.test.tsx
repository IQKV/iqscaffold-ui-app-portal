import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormField } from "./form-field";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const FormFieldTestComponent = ({ type, ...props }: any) => {
  const initialValue = type === "multiselect" ? [] : "";
  const form = useForm({
    initialValues: { testField: initialValue },
  });

  return (
    <FormField
      name="testField"
      label="Test Field"
      form={form}
      type={type}
      {...props}
    />
  );
};

describe("FormField", () => {
  it("renders text input correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" placeholder="Enter text" />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Test Field");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("renders email input correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="email" />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Test Field");
    expect(input).toHaveAttribute("type", "email");
  });

  it("renders password input correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="password" />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Test Field");
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders textarea correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="textarea" rows={5} />
      </TestWrapper>
    );

    const textarea = screen.getByLabelText("Test Field");
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "5");
  });

  it("renders select correctly", () => {
    const data = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ];

    render(
      <TestWrapper>
        <FormFieldTestComponent type="select" data={data} />
      </TestWrapper>
    );

    const select = screen.getByRole("textbox");
    expect(select).toBeInTheDocument();
  });

  it("renders multiselect correctly", () => {
    const data = [
      { value: "option1", label: "Option 1" },
      { value: "option2", label: "Option 2" },
    ];

    render(
      <TestWrapper>
        <FormFieldTestComponent type="multiselect" data={data} />
      </TestWrapper>
    );

    const multiselect = screen.getByRole("textbox");
    expect(multiselect).toBeInTheDocument();
  });

  it("handles required prop correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" required />
      </TestWrapper>
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeRequired();
  });

  it("handles disabled prop correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" disabled />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Test Field");
    expect(input).toBeDisabled();
  });

  it("displays description when provided", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent
          type="text"
          description="This is a test description"
        />
      </TestWrapper>
    );

    expect(screen.getByText("This is a test description")).toBeInTheDocument();
  });

  it("handles user input correctly", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Test Field");
    await user.type(input, "test value");

    expect(input).toHaveValue("test value");
  });

  it("falls back to text input for unknown type", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="unknown" />
      </TestWrapper>
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });
});
