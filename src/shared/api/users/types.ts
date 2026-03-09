// User API Type Definitions

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  roles: string[];
  active: boolean;
}

export interface UserListParams {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  size?: number;
}
