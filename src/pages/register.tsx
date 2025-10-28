import { createFileRoute } from "@tanstack/react-router";
import { SignUpFormFeature } from "@/features/signup-form";
import { AuthLayout } from "@/widgets/auth-layout";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join Gripday and start your journey"
    >
      <SignUpFormFeature redirectToHome />
    </AuthLayout>
  );
}
