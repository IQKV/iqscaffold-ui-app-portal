import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useForm } from "@mantine/form";
import { FormField } from "./enhanced-form-field";
import { TestWrapper } from "@/shared/lib/test-utils";

function TestFormComponent() {
  const form = useForm({
    initialValues: {
      email: "",
      name: "",
    },
  });

  return (
    <form>
      <FormField
        type="email"
        name="email"
        label="Email"
        placeholder="Enter email"
        form={form}
      />
      <FormField
        type="text"
        name="name"
        label="Name"
        placeholder="Enter name"
        form={form}
        withAsterisk
      />
    </form>
  );
}

describe("FormField", () => {
  it("renders text input field", () => {
    render(
      <TestWrapper>
        <TestFormComponent />
      </TestWrapper>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
  });

  it("renders required asterisk when withAsterisk is true", () => {
    render(
      <TestWrapper>
        <TestFormComponent />
      </TestWrapper>
    );

    const nameLabel = screen.getByText(/name/i);
    expect(nameLabel).toBeInTheDocument();
  });

  it("renders input with correct type", () => {
    render(
      <TestWrapper>
        <TestFormComponent />
      </TestWrapper>
    );

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("type", "email");
  });
});
