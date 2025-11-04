# Kubernetes ConfigMap Configuration

This document describes how to configure the React 19 application using Kubernetes ConfigMaps through the `public/config.js` file.

## Overview

The application supports runtime configuration through a JavaScript configuration file (`public/config.js`) that can be mounted as a Kubernetes ConfigMap. This allows you to modify application behavior without rebuilding the Docker image.

### Configuration System Architecture

The application uses a layered configuration system:

1. **Build-time Environment Variables** - Set during `vite build`
2. **Runtime Configuration** - Loaded from `public/config.js` via `window` globals
3. **Application Config** - Merged configuration accessible throughout the app

```typescript
// Configuration resolution order (highest priority first):
window.VITE_* → import.meta.env.VITE_* → fallback values
```

## Supported Configuration Variables

### Core Application Settings

| Variable              | Type   | Default                 | Description                                                        |
| --------------------- | ------ | ----------------------- | ------------------------------------------------------------------ |
| `VITE_API_URL_SERVER` | string | `http://localhost:3000` | Backend API base URL                                               |
| `VITE_LOG_LEVEL`      | string | `info`                  | Application log level (`silent`, `error`, `warn`, `info`, `debug`) |

### Authentication Configuration

| Variable                          | Type   | Default                 | Description                           |
| --------------------------------- | ------ | ----------------------- | ------------------------------------- |
| `VITE_AUTH_DOMAIN_AUTH`           | string | `http://localhost:5173` | Authentication service domain         |
| `VITE_AUTH_DOMAIN_APP`            | string | `http://localhost:5173` | Application domain for auth callbacks |
| `VITE_AUTH_REDIRECT_AFTER_LOGIN`  | string | `/`                     | Redirect path after successful login  |
| `VITE_AUTH_REDIRECT_AFTER_LOGOUT` | string | `/auth/login`           | Redirect path after logout            |
| `VITE_AUTH_REDIRECT_AFTER_SIGNUP` | string | `/auth/verify-email`    | Redirect path after signup            |

### Development & Testing

| Variable          | Type   | Default | Description                                |
| ----------------- | ------ | ------- | ------------------------------------------ |
| `VITE_ENABLE_MSW` | string | `false` | Enable Mock Service Worker for API mocking |

## Configuration File Structure

### Example `config.js`

```javascript
// Production configuration
window.VITE_API_URL_SERVER = "https://api.production.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "warn";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.production.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.production.com";
window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/dashboard";
window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
```

### Environment-Specific Examples

#### Development Environment

```javascript
window.VITE_API_URL_SERVER = "https://api.dev.example.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "debug";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.dev.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.dev.example.com";
```

#### Staging Environment

```javascript
window.VITE_API_URL_SERVER = "https://api.staging.example.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "info";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.staging.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.staging.example.com";
```

#### Production Environment

```javascript
window.VITE_API_URL_SERVER = "https://api.example.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "warn";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.example.com";
```

## Kubernetes ConfigMap Setup

### 1. Create ConfigMap from File

```bash
# Create config.js file
cat > config.js << EOF
window.VITE_API_URL_SERVER = "https://api.production.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "warn";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.production.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.production.com";
window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/dashboard";
window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
EOF

# Create ConfigMap
kubectl create configmap react-app-config --from-file=config.js=config.js
```

### 2. Create ConfigMap from YAML

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: react-app-config
  namespace: default
data:
  config.js: |
    window.VITE_API_URL_SERVER = "https://api.production.com";
    window.VITE_ENABLE_MSW = "false";
    window.VITE_LOG_LEVEL = "warn";
    window.VITE_AUTH_DOMAIN_AUTH = "https://auth.production.com";
    window.VITE_AUTH_DOMAIN_APP = "https://app.production.com";
    window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/dashboard";
    window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
    window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
```

```bash
kubectl apply -f configmap.yaml
```

### 3. Deployment Configuration

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: react-app
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: react-app
  template:
    metadata:
      labels:
        app: react-app
    spec:
      containers:
        - name: react-app
          image: your-registry/react-app:latest
          ports:
            - containerPort: 80
          volumeMounts:
            - name: config-volume
              mountPath: /usr/share/nginx/html/config.js
              subPath: config.js
              readOnly: true
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
      volumes:
        - name: config-volume
          configMap:
            name: react-app-config
            items:
              - key: config.js
                path: config.js
---
apiVersion: v1
kind: Service
metadata:
  name: react-app-service
  namespace: default
spec:
  selector:
    app: react-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

## Docker Configuration

### Dockerfile for Kubernetes

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create placeholder config.js (will be overridden by ConfigMap)
RUN echo '// Placeholder - will be overridden by ConfigMap' > /usr/share/nginx/html/config.js

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Don't cache config.js - it should be fresh from ConfigMap
        location = /config.js {
            expires -1;
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # SPA fallback - serve index.html for all routes
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
}
```

