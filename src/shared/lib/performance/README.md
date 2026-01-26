# Performance Optimization Guide

This directory contains performance monitoring and optimization utilities for the application.

## Features

### 1. Virtualized List (`VirtualizedList`)

- Virtual scrolling for large datasets
- Only renders visible items plus buffer
- Infinite scroll support
- Automatic viewport calculation

**Usage:**

```tsx
import { VirtualizedList } from "@/shared/ui";

<VirtualizedList
  items={items}
  renderItem={(item) => <ItemCard item={item} />}
  itemHeight={120}
  hasMore={hasMore}
  onLoadMore={loadMore}
/>;
```

### 2. Lazy Loading (`LazyLoad`)

- Intersection Observer based lazy loading
- Only renders when entering viewport
- Configurable threshold and root margin
- Optional skeleton placeholder

**Usage:**

```tsx
import { LazyLoad } from "@/shared/ui";

<LazyLoad height={600} threshold={0.1}>
  <ComponentToLazyLoad />
</LazyLoad>;
```

### 3. Progressive Loading (`ProgressiveLoader`)

- Staggered loading animation
- Improves perceived performance
- Smooth fade-in transitions

**Usage:**

```tsx
import { ProgressiveLoader } from "@/shared/ui";

{
  items.map((item, index) => (
    <ProgressiveLoader key={item.id} index={index} isLoading={isLoading}>
      <ItemCard item={item} />
    </ProgressiveLoader>
  ));
}
```

### 4. Performance Monitoring (`performanceMonitor`)

- Track API response times
- Monitor component render times
- Track user interactions
- Performance budgets with warnings

**Usage:**

```tsx
import { usePerformanceMonitor } from "@/shared/lib/performance";

const { trackInteraction, trackMetric } = usePerformanceMonitor();

// Track user interaction
trackInteraction("item_click", "ItemCard", duration);

// Track custom metric
trackMetric("data_processing", duration, { recordCount: 100 });
```

### 5. Performance Tracker Component

- HOC for automatic render tracking
- Tracks component lifecycle
- Reports slow renders

**Usage:**

```tsx
import { withPerformanceTracking } from "@/shared/lib/performance";

export const MyComponent = withPerformanceTracking(({ data }) => {
  return <div>{data}</div>;
}, "MyComponent");
```

### 6. API Performance Interceptor

- Automatic API call tracking
- Measures request duration
- Tracks error rates

**Setup:**

```tsx
import { setupAPIPerformanceMonitoring } from "@/shared/lib/performance";
import axios from "axios";

const apiClient = axios.create({ baseURL: "/api" });
setupAPIPerformanceMonitoring(apiClient);
```

### 7. Performance Dashboard

- Real-time metrics visualization
- Export metrics to JSON
- Budget usage indicators

**Usage:**

```tsx
import { PerformanceDashboard } from "@/shared/ui";

<PerformanceDashboard opened={opened} onClose={close} />;
```

## Performance Budgets

The following performance budgets are enforced:

- **API Response**: 1000ms (1 second)
- **Component Render**: 100ms
- **Page Load**: 3000ms (3 seconds)
- **User Interaction**: 50ms

Exceeding these budgets will trigger console warnings in development mode.

## Skeleton Loaders

Skeleton loaders are available for major application components:

- `TableSkeleton` - For data table pages
- `DetailSkeleton` - For detail pages
- `DashboardSkeleton` - For dashboard widgets

**Usage:**

```tsx
import { LoadingState } from "@/shared/ui";

{
  isLoading ? (
    <LoadingState.TableSkeleton count={5} />
  ) : (
    <DataTable data={data} />
  );
}
```

## Best Practices

1. **Use virtualization for lists > 50 items**
2. **Lazy load off-screen content**
3. **Implement skeleton loaders for all async content**
4. **Track performance in production** (with sampling)
5. **Monitor performance budgets** regularly
6. **Use progressive loading for dashboard widgets**
7. **Prefetch adjacent pages** for pagination

## Requirements Satisfied

- **13.1**: Virtual scrolling for large datasets
- **13.2**: Lazy loading for components
- **13.3**: Pagination optimization
- **13.4**: Skeleton loaders matching content layout
- **13.6**: Optimistic updates for better perceived performance
- **13.7**: Performance monitoring and budgets
