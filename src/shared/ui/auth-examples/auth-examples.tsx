import React from "react";
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Code,
  Divider,
} from "@mantine/core";
import {
  IconUser,
  IconShield,
  IconCrown,
  IconEdit,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import {
  useAuth,
  RoleGuard,
  AdminGuard,
  SuperAdminGuard,
  UserManagementGuard,
  useAuthOperations,
} from "@/processes/auth";

/**
 * Example component showing different authorization patterns
 */
export function AuthExamples() {
  const { user, hasRole, isAdmin, canManageUsers } = useAuth();
  const { canCreateUsers, canUpdateUsers, canDeleteUsers } =
    useAuthOperations();

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          1. Conditional Rendering with Hooks
        </Title>

        <Stack gap="sm">
          <Text>
            Current user:{" "}
            <strong>
              {user?.firstName} {user?.lastName}
            </strong>
          </Text>

          <Group gap="md">
            {hasRole("USER") && (
              <Button leftSection={<IconUser size={16} />} variant="light">
                User Feature
              </Button>
            )}

            {isAdmin() && (
              <Button
                leftSection={<IconShield size={16} />}
                variant="light"
                color="orange"
              >
                Admin Feature
              </Button>
            )}

            {canManageUsers() && (
              <Button
                leftSection={<IconCrown size={16} />}
                variant="light"
                color="red"
              >
                User Management
              </Button>
            )}
          </Group>
        </Stack>

        <Code block mt="md">
          {`// Conditional rendering with hooks
const { hasRole, isAdmin, canManageUsers } = useAuth();

{hasRole('USER') && <UserFeature />}
{isAdmin() && <AdminFeature />}
{canManageUsers() && <UserManagement />}`}
        </Code>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          2. Authorization Guards
        </Title>

        <Stack gap="md">
          <div>
            <Text fw={500} mb="xs">
              Role Guard Example:
            </Text>
            <RoleGuard roles="USER">
              <Button leftSection={<IconUser size={16} />} variant="outline">
                ✅ USER Role Required
              </Button>
            </RoleGuard>
          </div>

          <div>
            <Text fw={500} mb="xs">
              Admin Guard Example:
            </Text>
            <AdminGuard>
              <Button
                leftSection={<IconShield size={16} />}
                variant="outline"
                color="orange"
              >
                ✅ Admin Access Required
              </Button>
            </AdminGuard>
          </div>

          <div>
            <Text fw={500} mb="xs">
              Super Admin Guard Example:
            </Text>
            <SuperAdminGuard>
              <Button
                leftSection={<IconCrown size={16} />}
                variant="outline"
                color="red"
              >
                ✅ Super Admin Access Required
              </Button>
            </SuperAdminGuard>
          </div>
        </Stack>

        <Code block mt="md">
          {`// Authorization guards
<RoleGuard roles="ADMIN">
  <AdminOnlyContent />
</RoleGuard>

<AdminGuard>
  <AdminFeature />
</AdminGuard>

<SuperAdminGuard>
  <SuperAdminFeature />
</SuperAdminGuard>`}
        </Code>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          3. User Management Operations
        </Title>

        <Group gap="md">
          {canCreateUsers && (
            <Button leftSection={<IconPlus size={16} />} color="green">
              Create User
            </Button>
          )}

          {canUpdateUsers && (
            <Button leftSection={<IconEdit size={16} />} color="blue">
              Edit User
            </Button>
          )}

          {canDeleteUsers && (
            <Button leftSection={<IconTrash size={16} />} color="red">
              Delete User
            </Button>
          )}
        </Group>

        <Code block mt="md">
          {`// User management operations
const { canCreateUsers, canUpdateUsers, canDeleteUsers } = useAuthOperations();

{canCreateUsers && <CreateUserButton />}
{canUpdateUsers && <EditUserButton />}
{canDeleteUsers && <DeleteUserButton />}`}
        </Code>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          4. Multiple Role Requirements
        </Title>

        <Stack gap="md">
          <div>
            <Text fw={500} mb="xs">
              Any of these roles (OR logic):
            </Text>
            <RoleGuard roles={["ADMIN", "SUPER_ADMIN"]} requireAll={false}>
              <Button variant="outline" color="purple">
                ✅ ADMIN OR SUPER_ADMIN Required
              </Button>
            </RoleGuard>
          </div>

          <div>
            <Text fw={500} mb="xs">
              All of these roles (AND logic):
            </Text>
            <RoleGuard roles={["USER", "ADMIN"]} requireAll>
              <Button variant="outline" color="teal">
                ✅ USER AND ADMIN Required
              </Button>
            </RoleGuard>
          </div>
        </Stack>

        <Code block mt="md">
          {`// Multiple role requirements
<RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} requireAll={false}>
  <AdminOrSuperAdminContent />
</RoleGuard>

<RoleGuard roles={['USER', 'ADMIN']} requireAll={true}>
  <UserAndAdminContent />
</RoleGuard>`}
        </Code>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          5. User Management Guard
        </Title>

        <UserManagementGuard>
          <Stack gap="md">
            <Text>
              This content is only visible to users who can manage other users
              (ADMIN or SUPER_ADMIN).
            </Text>

            <Group gap="md">
              <Button leftSection={<IconPlus size={16} />} color="green">
                Add New User
              </Button>
              <Button leftSection={<IconEdit size={16} />} color="blue">
                Bulk Edit Users
              </Button>
              <Button leftSection={<IconTrash size={16} />} color="red">
                Bulk Delete Users
              </Button>
            </Group>
          </Stack>
        </UserManagementGuard>

        <Code block mt="md">
          {`// User management guard
<UserManagementGuard>
  <UserManagementPanel />
</UserManagementGuard>`}
        </Code>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">
          6. Custom Fallback Components
        </Title>

        <RoleGuard
          roles="SUPER_ADMIN"
          fallback={
            <Text c="dimmed" fs="italic">
              🔒 Super Admin access required to view this content
            </Text>
          }
        >
          <Button color="red" variant="filled">
            ✅ Super Admin Only Feature
          </Button>
        </RoleGuard>

        <Code block mt="md">
          {`// Custom fallback component
<RoleGuard 
  roles="SUPER_ADMIN"
  fallback={<CustomAccessDeniedMessage />}
>
  <SuperAdminContent />
</RoleGuard>`}
        </Code>
      </Paper>
    </Stack>
  );
}
