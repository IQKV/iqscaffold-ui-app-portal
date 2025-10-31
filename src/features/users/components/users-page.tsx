import { useState } from "react";
import { Container, Alert, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { UsersDataGrid } from "./users-data-grid";
import { UserFormModal } from "./user-form-modal";
import { User } from "../api/users-api";
import { useAuth, UserManagementGuard } from "@/shared/lib";
import { t } from "@lingui/core/macro";

export function UsersPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isAuthenticated } = useAuth();

  // Check if user has access to view users page
  if (!isAuthenticated) {
    return (
      <Container size="xl" py="md">
        <Alert
          variant="light"
          color="red"
          title="Access Denied"
          icon={<IconLock size={16} />}
        >
          <Text size="sm">You must be logged in to view this page.</Text>
        </Alert>
      </Container>
    );
  }

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalOpened(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalOpened(true);
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setSelectedUser(null);
  };

  const modalTitle = selectedUser ? t`Edit User` : t`Create New User`;

  return (
    <Container size="xl" py="md">
      <UsersDataGrid
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
      />

      <UserManagementGuard>
        <UserFormModal
          opened={modalOpened}
          onClose={handleCloseModal}
          user={selectedUser}
          title={modalTitle}
        />
      </UserManagementGuard>
    </Container>
  );
}
