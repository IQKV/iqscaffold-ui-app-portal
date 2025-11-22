# User Preferences Feature

Complete React integration for the User Preference API, allowing users to manage their personal settings and preferences.

## Overview

This feature provides a full-stack integration with the backend User Preference API, including:

- TypeScript types matching backend DTOs
- API client with proper error handling
- React Query hooks for data fetching and mutations
- Comprehensive form component for managing all preferences
- Quick theme switcher component
- Automatic cache management and optimistic updates

## Architecture

```
src/
├── entities/user/
│   ├── model/
│   │   ├── user-preference-types.ts    # TypeScript types
│   │   └── use-user-preferences.ts     # React Query hooks
│   └── index.ts                         # Public exports
├── features/user-preferences/
│   ├── user-preferences-form.tsx        # Main form component
│   ├── quick-theme-switcher.tsx         # Quick theme switcher
│   ├── index.ts                         # Feature exports
│   └── README.md                        # This file
├── pages/
│   └── user-preferences.tsx             # Preferences page
└── shared/api/
    └── user-preference-api.ts           # API client
```

## API Endpoints

All endpoints are authenticated and users can only manage their own preferences.

### Base URL

```
/api/v1/users/me/preferences
```

### Endpoints

- `GET /api/v1/users/me/preferences` - Get current user's preferences
- `PATCH /api/v1/users/me/preferences` - Update preferences
- `DELETE /api/v1/users/me/preferences` - Reset to defaults

## Usage

### 1. Using React Query Hooks

```tsx
import {
  useUserPreferences,
  useUpdateUserPreferences,
  useDeleteUserPreferences,
} from "@/entities/user";

function MyComponent() {
  // Fetch preferences
  const { data: preferences, isLoading, error } = useUserPreferences();

  // Update preferences
  const updateMutation = useUpdateUserPreferences();

  // Delete preferences
  const deleteMutation = useDeleteUserPreferences();

  const handleUpdateTheme = () => {
    updateMutation.mutate({ theme: "dark" });
  };

  const handleReset = () => {
    deleteMutation.mutate();
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading preferences</div>;

  return (
    <div>
      <p>Current theme: {preferences?.theme}</p>
      <button onClick={handleUpdateTheme}>Switch to Dark</button>
      <button onClick={handleReset}>Reset Preferences</button>
    </div>
  );
}
```

### 2. Using the Full Form Component

```tsx
import { UserPreferencesForm } from "@/features/user-preferences";

function PreferencesPage() {
  return (
    <Container>
      <Title>My Preferences</Title>
      <UserPreferencesForm />
    </Container>
  );
}
```

### 3. Using the Quick Theme Switcher

```tsx
import { QuickThemeSwitcher } from "@/features/user-preferences";

function Header() {
  return (
    <header>
      <nav>...</nav>
      <QuickThemeSwitcher />
    </header>
  );
}
```

### 4. Direct API Calls

```tsx
import { userPreferenceApi } from "@/shared/api";

// Get preferences
const preferences = await userPreferenceApi.getMyPreferences();

// Update preferences
const updated = await userPreferenceApi.updateMyPreferences({
  theme: "dark",
  locale: "fr",
  notificationEmail: false,
});

// Delete preferences
await userPreferenceApi.deleteMyPreferences();
```

## TypeScript Types

### UserPreference

```typescript
interface UserPreference {
  id: number;
  userId: number;
  username: string;
  locale: string;
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  theme: "light" | "dark" | "auto";
  profilePhotoUrl: string | null;
  phoneNumber: string | null;
  bio: string | null;
  notificationEmail: boolean;
  notificationSms: boolean;
  notificationPush: boolean;
  twoFactorEnabled: boolean;
  twoFactorMethod: "sms" | "email" | "app" | null;
  customSettings: string | null;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}
```

### UpdateUserPreferenceRequest

```typescript
interface UpdateUserPreferenceRequest {
  locale?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
  theme?: "light" | "dark" | "auto";
  profilePhotoUrl?: string;
  phoneNumber?: string;
  bio?: string;
  notificationEmail?: boolean;
  notificationSms?: boolean;
  notificationPush?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorMethod?: "sms" | "email" | "app";
  customSettings?: string;
}
```

## Features

### Localization

