import { useState } from "react";
import { Container } from "@mantine/core";
import { UsersDataGrid } from "./users-data-grid";
import { UserFormModal } from "./user-form-modal";
import { User } from "../api/users-api";
import { t } from "@lingui/core/macro";

export function UsersPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

      <UserFormModal
        opened={modalOpened}
        onClose={handleCloseModal}
        user={selectedUser}
        title={modalTitle}
      />
    </Container>
  );
}
