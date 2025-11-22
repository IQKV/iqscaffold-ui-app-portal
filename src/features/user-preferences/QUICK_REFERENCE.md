# User Preferences - Quick Reference

## 🚀 Import Statements

```tsx
// Hooks
import {
  useUserPreferences,
  useUpdateUserPreferences,
  useDeleteUserPreferences,
  useTheme,
  useLocale,
  useTimezone,
  useCurrency,
  useNotificationSettings,
  useTwoFactorStatus,
} from "@/entities/user";

// Components
import {
  UserPreferencesForm,
  QuickThemeSwitcher,
  PreferenceCard,
} from "@/features/user-preferences";

// API Client (if needed)
import { userPreferenceApi } from "@/shared/api";

// Types
import type {
  UserPreference,
  UpdateUserPreferenceRequest,
  ThemeOption,
  TwoFactorMethod,
} from "@/entities/user";
```

## 📖 Common Patterns

### Fetch Preferences

```tsx
const { data, isLoading, error } = useUserPreferences();
```

### Update Single Field

```tsx
const updateMutation = useUpdateUserPreferences();
updateMutation.mutate({ theme: "dark" });
```

### Update Multiple Fields

```tsx
updateMutation.mutate({
  theme: "dark",
  locale: "fr",
  timezone: "Europe/Paris",
  notificationEmail: false,
});
```

### Reset to Defaults

```tsx
const deleteMutation = useDeleteUserPreferences();
deleteMutation.mutate();
```

### Get Specific Value

```tsx
const theme = useTheme();
const locale = useLocale();
const timezone = useTimezone();
```

### Check Notification Settings

```tsx
const { email, sms, push } = useNotificationSettings();
```

### Check 2FA Status

```tsx
const { enabled, method } = useTwoFactorStatus();
```

## 🎨 Component Usage

### Full Form

```tsx
<UserPreferencesForm />
```

### Theme Switcher

```tsx
<QuickThemeSwitcher />
```

### Summary Card

```tsx
<PreferenceCard />
```

## 🔧 Advanced Usage

### With Loading State

```tsx
const { data, isLoading } = useUserPreferences();

if (isLoading) return <Loader />;
return <div>{data?.theme}</div>;
```

### With Error Handling

```tsx
const { data, error } = useUserPreferences();

if (error) return <Alert>Error loading preferences</Alert>;
return <div>{data?.theme}</div>;
```

### With Mutation Callbacks

```tsx
const updateMutation = useUpdateUserPreferences();

updateMutation.mutate(
  { theme: "dark" },
  {
    onSuccess: (data) => console.log("Updated:", data),
    onError: (error) => console.error("Failed:", error),
  }
);
```

### Conditional Rendering

```tsx
const theme = useTheme();

return (
  <>
    {theme === "dark" && <DarkModeFeature />}
    {theme === "light" && <LightModeFeature />}
  </>
);
```

## 📊 Preference Fields

| Field               | Type                              | Options                         |
| ------------------- | --------------------------------- | ------------------------------- |
| `locale`            | string                            | "en", "fr", "es", "de"          |
| `timezone`          | string                            | "UTC", "America/New_York", etc. |
| `currency`          | string                            | "USD", "EUR", "GBP", "JPY"      |
| `dateFormat`        | string                            | "yyyy-MM-dd", "dd/MM/yyyy"      |
| `timeFormat`        | string                            | "HH:mm:ss", "hh:mm a"           |
| `theme`             | "light" \| "dark" \| "auto"       | -                               |
| `profilePhotoUrl`   | string \| null                    | URL string                      |
| `phoneNumber`       | string \| null                    | Phone number                    |
| `bio`               | string \| null                    | Max 1000 chars                  |
| `notificationEmail` | boolean                           | -                               |
| `notificationSms`   | boolean                           | -                               |
| `notificationPush`  | boolean                           | -                               |
| `twoFactorEnabled`  | boolean                           | -                               |
| `twoFactorMethod`   | "sms" \| "email" \| "app" \| null | -                               |
| `customSettings`    | string \| null                    | JSON string                     |