- Language preference (locale)
- Timezone selection
- Currency preference
- Date and time format customization

### Display

- Theme selection (light/dark/auto)

### Profile

- Profile photo URL
- Phone number
- Personal bio

### Notifications

- Email notification toggle
- SMS notification toggle
- Push notification toggle

### Security

- Two-factor authentication enable/disable
- 2FA method selection (SMS, email, or authenticator app)

### Custom Settings

- JSON string for application-specific settings

## React Query Configuration

The hooks use the following query key:

```typescript
const USER_PREFERENCES_QUERY_KEY = ["user", "preferences"];
```

### Cache Behavior

- **Stale time**: 5 minutes
- **Auto-refetch**: On window focus
- **Optimistic updates**: Enabled for mutations
- **Error handling**: Global error notifications

## Error Handling

All API calls include automatic error handling:

- Network errors show global notifications
- Validation errors are returned in the mutation error
- 401 errors trigger automatic token refresh
- Failed mutations show error notifications

## Validation

The backend validates:

- `theme`: Must be "light", "dark", or "auto"
- `twoFactorMethod`: Must be "sms", "email", or "app"
- `locale`: Max 10 characters
- `timezone`: Max 50 characters
- `currency`: Max 3 characters
- `profilePhotoUrl`: Max 500 characters
- `phoneNumber`: Max 50 characters
- `bio`: Max 1000 characters

## Examples

### Update Multiple Preferences

```tsx
const updateMutation = useUpdateUserPreferences();

updateMutation.mutate({
  theme: "dark",
  locale: "fr",
  timezone: "Europe/Paris",
  currency: "EUR",
  notificationEmail: true,
  notificationPush: false,
});
```

### Enable Two-Factor Authentication

```tsx
const updateMutation = useUpdateUserPreferences();

updateMutation.mutate({
  twoFactorEnabled: true,
  twoFactorMethod: "app",
});
```

### Update Profile Information

```tsx
const updateMutation = useUpdateUserPreferences();

updateMutation.mutate({
  profilePhotoUrl: "https://example.com/photo.jpg",
  phoneNumber: "+1234567890",
  bio: "Software developer passionate about clean code",
});
```

### Custom Settings

```tsx
const updateMutation = useUpdateUserPreferences();

// Store custom app settings as JSON
updateMutation.mutate({
  customSettings: JSON.stringify({
    sidebar: "collapsed",
    notifications: { sound: true, desktop: false },
    editor: { fontSize: 14, theme: "monokai" },
  }),
});
```

## Testing

### Unit Tests

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserPreferences } from "@/entities/user";

test("fetches user preferences", async () => {
  const queryClient = new QueryClient();
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useUserPreferences(), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

### Integration Tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { UserPreferencesForm } from "@/features/user-preferences";

test("updates theme preference", async () => {
  render(<UserPreferencesForm />);

  const themeSelect = screen.getByLabelText("Theme");
  fireEvent.change(themeSelect, { target: { value: "dark" } });

  const saveButton = screen.getByText("Save Preferences");
  fireEvent.click(saveButton);

  await screen.findByText("Your preferences have been saved successfully.");
});
```

## Best Practices

1. **Use hooks for data fetching**: Always use `useUserPreferences()` instead of direct API calls
2. **Handle loading states**: Show loading indicators while fetching or updating
3. **Show error messages**: Display user-friendly error messages
4. **Optimistic updates**: The hooks handle cache updates automatically
5. **Validate input**: Use form validation before submitting
6. **Confirm destructive actions**: Ask for confirmation before resetting preferences

## Troubleshooting

### Preferences not loading

- Check if user is authenticated (JWT token present)
- Verify API endpoint is accessible
- Check browser console for errors

### Updates not persisting

- Ensure mutation is successful (check network tab)
- Verify backend validation passes
- Check if cache is being updated correctly

### Theme not applying

- Ensure theme value is one of: "light", "dark", "auto"
- Check if theme is being read from preferences
- Verify theme application logic in your app

## Related Documentation

- [Backend API Documentation](../../../../../USER_PREFERENCE_API.md)
- [Preference APIs Summary](../../../../../PREFERENCE_APIS_SUMMARY.md)
- [React Query Documentation](https://tanstack.com/query/latest)