## Helm Chart Configuration

### Chart.yaml

```yaml
apiVersion: v2
name: react-app
description: A React 19 application with ConfigMap configuration
type: application
version: 0.1.0
appVersion: "1.0.0"
```

### values.yaml

```yaml
# Default values for react-app
replicaCount: 3

image:
  repository: your-registry/react-app
  pullPolicy: IfNotPresent
  tag: "latest"

nameOverride: ""
fullnameOverride: ""

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: false
  className: ""
  annotations: {}
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: Prefix
  tls: []

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80

# Application configuration
config:
  apiUrl: "https://api.production.com"
  enableMSW: "false"
  logLevel: "warn"
  auth:
    domainAuth: "https://auth.production.com"
    domainApp: "https://app.production.com"
    redirectAfterLogin: "/dashboard"
    redirectAfterLogout: "/auth/login"
    redirectAfterSignup: "/auth/verify-email"
```

### templates/configmap.yaml

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ include "react-app.fullname" . }}-config
  labels:
    {{- include "react-app.labels" . | nindent 4 }}
data:
  config.js: |
    window.VITE_API_URL_SERVER = "{{ .Values.config.apiUrl }}";
    window.VITE_ENABLE_MSW = "{{ .Values.config.enableMSW }}";
    window.VITE_LOG_LEVEL = "{{ .Values.config.logLevel }}";
    window.VITE_AUTH_DOMAIN_AUTH = "{{ .Values.config.auth.domainAuth }}";
    window.VITE_AUTH_DOMAIN_APP = "{{ .Values.config.auth.domainApp }}";
    window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "{{ .Values.config.auth.redirectAfterLogin }}";
    window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "{{ .Values.config.auth.redirectAfterLogout }}";
    window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "{{ .Values.config.auth.redirectAfterSignup }}";
```

### templates/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "react-app.fullname" . }}
  labels:
    {{- include "react-app.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "react-app.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
      labels:
        {{- include "react-app.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
          volumeMounts:
            - name: config-volume
              mountPath: /usr/share/nginx/html/config.js
              subPath: config.js
              readOnly: true
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
      volumes:
        - name: config-volume
          configMap:
            name: {{ include "react-app.fullname" . }}-config
            items:
            - key: config.js
              path: config.js
```

## Environment-Specific Deployments

### Development Environment

```bash
# Create development ConfigMap
kubectl create configmap react-app-config-dev \
  --from-literal=config.js='
window.VITE_API_URL_SERVER = "https://api.dev.example.com";
window.VITE_ENABLE_MSW = "true";
window.VITE_LOG_LEVEL = "debug";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.dev.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.dev.example.com";
window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/";
window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
' \
  --namespace=development
```

### Staging Environment

```bash
# Create staging ConfigMap
kubectl create configmap react-app-config-staging \
  --from-literal=config.js='
window.VITE_API_URL_SERVER = "https://api.staging.example.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "info";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.staging.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.staging.example.com";
window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/dashboard";
window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
' \
  --namespace=staging
```

### Production Environment

```bash
# Create production ConfigMap
kubectl create configmap react-app-config-prod \
  --from-literal=config.js='
window.VITE_API_URL_SERVER = "https://api.example.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "warn";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.example.com";
window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/dashboard";
window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
' \
  --namespace=production
```

## Configuration Management

### Updating Configuration

```bash
# Method 1: Update ConfigMap directly
kubectl patch configmap react-app-config -p '{"data":{"config.js":"window.VITE_API_URL_SERVER = \"https://new-api.example.com\";\nwindow.VITE_LOG_LEVEL = \"info\";\n"}}'

# Method 2: Replace from file
kubectl create configmap react-app-config --from-file=config.js=new-config.js --dry-run=client -o yaml | kubectl replace -f -

# Method 3: Using Helm (recommended)
helm upgrade react-app ./react-app-chart --set config.apiUrl=https://new-api.example.com
```

### Rolling Restart After Config Changes

```bash
# Restart deployment to pick up new configuration
kubectl rollout restart deployment/react-app

# Check rollout status
kubectl rollout status deployment/react-app
```

### Configuration Validation

```bash
# Verify ConfigMap content
kubectl get configmap react-app-config -o yaml

# Check if config.js is properly mounted
kubectl exec -it deployment/react-app -- cat /usr/share/nginx/html/config.js

# Test configuration in browser
kubectl port-forward service/react-app-service 8080:80
# Open http://localhost:8080 and check browser console for config values
```

## Monitoring and Troubleshooting

### Health Checks