## 🎯 Common Use Cases

### 1. Theme Toggle Button

```tsx
function ThemeToggle() {
  const theme = useTheme();
  const update = useUpdateUserPreferences();

  const toggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    update.mutate({ theme: newTheme });
  };

  return <Button onClick={toggle}>Toggle Theme</Button>;
}
```

### 2. Language Selector

```tsx
function LanguageSelector() {
  const locale = useLocale();
  const update = useUpdateUserPreferences();

  return (
    <Select
      value={locale}
      onChange={(value) => update.mutate({ locale: value })}
      data={[
        { value: "en", label: "English" },
        { value: "fr", label: "Français" },
      ]}
    />
  );
}
```

### 3. Notification Toggle

```tsx
function NotificationToggle() {
  const { email } = useNotificationSettings();
  const update = useUpdateUserPreferences();

  return (
    <Switch
      checked={email}
      onChange={(e) =>
        update.mutate({ notificationEmail: e.currentTarget.checked })
      }
      label="Email Notifications"
    />
  );
}
```

### 4. Profile Photo Upload

```tsx
function ProfilePhotoUpload() {
  const update = useUpdateUserPreferences();

  const handleUpload = async (file: File) => {
    const url = await uploadFile(file); // Your upload logic
    update.mutate({ profilePhotoUrl: url });
  };

  return <FileInput onChange={handleUpload} />;
}
```

### 5. Custom Settings

```tsx
function SaveCustomSettings() {
  const update = useUpdateUserPreferences();

  const saveSettings = () => {
    const settings = {
      sidebar: "collapsed",
      fontSize: 14,
      autoSave: true,
    };

    update.mutate({
      customSettings: JSON.stringify(settings),
    });
  };

  return <Button onClick={saveSettings}>Save Settings</Button>;
}
```

## 🧪 Testing Examples

### Test Hook

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { useUserPreferences } from "@/entities/user";

test("fetches preferences", async () => {
  const { result } = renderHook(() => useUserPreferences(), {
    wrapper: QueryClientWrapper,
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

### Test Component

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickThemeSwitcher } from "@/features/user-preferences";

test("switches theme", async () => {
  render(<QuickThemeSwitcher />);

  const darkButton = screen.getByText("Dark");
  fireEvent.click(darkButton);

  await screen.findByText("Preferences Updated");
});
```

## 🔗 Related Routes

- `/user-preferences` - Simple preferences page
- `/preferences-demo` - Full demo with examples

## 📚 Documentation Links

- [Full Integration Guide](../../../USER_PREFERENCES_INTEGRATION.md)
- [Feature README](./README.md)
- [Backend API Docs](../../../../../USER_PREFERENCE_API.md)

## 💡 Tips

1. **Use hooks over direct API calls** for automatic caching
2. **Handle loading states** to improve UX
3. **Show error messages** when operations fail
4. **Confirm destructive actions** like reset
5. **Validate input** before submitting
6. **Use custom hooks** for specific values to avoid unnecessary re-renders

## ⚠️ Common Mistakes

❌ **Don't** call API directly in components

```tsx
// Bad
const preferences = await userPreferenceApi.getMyPreferences();
```

✅ **Do** use hooks

```tsx
// Good
const { data: preferences } = useUserPreferences();
```

❌ **Don't** forget loading states

```tsx
// Bad
return <div>{preferences.theme}</div>;
```

✅ **Do** handle loading

```tsx
// Good
if (isLoading) return <Loader />;
return <div>{preferences?.theme}</div>;
```

❌ **Don't** mutate without error handling

```tsx
// Bad
updateMutation.mutate({ theme: "dark" });
```

✅ **Do** handle errors

```tsx
// Good
const updateMutation = useUpdateUserPreferences();
// Errors are handled automatically with notifications
```

## 🎉 That's It!

You now have everything you need to work with user preferences. Happy coding! 🚀
