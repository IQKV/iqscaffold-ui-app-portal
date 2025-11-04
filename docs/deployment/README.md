# 📜 Deployment Guide

## Quick Deployment

### Prerequisites

- Node.js 18+ and pnpm
- Docker (optional)
- Git

### Build for Production

```bash
# Install dependencies
pnpm install

# Build application
pnpm build

# Preview build locally
pnpm preview
```

## Deployment Options

### 1. Static Hosting (Vercel/Netlify)

**Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Netlify:**

```bash
# Build command: pnpm build
# Publish directory: dist
# Node version: 18
```

### 2. Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build and run
docker build -t my-app .
docker run -p 80:80 my-app
```

### 3. Node.js Server

```javascript
// server.js
import express from "express";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

## Configuration

### Runtime Configuration

The application supports runtime configuration through `public/config.js` for containerized deployments:

- **[Runtime Configuration Guide](./runtime-configuration.md)** - Configure the app without rebuilding
- **[Kubernetes ConfigMap Guide](./kubernetes-configmap.md)** - Complete K8s deployment with ConfigMaps

### Environment Variables

```bash
# Build-time environment variables
NODE_ENV=production
VITE_API_URL_SERVER=https://api.yourdomain.com
VITE_AUTH_DOMAIN_AUTH=https://auth.yourdomain.com
VITE_AUTH_DOMAIN_APP=https://app.yourdomain.com
VITE_ENABLE_MSW=false
VITE_LOG_LEVEL=warn
```

### Quick Runtime Config Example

```javascript
// public/config.js - overrides build-time values
window.VITE_API_URL_SERVER = "https://api.production.com";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.production.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.production.com";
window.VITE_LOG_LEVEL = "error";
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm build
      - run: pnpm test

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: "--prod"
```

## Performance Optimization

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@mantine/core", "@mantine/hooks"],
        },
      },
    },
  },
});
```

### Nginx Configuration

```nginx
# nginx.conf
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # Gzip compression
  gzip on;
  gzip_types text/css application/javascript application/json;

  # Cache static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Monitoring & Health Checks

### Health Check Endpoint

```typescript
// Add to your API
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION,
  });
});
```

### Error Tracking

```typescript
// Add error reporting service
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Security Headers

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

## Troubleshooting

**Build fails:**

- Check Node.js version (18+)
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check TypeScript errors: `pnpm type-check`

**Runtime errors:**

- Verify environment variables
- Check browser console for errors
- Ensure API endpoints are accessible

**Performance issues:**

- Enable gzip compression
- Optimize bundle size with `pnpm build --analyze`
- Use CDN for static assets
