import { SignInFormValues } from "./types";

export const validateSignInForm = {
  username: (value: string) =>
    value.length < 3 ? "Username or email must be at least 3 characters" : null,
  password: (value: string) =>
    value.length < 1 ? "Password is required" : null,
};

export const initialSignInValues: SignInFormValues = {
  username: "",
  password: "",
  rememberMe: false,
};