The application includes health check endpoints that can be used with Kubernetes probes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health
    port: 80
  initialDelaySeconds: 5
  periodSeconds: 5
```

### Common Issues

#### Configuration Not Loading

**Symptoms:**

- Application uses default/build-time values instead of ConfigMap values
- Browser console shows undefined config values

**Solutions:**

```bash
# Check if ConfigMap exists and has correct data
kubectl get configmap react-app-config -o yaml

# Verify volume mount in pod
kubectl describe pod -l app=react-app

# Check if config.js is accessible
kubectl exec -it deployment/react-app -- ls -la /usr/share/nginx/html/config.js
kubectl exec -it deployment/react-app -- cat /usr/share/nginx/html/config.js
```

#### Configuration Changes Not Applied

**Symptoms:**

- Updated ConfigMap but application still uses old values
- Browser cache shows old configuration

**Solutions:**

```bash
# Force pod restart to reload configuration
kubectl rollout restart deployment/react-app

# Clear browser cache or use incognito mode
# Check config.js cache headers in nginx configuration
```

#### Permission Issues

**Symptoms:**

- Pod fails to start with mount errors
- ConfigMap volume mount fails

**Solutions:**

```bash
# Check pod events for mount errors
kubectl describe pod -l app=react-app

# Verify ConfigMap exists in correct namespace
kubectl get configmap -n <namespace>

# Check RBAC permissions for service account
kubectl auth can-i get configmaps --as=system:serviceaccount:<namespace>:<service-account>
```

### Logging and Debugging

```bash
# Check application logs
kubectl logs -f deployment/react-app

# Check nginx access logs
kubectl exec -it deployment/react-app -- tail -f /var/log/nginx/access.log

# Check nginx error logs
kubectl exec -it deployment/react-app -- tail -f /var/log/nginx/error.log

# Debug configuration loading
kubectl exec -it deployment/react-app -- sh
# Inside container:
# curl http://localhost/config.js
# cat /usr/share/nginx/html/config.js
```

## Security Considerations

### ConfigMap Security

1. **Sensitive Data**: Never store secrets in ConfigMaps (use Kubernetes Secrets instead)
2. **RBAC**: Limit access to ConfigMaps using Role-Based Access Control
3. **Namespace Isolation**: Use separate namespaces for different environments
4. **Audit Logging**: Enable audit logging for ConfigMap changes

### Example RBAC Configuration

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: configmap-reader
rules:
  - apiGroups: [""]
    resources: ["configmaps"]
    verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-configmaps
  namespace: production
subjects:
  - kind: ServiceAccount
    name: react-app-service-account
    namespace: production
roleRef:
  kind: Role
  name: configmap-reader
  apiGroup: rbac.authorization.k8s.io
```

## Best Practices

### 1. Configuration Management

- **Version Control**: Store ConfigMap YAML files in version control
- **Environment Separation**: Use different ConfigMaps for each environment
- **Validation**: Validate configuration syntax before applying
- **Documentation**: Document all configuration variables and their purposes

### 2. Deployment Strategy

- **Rolling Updates**: Use rolling updates to apply configuration changes
- **Health Checks**: Implement proper health checks to verify application startup
- **Rollback Plan**: Have a rollback strategy for configuration changes
- **Testing**: Test configuration changes in non-production environments first

### 3. Monitoring

- **Configuration Drift**: Monitor for unauthorized configuration changes
- **Application Metrics**: Track application behavior after configuration changes
- **Log Analysis**: Monitor logs for configuration-related errors
- **Alerting**: Set up alerts for configuration loading failures

### 4. Security

- **Least Privilege**: Grant minimal necessary permissions for ConfigMap access
- **Audit Trail**: Maintain audit logs for configuration changes
- **Secrets Management**: Use Kubernetes Secrets for sensitive configuration
- **Network Policies**: Implement network policies to restrict access

## Example CI/CD Integration

### GitOps with ArgoCD

```yaml
# argocd-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: react-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/react-app-config
    targetRevision: HEAD
    path: k8s/overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

### Kustomization Example

```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
  - ../../base

patchesStrategicMerge:
  - configmap-patch.yaml

images:
  - name: react-app
    newTag: v1.2.3
```

```yaml
# configmap-patch.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: react-app-config
data:
  config.js: |
    window.VITE_API_URL_SERVER = "https://api.production.com";
    window.VITE_ENABLE_MSW = "false";
    window.VITE_LOG_LEVEL = "warn";
    window.VITE_AUTH_DOMAIN_AUTH = "https://auth.production.com";
    window.VITE_AUTH_DOMAIN_APP = "https://app.production.com";
    window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/dashboard";
    window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
    window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
```

This configuration system provides a robust, scalable way to manage React application configuration in Kubernetes environments while maintaining security and operational best practices.
