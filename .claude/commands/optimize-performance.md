Analyze and optimize application performance using React 19 patterns, proper memoization, and bundle optimization techniques.

## Performance Analysis

1. Use react-architect to identify rendering performance issues
2. Use typescript-pro to optimize type inference and compilation
3. Use ui-specialist to check component efficiency and accessibility impact
4. Use fsd-enforcer to ensure architectural efficiency

## Optimization Areas

### React Performance

- **Re-render Optimization**: Implement proper memoization patterns
- **Concurrent Features**: Use Suspense, useTransition, useDeferredValue
- **Bundle Splitting**: Code splitting at route and component level
- **State Management**: Optimize state updates and subscriptions

### TypeScript Performance

- **Compilation Speed**: Optimize tsconfig and type inference
- **Bundle Size**: Tree shaking and dead code elimination
- **Type Complexity**: Simplify complex type operations
- **Import Optimization**: Reduce circular dependencies

### UI Performance

- **Loading States**: Implement progressive loading patterns
- **Image Optimization**: Lazy loading and responsive images
- **Animation Performance**: Use CSS transforms and GPU acceleration
- **Accessibility Performance**: Optimize screen reader interactions

## Implementation Strategies

### React 19 Concurrent Features

```typescript
// ✅ Use Suspense for data fetching
function UserDashboard() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<DashboardSkeleton />}>
        <UserStatistics />
      </Suspense>

      <Suspense fallback={<UserListSkeleton />}>
        <UserList />
      </Suspense>
    </ErrorBoundary>
  );
}

// ✅ Use useTransition for non-urgent updates
function UserSearch({ users }: { users: User[] }) {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(deferredQuery.toLowerCase())
    );
  }, [users, deferredQuery]);

  const handleSearch = (value: string) => {
    startTransition(() => setQuery(value));
  };

  return (
    <div>
      <TextInput
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        rightSection={isPending ? <Loader size="xs" /> : null}
      />
      <UserList users={filteredUsers} />
    </div>
  );
}
```

### Memoization Patterns

```typescript
// ✅ Proper component memoization
export const UserCard = memo<UserCardProps>(
  ({ user, onEdit, onDelete }) => {
    const handleEdit = useCallback(() => onEdit(user), [user, onEdit]);
    const handleDelete = useCallback(() => onDelete(user.id), [user.id, onDelete]);

    return (
      <Card>
        <Text>{user.name}</Text>
        <Group>
          <Button onClick={handleEdit}>Edit</Button>
          <Button onClick={handleDelete}>Delete</Button>
        </Group>
      </Card>
    );
  },
  // Custom comparison for better performance
  (prevProps, nextProps) => {
    return (
      prevProps.user.id === nextProps.user.id &&
      prevProps.user.updatedAt === nextProps.user.updatedAt
    );
  }
);

// ✅ Expensive computation memoization
function UserAnalytics({ users }: { users: User[] }) {
  const analytics = useMemo(() => {
    return computeExpensiveAnalytics(users);
  }, [users]);

  const chartData = useMemo(() => {
    return transformDataForChart(analytics);
  }, [analytics]);

  return <AnalyticsChart data={chartData} />;
}
```

### Code Splitting Strategies

```typescript
// ✅ Route-level code splitting
const UserManagementPage = lazy(() => import("@/pages/user-management"));
const DashboardPage = lazy(() => import("@/pages/dashboard"));
const SettingsPage = lazy(() => import("@/pages/settings"));

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route
          path="/users"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <UserManagementPage />
            </Suspense>
          }
        />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<PageSkeleton />}>
              <DashboardPage />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

// ✅ Component-level code splitting
const HeavyChart = lazy(() => import("./heavy-chart"));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);

  return (
    <div>
      <Button onClick={() => setShowChart(true)}>
        Load Analytics
      </Button>

      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

### TanStack Query Optimization

```typescript
// ✅ Optimized query patterns
export function useUsersQuery(params?: UserQueryParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const response = await api.get("/users", { params });
      return usersResponseSchema.parse(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // Reduce unnecessary refetches
    select: (data) => data.users, // Transform data efficiently
  });
}

// ✅ Optimistic updates
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onMutate: async (updatedUser) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["users"] });

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData(["users"]);

      // Optimistically update
      queryClient.setQueryData(["users"], (old: User[]) =>
        old.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );

      return { previousUsers };
    },
    onError: (err, updatedUser, context) => {
      // Rollback on error
      queryClient.setQueryData(["users"], context?.previousUsers);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

### Bundle Optimization

```typescript
// ✅ Tree shaking optimization
// Import only what you need
import { Button } from "@mantine/core";
// Instead of: import * as Mantine from "@mantine/core";

// ✅ Dynamic imports for heavy libraries
async function loadChartLibrary() {
  const { Chart } = await import("chart.js");
  return Chart;
}

// ✅ Webpack bundle analysis
// Add to package.json scripts:
// "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
```

## Performance Monitoring

### Metrics to Track

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms
- **Time to Interactive (TTI)**: < 3.8s

### React DevTools Profiling

```typescript
// ✅ Performance profiling in development
function ProfiledComponent() {
  return (
    <Profiler
      id="UserList"
      onRender={(id, phase, actualDuration) => {
        if (actualDuration > 16) { // > 1 frame at 60fps
          console.warn(`Slow render: ${id} took ${actualDuration}ms`);
        }
      }}
    >
      <UserList />
    </Profiler>
  );
}
```

### Performance Testing

```typescript
// ✅ Performance tests
describe("UserList Performance", () => {
  it("renders 1000 users within performance budget", async () => {
    const users = generateMockUsers(1000);
    const startTime = performance.now();

    render(<UserList users={users} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(renderTime).toBeLessThan(100); // 100ms budget
  });

  it("handles rapid filter changes without blocking", async () => {
    const users = generateMockUsers(1000);
    render(<UserSearch users={users} />);

    const input = screen.getByRole("textbox");

    // Rapid typing simulation
    for (let i = 0; i < 10; i++) {
      await userEvent.type(input, "a");
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    }
  });
});
```

## Optimization Checklist

### React Performance

- [ ] Components properly memoized with React.memo
- [ ] Event handlers stable with useCallback
- [ ] Expensive computations memoized with useMemo
- [ ] Suspense boundaries for data fetching
- [ ] useTransition for non-urgent updates
- [ ] Code splitting at route level
- [ ] Lazy loading for heavy components

### Bundle Optimization

- [ ] Tree shaking enabled and working
- [ ] Dynamic imports for large libraries
- [ ] Bundle analysis performed
- [ ] Unused dependencies removed
- [ ] Import statements optimized

### Data Fetching

- [ ] TanStack Query properly configured
- [ ] Appropriate stale times set
- [ ] Optimistic updates implemented
- [ ] Query invalidation optimized
- [ ] Background refetching controlled

### UI Performance

- [ ] Loading states implemented
- [ ] Skeleton screens for better perceived performance
- [ ] Images optimized and lazy loaded
- [ ] Animations use CSS transforms
- [ ] Accessibility performance considered

The optimization should result in improved user experience with faster load times, smoother interactions, and better perceived performance.
