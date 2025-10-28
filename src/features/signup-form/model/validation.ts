import { SignUpFormValues } from "./types";

export const validateSignUpForm = {
  username: (value: string) => {
    if (value.length < 3 || value.length > 50) {
      return "Username must be between 3 and 50 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return null;
  },
  email: (value: string) => {
    if (!/^\S+@\S+$/.test(value)) {
      return "Please enter a valid email";
    }
    return null;
  },
  password: (value: string) => {
    if (value.length < 8 || value.length > 100) {
      return "Password must be between 8 and 100 characters";
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return "Password must include at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return "Password must include at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(value)) {
      return "Password must include at least one number";
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      return "Password must include at least one special character (@$!%*?&)";
    }
    return null;
  },
  confirmPassword: (value: string, values: SignUpFormValues) =>
    value !== values.password ? "Passwords do not match" : null,
  firstName: (value: string) => {
    if (value.length < 1 || value.length > 100) {
      return "First name must be between 1 and 100 characters";
    }
    return null;
  },
  lastName: (value: string) => {
    if (value.length < 1 || value.length > 100) {
      return "Last name must be between 1 and 100 characters";
    }
    return null;
  },
};

export const initialSignUpValues: SignUpFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
};
